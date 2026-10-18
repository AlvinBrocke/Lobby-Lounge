"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Cast, Speaker } from "lucide-react";
import { cn } from "@/lib/utils";

// Not in TypeScript's DOM lib yet (Safari's AirPlay picker; the speaker picker).
type AirPlayAudio = HTMLAudioElement & { webkitShowPlaybackTargetPicker?: () => void };
type OutputPicker = MediaDevices & { selectAudioOutput?: () => Promise<MediaDeviceInfo> };

type Support = { cast: boolean; speaker: boolean };

/**
 * "Devices" in the player bar: send the music to a Cast/AirPlay receiver, or
 * pick which speaker this computer plays through. Each option only shows when
 * the browser supports it, and the button hides when neither is available.
 */
export function DevicesButton({ audioRef, disabled }: { audioRef: RefObject<HTMLAudioElement | null>; disabled: boolean }) {
  const [support, setSupport] = useState<Support>({ cast: false, speaker: false });
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [speakerName, setSpeakerName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Feature-detect after mount so the server render and first client render agree.
  useEffect(() => {
    const audio = audioRef.current as AirPlayAudio | null;
    if (!audio) return;
    const devices = navigator.mediaDevices as OutputPicker | undefined;
    setSupport({
      cast: Boolean(audio.remote || audio.webkitShowPlaybackTargetPicker),
      // shortcut: Chrome has setSinkId but no selectAudioOutput, so it only gets Cast; listing outputs there needs mic permission.
      speaker: Boolean(devices?.selectAudioOutput && "setSinkId" in audio),
    });
    const remote = audio.remote;
    if (!remote) return;
    const sync = () => setConnected(remote.state === "connected");
    sync();
    remote.addEventListener("connect", sync);
    remote.addEventListener("disconnect", sync);
    return () => {
      remote.removeEventListener("connect", sync);
      remote.removeEventListener("disconnect", sync);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!support.cast && !support.speaker) return null;

  async function cast() {
    const audio = audioRef.current as AirPlayAudio | null;
    setOpen(false);
    if (!audio) return;
    try {
      if (audio.remote) await audio.remote.prompt();
      else audio.webkitShowPlaybackTargetPicker?.();
    } catch (e) {
      // Closing the picker rejects with NotAllowedError; that's not a failure.
      if ((e as DOMException).name === "NotFoundError") setError("No Cast or AirPlay devices found on this network.");
      else if ((e as DOMException).name !== "NotAllowedError") setError("Couldn't open the device picker.");
    }
  }

  async function chooseSpeaker() {
    const audio = audioRef.current;
    setOpen(false);
    if (!audio) return;
    try {
      const device = await (navigator.mediaDevices as OutputPicker).selectAudioOutput!();
      await audio.setSinkId(device.deviceId);
      setSpeakerName(device.label || "Selected speaker");
    } catch (e) {
      if ((e as DOMException).name !== "NotAllowedError") setError("Couldn't switch speakers.");
    }
  }

  const item =
    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs text-foreground hover:bg-white/5 transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setError(null);
          setOpen((o) => !o);
        }}
        disabled={disabled}
        title={connected ? "Playing on another device" : "Devices"}
        aria-label="Devices"
        aria-expanded={open}
        className={cn(
          "px-[7px] py-1.5 touch:p-3 rounded-md border transition-colors disabled:opacity-40",
          open || connected
            ? "bg-primary/10 border-primary/25 text-primary"
            : "border-transparent text-faint hover:text-foreground",
        )}
      >
        <Cast className="w-[15px] h-[15px] touch:w-5 touch:h-5" />
      </button>
      {(open || error) && (
        <div
          role={error ? "alert" : "menu"}
          className="absolute bottom-[calc(100%+10px)] right-0 w-60 p-1.5 rounded-[10px] bg-secondary border border-white/10 shadow-[0_-8px_28px_rgba(0,0,0,0.55)] z-50"
        >
          {error ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">{error}</p>
          ) : (
            <>
              {support.cast && (
                <button role="menuitem" onClick={cast} className={item}>
                  <Cast className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    <span className="block font-semibold">Cast or AirPlay</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {connected ? "Connected · tap to change" : "Speakers & screens on your network"}
                    </span>
                  </span>
                </button>
              )}
              {support.speaker && (
                <button role="menuitem" onClick={chooseSpeaker} className={item}>
                  <Speaker className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    <span className="block font-semibold">Choose speaker</span>
                    <span className="block text-[10px] text-muted-foreground truncate">
                      {speakerName ?? "Wired or Bluetooth output"}
                    </span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
