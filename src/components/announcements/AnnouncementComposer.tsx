"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Modal } from "@/components/playlists/Modal";
import usePlayerStore from "@/store/usePlayerStore";
import {
  EVERY_MINUTES,
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
  MAX_MESSAGE,
  MAX_TITLE,
  RECORDING_LIMITS,
  VOLUME_BOOSTS,
  announcementVolume,
  parseTime,
  toTimeValue,
} from "@/lib/announcements";
import { DAYS } from "@/lib/schedule";
import { englishVoices, speak, speechSupported } from "@/lib/speech";
import { cn, formatDuration } from "@/lib/utils";

type Source = "ai" | "record" | "upload";

/** A voiceover picked or recorded in this session, not uploaded yet. */
interface PendingAudio {
  blob: Blob;
  url: string;
  name: string;
  seconds: number;
}

const SOURCES: { id: Source; label: string; detail: string }[] = [
  { id: "ai", label: "AI voice", detail: "Type a script" },
  { id: "record", label: "Record voiceover", detail: "Use your microphone" },
  { id: "upload", label: "Upload voiceover", detail: "Add a short audio file" },
];

const field =
  "w-full px-3 py-2.5 bg-card border border-white/[0.08] rounded-lg text-xs text-foreground placeholder:text-faint outline-none focus:ring-2 focus:ring-primary/40 transition";
const label = "block mb-1.5 text-[9px] font-bold text-muted-foreground";
const choice = (active: boolean) =>
  cn(
    "text-left rounded-lg border transition-colors",
    active ? "border-primary bg-primary/10" : "border-white/[0.07] bg-card hover:border-white/15",
  );
const primary =
  "px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-extrabold hover:opacity-90 transition-opacity disabled:opacity-45 disabled:cursor-not-allowed";
const secondary =
  "px-3 py-[9px] rounded-lg border border-white/10 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-45 disabled:cursor-not-allowed";

/** Reads an audio blob's length in seconds, or null if the browser can't decode it. */
function audioSeconds(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.onloadedmetadata = () =>
      resolve(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null);
    audio.onerror = () => resolve(null);
  });
}

interface AnnouncementComposerProps {
  /** The announcement being edited, or undefined to create one. */
  editing?: Doc<"announcements"> & { audioUrl: string | null };
  onClose: () => void;
  /** Called with the saved status and days, so the list can switch to the right tab. */
  onSaved: (status: "scheduled" | "draft", days: string[]) => void;
}

