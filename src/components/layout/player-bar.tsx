"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  VolumeX,
  X,
} from "lucide-react";
import { cn, fadeGain, formatDuration } from "@/lib/utils";
import usePlayerStore from "@/store/usePlayerStore";
import { useAccess } from "@/hooks/useAccess";
import { useMediaSession, useWakeLock } from "@/hooks/useKeepAwake";
import { useVolumeSupported } from "@/hooks/useVolumeSupported";
import { TrackReactions, useSyncBlockedTracks } from "@/components/player/TrackReactions";
import { DevicesButton } from "@/components/player/DevicesButton";
import { UpNext } from "@/components/player/UpNext";
import type { ScheduleStatus } from "@/hooks/useScheduleAutoplay";
import type { Track } from "@/types";

/** Broken tracks skipped in a row before giving up and saying so. */
const MAX_FAILURES = 3;
/** How long playback may sit buffering before the track counts as broken. */
const STALL_MS = 15_000;

/** Player clock: `formatDuration` shows a dash for 0, but a clock should read 0:00. */
const clock = (seconds: number) => (seconds >= 1 ? formatDuration(seconds) : "0:00");

function Artwork({ track, className }: { track: Track | null; className: string }) {
  return (
    <div className={cn("overflow-hidden shrink-0 bg-secondary", className)}>
      {track?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.image} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ListMusic className="w-1/3 h-1/3 text-primary/60" />
        </div>
      )}
    </div>
  );
}

/**
 * Seek bar. Pointer events cover mouse, finger and pen alike: press anywhere to
 * jump, drag to scrub. While dragging only the bar moves; the audio seeks once
 * on release. The visible track is a few px, but the hit area is 24px+ tall so
 * it can be grabbed on a tablet. `big` is the variant used in the expanded view.
 */
function Progress({
  progress,
  onSeek,
  big,
}: {
  progress: number;
  onSeek: (pct: number) => void;
  big?: boolean;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? progress;

  const pctAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
  };

  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(100, progress + 5));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 5));
      }}
      onPointerDown={(e) => {
        // Capture keeps the moves coming even when the finger leaves the bar.
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(pctAt(e));
      }}
      onPointerMove={(e) => {
        if (drag !== null) setDrag(pctAt(e));
      }}
      onPointerUp={(e) => {
        if (drag === null) return;
        onSeek(pctAt(e));
        setDrag(null);
      }}
      onPointerCancel={() => setDrag(null)}
      // `touch-none`: a horizontal drag here scrubs instead of scrolling the page.
      className={cn(
        "group/seek relative flex-1 flex items-center cursor-pointer touch-none",
        big ? "h-8" : "h-6",
      )}
    >
      <div
        className={cn(
          "relative w-full rounded-sm",
          big ? "h-1 bg-muted-foreground/30" : "h-[3px] touch:h-1 bg-muted-foreground/20",
        )}
      >
        <div className="absolute inset-y-0 left-0 bg-primary rounded-sm" style={{ width: `${shown}%` }} />
        <div
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none transition-transform",
            big
              ? "w-[13px] h-[13px] touch:w-4 touch:h-4 shadow-[0_0_8px_hsl(var(--primary))]"
              : "w-2.5 h-2.5 touch:w-3.5 touch:h-3.5",
            drag !== null && "scale-125",
          )}
          style={{ left: `${shown}%` }}
        />
      </div>
    </div>
  );
}

