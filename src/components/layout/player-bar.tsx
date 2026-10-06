"use client";

import { useEffect, useRef, useState } from "react";
import {
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
import { cn, formatDuration } from "@/lib/utils";
import usePlayerStore from "@/store/usePlayerStore";
import type { Track } from "@/types";

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

/** Click-to-seek bar. `big` is the variant used in the expanded view. */
function Progress({
  progress,
  onSeek,
  big,
}: {
  progress: number;
  onSeek: (pct: number) => void;
  big?: boolean;
}) {
  return (
    <div
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(100, progress + 5));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 5));
      }}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onSeek(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
      }}
      className={cn(
        "relative flex-1 rounded-sm cursor-pointer",
        big ? "h-1 bg-muted-foreground/30" : "h-[3px] bg-muted-foreground/20",
      )}
    >
      <div className="absolute inset-y-0 left-0 bg-primary rounded-sm" style={{ width: `${progress}%` }} />
      <div
        className={cn(
          "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none",
          big ? "w-[13px] h-[13px] shadow-[0_0_8px_hsl(var(--primary))]" : "w-2.5 h-2.5",
        )}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

function Transport({
  playing,
  disabled,
  onPrev,
  onToggle,
  onNext,
  big,
}: {
  playing: boolean;
  disabled: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  big?: boolean;
}) {
  const side = "p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40";
  const icon = big ? "w-[22px] h-[22px]" : "w-4 h-4";
  return (
    <div className={cn("flex items-center", big ? "gap-[22px]" : "gap-3.5")}>
      <button onClick={onPrev} disabled={disabled} title="Restart track" aria-label="Restart track" className={side}>
        <SkipBack className={cn(icon, "fill-current")} />
      </button>
      <button
        onClick={onToggle}
        disabled={disabled}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-transform hover:scale-[1.08] disabled:opacity-40 disabled:hover:scale-100",
          big
            ? "w-[54px] h-[54px] shadow-[0_4px_24px_hsl(var(--primary)/0.45)]"
            : "w-10 h-10 shadow-[0_2px_16px_hsl(var(--primary)/0.4)]",
        )}
      >
        {playing ? (
          <Pause className={cn(big ? "w-[18px] h-[18px]" : "w-3.5 h-3.5", "fill-current")} />
        ) : (
          <Play className={cn(big ? "w-[18px] h-[18px]" : "w-3.5 h-3.5", "fill-current ml-0.5")} />
        )}
      </button>
      <button onClick={onNext} disabled={disabled} title="Next" aria-label="Next track" className={side}>
        <SkipForward className={cn(icon, "fill-current")} />
      </button>
    </div>
  );
}

export function PlayerBar() {
  const { isPlaying, currentTrack, volume, togglePlay, setVolume, nextTrack } = usePlayerStore();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Load new track when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = currentTrack?.audioUrl ?? "";
    if (audio.src !== src) {
      audio.src = src;
      setProgress(0);
      setDuration(0);
    }
  }, [currentTrack]);

  // Sync play/pause with store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay may be blocked; ignore silently
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sync volume with store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

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
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const elapsed = (progress / 100) * duration;
  const disabled = !currentTrack;

  function seek(pct: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (pct / 100) * duration;
    setProgress(pct);
  }

  // There's no play history yet, so "previous" restarts the current track.
  const restart = () => seek(0);

  const transport = {
    playing: isPlaying,
    disabled,
    onPrev: restart,
    onToggle: togglePlay,
    onNext: nextTrack,
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration) setProgress((el.currentTime / el.duration) * 100);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={nextTrack}
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
            className="relative w-[360px] flex flex-col items-center gap-4 px-8 pt-7 pb-6 rounded-[18px] bg-secondary border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.75)]"
          >
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 w-[26px] h-[26px] rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <Artwork track={currentTrack} className="w-[200px] h-[200px] rounded-xl shadow-[0_8px_36px_rgba(0,0,0,0.65)]" />
            <div className="text-center w-full">
              <div className="text-[17px] font-bold tracking-tight text-foreground truncate">
                {currentTrack.name}
              </div>
              {currentTrack.artist && (
                <div className="text-xs text-muted-foreground mt-1">{currentTrack.artist}</div>
              )}
              {currentTrack.category && (
                <div className="text-[11px] text-faint">{currentTrack.category}</div>
              )}
            </div>
            <div className="w-full">
              <div className="flex">
                <Progress progress={progress} onSeek={seek} big />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono text-faint">
                <span>{clock(elapsed)}</span>
                <span>{clock(duration)}</span>
              </div>
            </div>
            <Transport {...transport} big />
          </div>
        </div>
      )}

      <div className="h-full flex items-center px-5 bg-shell shadow-[0_-8px_40px_rgba(0,0,0,0.55)]">
        {/* Now playing — opens the expanded view */}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={disabled}
          aria-label="Expand now playing"
          className="group w-[30%] min-w-0 flex items-center gap-2.5 pr-5 text-left disabled:cursor-default"
        >
          <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform group-enabled:group-hover:scale-105">
            <Artwork track={currentTrack} className="w-full h-full" />
            {currentTrack && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <Maximize2 className="w-[13px] h-[13px] text-white opacity-0 group-hover:opacity-90" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-foreground truncate">
              {currentTrack?.name ?? "Nothing playing"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {currentTrack ? (currentTrack.artist ?? "Lobby & Lounge") : "Choose a playlist to start"}
            </div>
            {currentTrack?.category && (
              <div className="text-[10px] text-faint truncate mt-px">{currentTrack.category}</div>
            )}
          </div>
        </button>

        {/* Transport + progress */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Transport {...transport} />
          <div className="flex items-center gap-2 w-full max-w-[260px]">
            <span className="text-[10px] font-mono text-faint shrink-0 tabular-nums">
              {clock(elapsed)}
            </span>
            <Progress progress={progress} onSeek={seek} />
            <span className="text-[10px] font-mono text-faint shrink-0 tabular-nums">
              {clock(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-[30%] flex justify-end pl-5">
          <div ref={volumeRef} className="relative">
            <button
              onClick={() => setShowVolume((v) => !v)}
              title="Volume"
              aria-label="Volume"
              aria-expanded={showVolume}
              className={cn(
                "px-[7px] py-1.5 rounded-md border transition-colors",
                showVolume
                  ? "bg-primary/10 border-primary/25 text-primary"
                  : "border-transparent text-faint hover:text-foreground",
              )}
            >
              {volume === 0 ? <VolumeX className="w-[15px] h-[15px]" /> : <Volume1 className="w-[15px] h-[15px]" />}
            </button>
            {showVolume && (
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-9 px-2.5 py-3.5 flex flex-col items-center gap-2 rounded-[10px] bg-secondary border border-white/10 shadow-[0_-8px_28px_rgba(0,0,0,0.55)] z-50">
                <span className="text-[9px] font-bold font-mono text-primary/60">{volume}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume level"
                  // Vertical slider; `direction: rtl` puts 100 at the top.
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  className="h-20 w-3.5 cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