export function AnnouncementComposer({ editing, onClose, onSaved }: AnnouncementComposerProps) {
  const generateUploadUrl = useMutation(api.announcements.generateUploadUrl);
  const create = useMutation(api.announcements.create);
  const update = useMutation(api.announcements.update);

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [source, setSource] = useState<Source>(editing?.source ?? "ai");
  const [message, setMessage] = useState(editing?.message ?? "");
  const [voiceName, setVoiceName] = useState(editing?.voiceName ?? "");
  const [pitch, setPitch] = useState(editing?.pitch ?? 50);
  const [speed, setSpeed] = useState(editing?.speed ?? 50);
  const [volumeBoost, setVolumeBoost] = useState(editing?.volumeBoost ?? 4);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewing, setPreviewing] = useState(false);

  const [recordingLimit, setRecordingLimit] = useState<number>(30);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState<PendingAudio | null>(null);
  const [uploaded, setUploaded] = useState<PendingAudio | null>(null);
  const [audioError, setAudioError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timersRef = useRef<number[]>([]);
  const previewRef = useRef<{ cancel: () => void } | null>(null);

  const [days, setDays] = useState<string[]>(editing?.days.length ? editing.days : ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [occurrence, setOccurrence] = useState(editing?.occurrence ?? "once");
  const [playAt, setPlayAt] = useState(toTimeValue(editing?.startMinute ?? 17 * 60));
  const [playTo, setPlayTo] = useState(toTimeValue(editing?.endMinute ?? 19 * 60));
  const [everyMinutes, setEveryMinutes] = useState<number>(editing?.everyMinutes ?? 30);
  const [interruptMusic, setInterruptMusic] = useState(editing?.interruptMusic ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The edited announcement's saved voiceover still counts until replaced.
  const existingAudio = editing?.source === source && editing.audioUrl ? editing : null;
  const pending = source === "record" ? recorded : source === "upload" ? uploaded : null;
  const ready = Boolean(
    title.trim() && (source === "ai" ? message.trim() : pending || existingAudio) && !recording,
  );
  const windowValid = occurrence === "once" || parseTime(playTo) > parseTime(playAt);

  // Voices load asynchronously in Chrome; `voiceschanged` fires when they arrive.
  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => setVoices(englishVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Free object URLs when they're replaced or the composer closes.
  useEffect(() => () => recorded && URL.revokeObjectURL(recorded.url), [recorded]);
  useEffect(() => () => uploaded && URL.revokeObjectURL(uploaded.url), [uploaded]);

  // Release the microphone and stop any preview if the composer closes mid-way.
  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      streamRef.current?.getTracks().forEach((t) => t.stop());
      previewRef.current?.cancel();
    },
    [],
  );

  function stopRecording() {
    timersRef.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timersRef.current = [];
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRecording(false);
  }

  async function startRecording() {
    setAudioError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setAudioError("Voice recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const startedAt = Date.now();
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = () => {
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const seconds = Math.min(recordingLimit, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
        setRecorded({ blob, url: URL.createObjectURL(blob), name: "Recorded voiceover", seconds });
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecorded(null);
      setElapsed(0);
      setRecording(true);
      timersRef.current = [
        window.setInterval(() => setElapsed((s) => Math.min(s + 1, recordingLimit)), 1000),
        window.setTimeout(stopRecording, recordingLimit * 1000),
      ];
    } catch {
      setAudioError("Microphone access was blocked. Allow access and try again.");
      stopRecording();
    }
  }

  async function pickFile(file?: File) {
    setAudioError("");
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setAudioError("Choose an audio file such as MP3, WAV, M4A, or WebM.");
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setAudioError("The audio file must be smaller than 10 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    const seconds = await audioSeconds(url);
    if (seconds === null || seconds > MAX_AUDIO_SECONDS) {
      URL.revokeObjectURL(url);
      setAudioError(
        seconds === null
          ? "We could not read this audio file."
          : `Keep uploaded voiceovers to ${MAX_AUDIO_SECONDS} seconds or less.`,
      );
      return;
    }
    setUploaded({ blob: file, url, name: file.name, seconds: Math.ceil(seconds) });
  }

  function preview() {
    if (previewing) {
      previewRef.current?.cancel();
      return;
    }
    if (!message.trim()) return;
    setPreviewing(true);
    const volume = announcementVolume(usePlayerStore.getState().volume, volumeBoost);
    const speech = speak(message.trim(), { voiceName, pitch, speed, volume });
    previewRef.current = speech;
    speech.done.then(() => setPreviewing(false));
  }

  async function save(status: "scheduled" | "draft") {
    if (!ready || saving) return;
    setSaving(true);
    setError("");
    try {
      // Upload a new voiceover first: Convex storage takes the file over plain
      // HTTP and hands back an id, which is what the announcement stores.
      let storageId: Id<"_storage"> | undefined;
      if (pending) {
        const res = await fetch(await generateUploadUrl(), {
          method: "POST",
          headers: { "Content-Type": pending.blob.type || "audio/webm" },
          body: pending.blob,
        });
        if (!res.ok) throw new Error("upload failed");
        storageId = (await res.json()).storageId;
      }

      const values = {
        title: title.trim(),
        source,
        message: source === "ai" ? message.trim() : undefined,
        storageId,
        audioName: pending?.name,
        audioSeconds: pending?.seconds,
        voiceName: source === "ai" && voiceName ? voiceName : undefined,
        pitch,
        speed,
        volumeBoost,
        status,
        days,
        occurrence,
        startMinute: parseTime(playAt),
        endMinute: occurrence === "multiple" ? parseTime(playTo) : undefined,
        everyMinutes: occurrence === "multiple" ? everyMinutes : undefined,
        interruptMusic,
      };
      if (editing) await update({ id: editing._id, ...values });
      else await create(values);
      onSaved(status, days);
    } catch (err) {
      // ConvexError messages are written for users; anything else is not.
      setError(
        err instanceof ConvexError ? String(err.data) : "Couldn't save the announcement. Please try again.",
      );
      setSaving(false);
    }
  }

  function close() {
    stopRecording();
    onClose();
  }

  return (
    <Modal
      title={editing ? "Edit announcement" : "New announcement"}
      onClose={close}
      className="bg-secondary border-white/[0.08] max-w-[560px] max-h-[85vh] overflow-y-auto"
    >
      {/* Steps */}
      <div className="flex items-center gap-2 mb-[18px]">
        {([1, 2] as const).map((n) => (
          <Fragment key={n}>
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black",
                step >= n ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
              )}
            >
              {n}
            </span>
            <span className={cn("text-[10px] font-bold", step === n ? "text-foreground" : "text-faint")}>
              {n === 1 ? "Create message" : "Schedule"}
            </span>
            {n === 1 && <span className={cn("flex-1 h-px", step === 2 ? "bg-primary/25" : "bg-white/[0.07]")} />}
          </Fragment>
        ))}
      </div>

      {step === 1 ? (
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="text-[17px] font-extrabold text-foreground">Create an announcement</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Turn a short guest message into a venue-ready voice announcement.
            </div>
          </div>

          <label>
            <span className={label}>Campaign title</span>
            <input
              value={title}
              maxLength={MAX_TITLE}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Happy Hour Special"
              autoFocus
              className={field}
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            {SOURCES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={source === option.id}
                onClick={() => {
                  if (recording) stopRecording();
                  previewRef.current?.cancel();
                  setAudioError("");
                  setSource(option.id);
                }}
                className={cn(choice(source === option.id), "px-[11px] py-2.5")}
              >
                <span className="block text-[10px] font-extrabold text-foreground">{option.label}</span>
                <span className="block mt-[3px] text-[8px] text-muted-foreground">{option.detail}</span>
              </button>
            ))}
          </div>

          {source === "ai" && (
            <>
              <label>
                <span className={cn(label, "flex justify-between")}>
                  <span>Message to announce</span>
                  <span className={message.length > MAX_MESSAGE - 20 ? "text-destructive" : "text-faint"}>
                    {message.length}/{MAX_MESSAGE}
                  </span>
                </span>
                <textarea
                  value={message}
                  maxLength={MAX_MESSAGE}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What would you like your guests to hear?"
                  rows={4}
                  className={cn(field, "leading-normal resize-none")}
                />
              </label>

              {speechSupported() ? (
                <>
                  <label>
                    <span className={label}>Voice</span>
                    <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className={cn(field, "text-[11px]")}>
                      <option value="">Device default</option>
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} · {v.lang}
                        </option>
                      ))}
                    </select>
                  </label>

                  {[
                    { name: "Pitch", value: pitch, set: setPitch, low: "Low", high: "High" },
                    { name: "Speed", value: speed, set: setSpeed, low: "Slow", high: "Fast" },
                  ].map((control) => (
                    <label key={control.name}>
                      <span className={cn(label, "flex justify-between mb-[5px]")}>
                        <span>{control.name}</span>
                        <span className="text-primary">{control.value}%</span>
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={control.value}
                        onChange={(e) => control.set(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <span className="flex justify-between text-[8px] text-faint">
                        <span>{control.low}</span>
                        <span>{control.high}</span>
                      </span>
                    </label>
                  ))}
                </>
              ) : (
                <p className="text-[10px] text-destructive">
                  This browser can&apos;t speak announcements. Use Chrome, Edge or Safari on the venue&apos;s
                  player, or record a voiceover instead.
                </p>
              )}
            </>
          )}

          {source === "record" && (
            <div className="p-3.5 rounded-[10px] bg-card border border-white/[0.06]">
              <span className={cn(label, "mb-2")}>Maximum recording time</span>
              <div className="flex gap-[7px] mb-3.5">
                {RECORDING_LIMITS.map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    disabled={recording}
                    onClick={() => {
                      setRecordingLimit(seconds);
                      setElapsed(0);
                      setRecorded(null);
                    }}
                    className={cn(
                      "flex-1 p-2 rounded-[7px] border text-[10px] font-extrabold disabled:cursor-default",
                      recordingLimit === seconds
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/[0.07] bg-secondary text-muted-foreground",
                    )}
                  >
                    {seconds} sec
                  </button>
                ))}
              </div>
              <div className="h-[5px] rounded bg-secondary overflow-hidden mb-3">
                <div
                  className={cn("h-full transition-[width] duration-200", recording ? "bg-destructive" : "bg-primary")}
                  style={{ width: `${Math.min(100, (elapsed / recordingLimit) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  className={cn(
                    "min-w-[116px] px-[13px] py-2.5 rounded-lg text-[10px] font-extrabold",
                    recording ? "bg-destructive text-white" : "bg-primary text-primary-foreground",
                  )}
                >
                  {recording ? "Stop recording" : recorded || existingAudio ? "Record again" : "Start recording"}
                </button>
                <span
                  className={cn(
                    "text-[11px] font-extrabold tabular-nums",
                    recording ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {elapsed ? formatDuration(elapsed) : "0:00"} / {formatDuration(recordingLimit)}
                </span>
                {!recording && (recorded || existingAudio) && (
                  <audio controls src={recorded?.url ?? existingAudio?.audioUrl ?? undefined} className="flex-1 h-8" />
                )}
              </div>
              {audioError ? (
                <p role="alert" className="text-[9px] text-destructive mt-2.5">{audioError}</p>
              ) : (
                !recorded && !recording && (
                  <p className="text-[8px] text-faint mt-2.5">
                    Recording stops automatically at the selected limit. You can stop earlier and review it before
                    continuing.
                  </p>
                )
              )}
            </div>
          )}

          {source === "upload" && (
            <div className="p-3.5 rounded-[10px] bg-card border border-white/[0.06]">
              <div className="text-[11px] font-extrabold text-foreground">Upload a short voiceover</div>
              <div className="text-[8.5px] text-muted-foreground leading-normal mt-1">
                MP3, WAV, M4A, or WebM · up to {MAX_AUDIO_SECONDS} seconds · maximum 10 MB
              </div>
              <label
                className={cn(
                  "flex items-center justify-center min-h-[72px] mt-3 rounded-lg border border-dashed cursor-pointer text-[10px] font-bold",
                  uploaded || existingAudio
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-primary/25 bg-secondary text-muted-foreground",
                )}
              >
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm"
                  onChange={(e) => {
                    pickFile(e.target.files?.[0]);
                    e.target.value = ""; // allow re-picking the same file
                  }}
                  className="hidden"
                />
                {uploaded || existingAudio ? "Choose a different file" : "Choose audio file"}
              </label>
              {(uploaded || existingAudio) && (
                <div className="mt-3 p-2.5 rounded-lg bg-secondary">
                  <div className="flex items-center justify-between gap-2.5 mb-2">
                    <span className="text-[9.5px] font-bold text-foreground truncate">
                      {uploaded?.name ?? existingAudio?.audioName ?? "Voiceover"}
                    </span>
                    <span className="text-[9px] font-extrabold text-primary shrink-0">
                      {uploaded?.seconds ?? existingAudio?.audioSeconds} sec
                    </span>
                  </div>
                  <audio controls src={uploaded?.url ?? existingAudio?.audioUrl ?? undefined} className="w-full h-8" />
                </div>
              )}
              {audioError && <p role="alert" className="text-[9px] text-destructive mt-2.5">{audioError}</p>}
            </div>
          )}

          <div className="flex items-end gap-2.5">
            <label className="flex-1">
              <span className={label}>Volume over music</span>
              <select
                value={volumeBoost}
                onChange={(e) => setVolumeBoost(Number(e.target.value))}
                className={cn(field, "text-[11px]")}
              >
                {VOLUME_BOOSTS.map((db) => (
                  <option key={db} value={db}>
                    {db === 0 ? "Same level" : `+${db} dB`}
                  </option>
                ))}
              </select>
            </label>
            {source === "ai" && speechSupported() && (
              <button
                type="button"
                onClick={preview}
                disabled={!message.trim()}
                className={cn(
                  "px-[13px] py-[9px] rounded-lg border border-primary/25 text-[10px] font-bold transition-colors disabled:opacity-45",
                  previewing ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {previewing ? "Stop preview" : "Preview AI voice"}
              </button>
            )}
          </div>

          {error && <p role="alert" className="text-[10px] text-destructive">{error}</p>}

          <div className="flex justify-between items-center mt-1">
            <button type="button" onClick={() => save("draft")} disabled={!ready || saving} className={secondary}>
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => {
                previewRef.current?.cancel();
                setStep(2);
              }}
              disabled={!ready}
              className={primary}
            >
              Continue to schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[17px] font-extrabold text-foreground">Schedule your announcement</div>
            <div className="text-[10px] text-muted-foreground mt-1">Choose when “{title.trim()}” should play.</div>
          </div>

          <div>
            <span className={cn(label, "mb-[7px]")}>Days of the week</span>
            <div className="flex gap-1.5">
              {DAYS.map((day) => {
                const active = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDays((d) => (active ? d.filter((x) => x !== day) : [...d, day]))}
                    className={cn(
                      "flex-1 py-2 rounded-[7px] border text-[9px] font-extrabold",
                      active ? "border-primary bg-primary/10 text-primary" : "border-white/[0.07] bg-card text-faint",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={cn(label, "mb-[7px]")}>Occurrence</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "once", label: "Once per day", detail: "Play at a specific time" },
                  { value: "multiple", label: "Multiple times", detail: "Repeat during a time window" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={occurrence === option.value}
                  onClick={() => setOccurrence(option.value)}
                  className={cn(choice(occurrence === option.value), "px-[11px] py-2.5")}
                >
                  <span className="block text-[10px] font-extrabold text-foreground">{option.label}</span>
                  <span className="block mt-[3px] text-[8px] text-muted-foreground">{option.detail}</span>
                </button>
              ))}
            </div>
          </div>

          {occurrence === "once" ? (
            <label>
              <span className={label}>Play at</span>
              <input type="time" value={playAt} onChange={(e) => setPlayAt(e.target.value)} className={field} />
            </label>
          ) : (
            <div className="grid grid-cols-3 gap-[9px]">
              <label>
                <span className={label}>From</span>
                <input type="time" value={playAt} onChange={(e) => setPlayAt(e.target.value)} className={field} />
              </label>
              <label>
                <span className={label}>To</span>
                <input type="time" value={playTo} onChange={(e) => setPlayTo(e.target.value)} className={field} />
              </label>
              <label>
                <span className={label}>Frequency</span>
                <select
                  value={everyMinutes}
                  onChange={(e) => setEveryMinutes(Number(e.target.value))}
                  className={cn(field, "text-[10px]")}
                >
                  {EVERY_MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m === 60 ? "Every hour" : `Every ${m} minutes`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={() => setInterruptMusic((v) => !v)}
            aria-pressed={interruptMusic}
            className="flex items-center gap-2.5 text-left"
          >
            <span
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black text-primary-foreground shrink-0",
                interruptMusic ? "border-primary bg-primary" : "border-faint",
              )}
            >
              {interruptMusic ? "✓" : ""}
            </span>
            <span>
              <span className="block text-[10px] font-bold text-foreground">Interrupt music playback</span>
              <span className="block text-[8px] text-muted-foreground mt-0.5">
                Otherwise the announcement waits until the current song ends.
              </span>
            </span>
          </button>

          <p className="text-[9px] text-faint leading-relaxed">
            Announcements play through Lobby Lounge on the device that&apos;s playing your music, while the app is
            open and music is on.
          </p>

          {!windowValid && <p className="text-[10px] text-destructive">The end time must be after the start time.</p>}
          {error && <p role="alert" className="text-[10px] text-destructive">{error}</p>}

          <div className="flex justify-between items-center pt-1">
            <button type="button" onClick={() => setStep(1)} disabled={saving} className={secondary}>
              Back
            </button>
            <button
              type="button"
              onClick={() => save("scheduled")}
              disabled={days.length === 0 || !windowValid || saving}
              className={primary}
            >
              {saving ? "Saving…" : "Schedule announcement"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