function Transport({
  playing,
  disabled,
  onPrev,
  onToggle,
  onNext,
  playLabel,
  big,
}: {
  playing: boolean;
  disabled: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  /** Overrides the play button's label, e.g. "Start schedule: Morning Jazz". */
  playLabel?: string;
  big?: boolean;
}) {
  const side =
    "p-1 touch:p-3 rounded-full text-muted-foreground hover:text-foreground active:bg-white/5 transition-colors disabled:opacity-40";
  const icon = big ? "w-[22px] h-[22px] touch:w-7 touch:h-7" : "w-4 h-4 touch:w-5 touch:h-5";
  return (
    <div className={cn("flex items-center", big ? "gap-[22px] touch:gap-6" : "gap-3.5 touch:gap-2")}>
      <button onClick={onPrev} disabled={disabled} title="Restart track" aria-label="Restart track" className={side}>
        <SkipBack className={cn(icon, "fill-current")} />
      </button>
      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={playing ? "Pause" : (playLabel ?? "Play")}
        title={playing ? undefined : playLabel}
        className={cn(
          "rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform can-hover:hover:scale-[1.08] active:scale-95 disabled:opacity-40 disabled:hover:scale-100",
          big
            ? "w-[54px] h-[54px] touch:w-[72px] touch:h-[72px] shadow-[0_4px_24px_hsl(var(--primary)/0.45)]"
            : "w-10 h-10 touch:w-12 touch:h-12 shadow-[0_2px_16px_hsl(var(--primary)/0.4)]",
        )}
      >
        {playing ? (
          <Pause className={cn(big ? "w-[18px] h-[18px] touch:w-6 touch:h-6" : "w-3.5 h-3.5 touch:w-[18px] touch:h-[18px]", "fill-current")} />
        ) : (
          <Play className={cn(big ? "w-[18px] h-[18px] touch:w-6 touch:h-6" : "w-3.5 h-3.5 touch:w-[18px] touch:h-[18px]", "fill-current ml-0.5")} />
        )}
      </button>
      <button onClick={onNext} disabled={disabled} title="Next" aria-label="Next track" className={side}>
        <SkipForward className={cn(icon, "fill-current")} />
      </button>
    </div>
  );
}

/**
 * Replaces the now-playing area when the player needs attention. Staff glance
 * at this from across the room, so it says what's wrong and what to tap.
 */
