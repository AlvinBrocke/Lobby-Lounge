"use client";

import { cn } from "@/lib/utils";
import {
  ListMusic,
  MonitorSpeaker,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function EqBars({ playing }: { playing: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-[2.5px] items-end",
        !playing && "eq-bars-paused",
      )}
    >
      <span className="eq-bar w-[2.5px] h-[9px]" />
      <span className="eq-bar w-[2.5px] h-[14px]" />
      <span className="eq-bar w-[2.5px] h-[11px]" />
      <span className="eq-bar w-[2.5px] h-[17px]" />
      <span className="eq-bar w-[2.5px] h-[13px]" />
      <span className="eq-bar w-[2.5px] h-[16px]" />
    </div>
  );
}

export function PlayerBar() {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(34);
  const [volume, setVolume] = useState(72);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    const tick = (ts: number) => {
      if (lastTimeRef.current !== 0) {
        const delta = ts - lastTimeRef.current;
        setProgress((p) => {
          const next = p + (delta / 245000) * 100;
          return next >= 100 ? 0 : next;
        });
      }
      lastTimeRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [playing]);

  const totalSeconds = 245;
  const currentSeconds = Math.round((progress / 100) * totalSeconds);
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="h-full px-6 flex items-center justify-between gap-5">
      {/* Track info */}
      <div className="flex items-center gap-3 w-[28%] min-w-0">
        <div className="relative w-[46px] h-[46px] rounded-lg overflow-hidden border border-border shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=120&h=120&fit=crop"
            alt="album"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/22" />
          <div className="absolute bottom-[5px] left-[5px]">
            <EqBars playing={playing} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">
            Evening Lounge Jazz
          </div>
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
            Lobby &amp; Lounge · Signature Mix
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[460px]">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setShuffle((s) => !s)}
            className={cn(
              "flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-colors",
              shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Shuffle className="w-[15px] h-[15px]" />
          </button>
          <button className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-foreground hover:text-primary transition-colors">
            <SkipBack className="w-[17px] h-[17px]" />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95
              bg-white text-[#0F1419] dark:bg-white dark:text-[#0F1419]
              light:bg-[#00388D] light:text-white"
          >
            {playing ? (
              <Pause className="w-[18px] h-[18px] fill-current" />
            ) : (
              <Play className="w-[18px] h-[18px] fill-current ml-0.5" />
            )}
          </button>
          <button className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-foreground hover:text-primary transition-colors">
            <SkipForward className="w-[17px] h-[17px]" />
          </button>
          <button
            onClick={() => setRepeat((r) => !r)}
            className={cn(
              "flex items-center justify-center w-[30px] h-[30px] rounded-lg transition-colors",
              repeat ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Repeat className="w-[15px] h-[15px]" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2.5 w-full">
          <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-7 text-center tabular-nums">
            {formatTime(currentSeconds)}
          </span>
          <div
            className="flex-1 h-1 bg-border rounded-full relative cursor-pointer group"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setProgress(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-foreground border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
              style={{ left: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-7 text-center tabular-nums">
            {formatTime(totalSeconds)}
          </span>
        </div>
      </div>

      {/* Extras */}
      <div className="flex items-center gap-1.5 w-[28%] justify-end">
        <button className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <MonitorSpeaker className="w-[15px] h-[15px]" />
        </button>
        <button className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ListMusic className="w-[15px] h-[15px]" />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <Volume2 className="w-[13px] h-[13px] text-muted-foreground shrink-0" />
          <div className="relative w-20 h-1 bg-border rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full pointer-events-none"
              style={{ width: `${volume}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full h-[200%] -top-[50%] opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