function Notice({
  tone,
  title,
  detail,
  onClick,
  href,
}: {
  tone: "alert" | "info";
  title: string;
  detail: string;
  onClick?: () => void;
  href?: string;
}) {
  const Icon = tone === "alert" ? AlertTriangle : CalendarClock;
  const body = (
    <>
      <div
        className={cn(
          "w-12 h-12 touch:w-14 touch:h-14 rounded-md shrink-0 flex items-center justify-center",
          tone === "alert" ? "bg-red-500/15 text-red-400" : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs touch:text-sm font-bold text-foreground truncate">{title}</div>
        <div
          className={cn(
            "text-[11px] touch:text-[13px] truncate group-hover:underline",
            tone === "alert" ? "text-red-400" : "text-primary",
          )}
        >
          {detail}
        </div>
      </div>
    </>
  );
  const className = "group w-[30%] min-w-0 flex items-center gap-2.5 pr-5 text-left";
  return href ? (
    <Link href={href} role="alert" className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} role={tone === "alert" ? "alert" : undefined} className={className}>
      {body}
    </button>
  );
}

export function PlayerBar({ schedule }: { schedule: ScheduleStatus }) {
  const { isPlaying, currentTrack, volume, togglePlay, setIsPlaying, setVolume, nextTrack } =
    usePlayerStore();
  // Music holds while an announcement plays, without flipping isPlaying, so
  // the transport keeps showing "playing" and resumes by itself afterwards.
  const announcing = usePlayerStore((s) => s.announcing !== null);
  const access = useAccess();
  const expired = access?.access.status === "expired";

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  // The queue sheet: Up Next for screens where the sidebar is a narrow rail.
  const [showQueue, setShowQueue] = useState(false);
  const volumeSupported = useVolumeSupported();
  useSyncBlockedTracks();
  // Set after MAX_FAILURES broken tracks in a row; playback is paused.
  const [stopped, setStopped] = useState(false);
  const failures = useRef(0);
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const clearStall = useCallback(() => {
    if (stallTimer.current) clearTimeout(stallTimer.current);
    stallTimer.current = null;
  }, []);

  /**
   * A track that won't play (404, expired CDN link, unsupported format, or a
   * stream that hangs) is skipped. Several in a row usually means the network
   * is down, so stop and say so rather than spinning through the playlist.
   */
  const fail = useCallback(
    (reason: string) => {
      clearStall();
      const track = usePlayerStore.getState().currentTrack;
      console.warn(`Player: skipping "${track?.name}" (${reason})`);
      failures.current += 1;
      if (failures.current >= MAX_FAILURES) {
        setStopped(true);
        setIsPlaying(false);
      } else {
        nextTrack();
      }
    },
    [clearStall, nextTrack, setIsPlaying],
  );

  function armStall() {
    const { isPlaying, announcing } = usePlayerStore.getState();
    if (!isPlaying || announcing || stallTimer.current) return;
    stallTimer.current = setTimeout(() => fail("stalled"), STALL_MS);
  }

  // Load new track when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearStall();

    const src = currentTrack?.audioUrl;
    if (!src) {
      // `audio.src = ""` would point at the page URL and fire a bogus error.
      if (audio.hasAttribute("src")) {
        audio.removeAttribute("src");
        audio.load();
      }
      setProgress(0);
      setDuration(0);
      // A track with no audio can't play; treat it like a broken one.
      if (currentTrack && usePlayerStore.getState().isPlaying) fail("no audio");
      return;
    }
    // Re-assigning reloads an errored element (a one-track playlist retrying).
    if (audio.src !== src || audio.error) {
      audio.src = src;
      setProgress(0);
      setDuration(0);
    }
  }, [currentTrack, clearStall, fail]);

  // Sync play/pause with store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (isPlaying && !announcing) {
      // Any restart (retry, a playlist click, the play button) starts a fresh count.
      if (stopped) {
        setStopped(false);
        failures.current = 0;
      }
      audio.play().catch((err: DOMException) => {
        // The browser wants a tap first: show "paused" so staff know to press play.
        if (err.name === "NotAllowedError") setIsPlaying(false);
        // AbortError just means the source changed mid-start; real load
        // failures arrive as the element's `error` event, handled below.
      });
    } else {
      clearStall();
      audio.pause();
    }
  }, [isPlaying, currentTrack, announcing, stopped, clearStall, setIsPlaying]);

  useEffect(() => clearStall, [clearStall]);

  const sound = access?.profile?.sound;
  const fadeSeconds = sound?.fadeSeconds ?? 0;
  // 0-1 multiplier for "Fade between songs": dips the volume over the first
  // and last `fadeSeconds` of each track. A single <audio> can't overlap two
  // tracks, so this fades out and back in rather than truly crossfading.
  const fade = useRef(1);

  const applyVolume = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = (usePlayerStore.getState().volume / 100) * fade.current;
  }, []);

  // Sync volume with store
  useEffect(applyVolume, [volume, applyVolume]);

  // The venue's default volume (Settings → Preferences), once per session.
  const seededVolume = useRef(false);
  useEffect(() => {
    if (seededVolume.current || sound?.defaultVolume === undefined) return;
    seededVolume.current = true;
    setVolume(sound.defaultVolume);
  }, [sound?.defaultVolume, setVolume]);

  // Close the volume popover on an outside click, and the expanded view on Escape.
  useEffect(() => {
    if (!showVolume) return;
    const close = (e: PointerEvent) => {
      if (!volumeRef.current?.contains(e.target as Node)) setShowVolume(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [showVolume]);

  useEffect(() => {
    if (!expanded && !showQueue) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setExpanded(false);
      setShowQueue(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, showQueue]);

  const audible = isPlaying && !!currentTrack?.audioUrl;
  useWakeLock(audible);
  const play = useCallback(() => setIsPlaying(true), [setIsPlaying]);
  const pause = useCallback(() => setIsPlaying(false), [setIsPlaying]);
  useMediaSession(currentTrack, isPlaying, { play, pause, next: nextTrack });

  const elapsed = (progress / 100) * duration;
  // With nothing loaded, play can still start the scheduled playlist.
  const canStartSchedule = !currentTrack && !!schedule.active && !expired;
  const disabled = !currentTrack && !canStartSchedule;

  function seek(pct: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (pct / 100) * duration;
    setProgress(pct);
  }

  // There's no play history yet, so "previous" restarts the current track.
  const restart = () => seek(0);

  function onToggle() {
    if (stopped) nextTrack();
    else if (canStartSchedule) schedule.start();
    else togglePlay();
  }

  const transport = {
    playing: isPlaying,
    disabled,
    onPrev: restart,
    onToggle,
    onNext: nextTrack,
    playLabel: canStartSchedule ? `Start schedule: ${schedule.active.title}` : undefined,
  };

  // Most urgent first. Each one replaces the now-playing area.
  let notice: React.ReactNode = null;
  if (expired && !currentTrack?.audioUrl) {
    notice = (
      <Notice tone="alert" title="Trial ended" detail="Subscribe to keep playing" href="/settings?tab=billing" />
    );
  } else if (stopped && !isPlaying) {
    notice = <Notice tone="alert" title="Music stopped" detail="Tap to retry" onClick={() => nextTrack()} />;
  } else if (schedule.signedOut) {
    notice = (
      <Notice
        tone="alert"
        title="Signed out — schedule paused"
        detail="Tap to sign in again"
        onClick={() => window.location.reload()}
      />
    );
  } else if (schedule.loadError) {
    notice = <Notice tone="alert" title={schedule.loadError} detail="Tap to retry" onClick={schedule.start} />;
  } else if (canStartSchedule) {
    notice = (
      <Notice
        tone="info"
        title={`Up now: ${schedule.active.title}`}
        detail="Tap to start the schedule"
        onClick={schedule.start}
      />
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setProgress((el.currentTime / el.duration) * 100);
          const gain = fadeGain(el.currentTime, el.duration, fadeSeconds);
          if (gain !== fade.current) {
            fade.current = gain;
            applyVolume();
          }
          clearStall();
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlaying={() => {
          clearStall();
          failures.current = 0;
        }}
        onError={() => {
          if (usePlayerStore.getState().currentTrack?.audioUrl) fail("load error");
        }}
        // `waiting`/`stalled` also fire on brief network hiccups, so give the
        // stream a while to recover before calling the track broken.
        onWaiting={armStall}
        onStalled={armStall}
        onEnded={() => {
          // Announcements that don't interrupt wait for the song to end.
          const { pendingAnnouncements, startAnnouncement } = usePlayerStore.getState();
          if (pendingAnnouncements.length > 0) startAnnouncement(true);
          else nextTrack();
        }}
        className="hidden"
      />

      {expanded && currentTrack && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          onClick={() => setExpanded(false)}
        >
          <div className="absolute inset-0 bg-[rgba(5,10,22,0.75)] backdrop-blur-[10px]" />
          <div
            role="dialog"
            aria-label="Now playing"
            onClick={(e) => e.stopPropagation()}
            className="relative w-[360px] touch:w-[min(520px,90vw)] flex flex-col items-center gap-4 touch:gap-6 px-8 pt-7 pb-6 touch:pb-8 rounded-[18px] bg-secondary border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
          >
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 w-[26px] h-[26px] touch:w-11 touch:h-11 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 touch:w-5 touch:h-5" />
            </button>
            <Artwork track={currentTrack} className="w-[200px] h-[200px] touch:w-[min(300px,40dvh)] touch:h-[min(300px,40dvh)] rounded-xl shadow-[0_8px_36px_rgba(0,0,0,0.65)]" />
            <div className="text-center w-full">
              <div className="text-[17px] touch:text-2xl font-bold tracking-tight text-foreground truncate">
                {currentTrack.name}
              </div>
              {currentTrack.artist && (
                <div className="text-xs touch:text-base text-muted-foreground mt-1">{currentTrack.artist}</div>
              )}
              {currentTrack.category && (
                <div className="text-[11px] touch:text-sm text-faint">{currentTrack.category}</div>
              )}
            </div>
            <TrackReactions track={currentTrack} />
            <div className="w-full">
              <div className="flex">
                <Progress progress={progress} onSeek={seek} big />
              </div>
              <div className="flex justify-between mt-1 text-[10px] touch:text-sm font-mono text-faint">
                <span>{clock(elapsed)}</span>
                <span>{clock(duration)}</span>
              </div>
            </div>
            <Transport {...transport} big />
          </div>
        </div>
      )}

      {/* Nothing loaded and nothing to flag: hide the bar. The <audio> above
          stays mounted either way, so playback starts the moment a track loads. */}
      {(currentTrack || notice) && (
        <div className="h-[76px] touch:h-[88px] flex items-center px-3 sm:px-5 bg-shell shadow-[0_-8px_40px_rgba(0,0,0,0.55)]">
          {/* Now playing — opens the expanded view */}
          {notice ?? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              disabled={disabled}
              aria-label="Expand now playing"
              className="group w-[30%] min-w-0 flex items-center gap-2.5 touch:gap-3 pr-3 sm:pr-5 text-left disabled:cursor-default"
            >
              <div className="relative w-12 h-12 touch:w-14 touch:h-14 rounded-md overflow-hidden shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform can-hover:group-enabled:group-hover:scale-105">
                <Artwork track={currentTrack} className="w-full h-full" />
                {currentTrack && (
                  // With a mouse the expand icon appears on hover; with no hover it
                  // sits in the corner permanently so it's clear the art is tappable.
                  <div className="absolute inset-0 flex items-end justify-end p-1 can-hover:items-center can-hover:justify-center can-hover:p-0 can-hover:group-hover:bg-black/40 transition-colors">
                    <Maximize2 className="w-[13px] h-[13px] text-white opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] can-hover:opacity-0 can-hover:group-hover:opacity-90" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs touch:text-[15px] font-bold text-foreground truncate">
                  {currentTrack?.name ?? "Nothing playing"}
                </div>
                <div className="text-[11px] touch:text-[13px] text-muted-foreground truncate">
                  {currentTrack ? (currentTrack.artist ?? "Lobby & Lounge") : "Choose a playlist to start"}
                </div>
                {currentTrack?.category && (
                  <div className="text-[10px] touch:text-xs text-faint truncate mt-px">{currentTrack.category}</div>
                )}
              </div>
            </button>
          )}

          {/* Transport + progress */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5">
            <Transport {...transport} />
            <div className="flex items-center gap-2 w-full max-w-[260px] touch:max-w-[340px]">
              <span className="text-[10px] touch:text-xs font-mono text-faint shrink-0 tabular-nums">
                {clock(elapsed)}
              </span>
              <Progress progress={progress} onSeek={seek} />
              <span className="text-[10px] touch:text-xs font-mono text-faint shrink-0 tabular-nums">
                {clock(duration)}
              </span>
            </div>
          </div>

          {/* Queue (where the sidebar can't show it) + devices + volume */}
          <div className="w-[30%] flex items-center justify-end gap-1 pl-3 sm:pl-5">
            <button
              onClick={() => setShowQueue(true)}
              title="Up next"
              aria-label="Show up next"
              className="lg:hidden p-2 touch:p-3 rounded-md text-faint hover:text-foreground active:bg-white/5 transition-colors"
            >
              <ListMusic className="w-[15px] h-[15px] touch:w-5 touch:h-5" />
            </button>
            <DevicesButton audioRef={audioRef} disabled={!currentTrack} />
            <div ref={volumeRef} className="relative">
              <button
                onClick={() => setShowVolume((v) => !v)}
                title="Volume"
                aria-label="Volume"
                aria-expanded={showVolume}
                className={cn(
                  "px-[7px] py-1.5 touch:p-3 rounded-md border transition-colors",
                  showVolume
                    ? "bg-primary/10 border-primary/25 text-primary"
                    : "border-transparent text-faint hover:text-foreground",
                )}
              >
                {volume === 0 && volumeSupported ? (
                  <VolumeX className="w-[15px] h-[15px] touch:w-5 touch:h-5" />
                ) : (
                  <Volume1 className="w-[15px] h-[15px] touch:w-5 touch:h-5" />
                )}
              </button>
              {showVolume &&
                (volumeSupported ? (
                  // Vertical strip with a mouse; on touch a wider horizontal slider
                  // is far easier to drag. Anchored right so it stays on screen.
                  <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-9 px-2.5 py-3.5 flex flex-col items-center gap-2 touch:left-auto touch:right-0 touch:translate-x-0 touch:w-auto touch:flex-row-reverse touch:px-4 touch:py-3 touch:gap-3 rounded-[10px] bg-secondary border border-white/10 shadow-[0_-8px_28px_rgba(0,0,0,0.55)] z-50">
                    <span className="text-[9px] touch:text-xs touch:w-6 touch:text-right font-bold font-mono text-primary/60">{volume}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volume level"
                      // Vertical slider; `direction: rtl` puts 100 at the top.
                      className="h-20 w-3.5 touch:h-8 touch:w-44 cursor-pointer accent-primary [writing-mode:vertical-lr] [direction:rtl] touch:[writing-mode:horizontal-tb] touch:[direction:ltr]"
                    />
                  </div>
                ) : (
                  // iPad/iPhone: the browser can't change the volume, only the buttons can.
                  <div
                    role="note"
                    className="absolute bottom-[calc(100%+10px)] right-0 w-56 px-4 py-3 rounded-[10px] bg-secondary border border-white/10 shadow-[0_-8px_28px_rgba(0,0,0,0.55)] z-50 text-[13px] leading-snug text-muted-foreground"
                  >
                    <span className="font-semibold text-foreground">Use the tablet&apos;s volume buttons.</span>{" "}
                    iPad doesn&apos;t let web apps change the volume.
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showQueue && (
        <div className="fixed inset-0 z-[300] lg:hidden" onClick={() => setShowQueue(false)}>
          <div className="absolute inset-0 bg-[rgba(5,10,22,0.6)] backdrop-blur-[6px]" />
          <div
            role="dialog"
            aria-label="Up next"
            onClick={(e) => e.stopPropagation()}
            className="app-chrome absolute inset-y-0 right-0 w-[min(380px,92vw)] flex flex-col gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-shell shadow-[-12px_0_40px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-foreground">Up next</span>
              <button
                onClick={() => setShowQueue(false)}
                aria-label="Close"
                className="w-11 h-11 -mr-1 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <UpNext />
          </div>
        </div>
      )}
    </>
  );
}
