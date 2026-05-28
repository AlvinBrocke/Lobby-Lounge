"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  ListMusic,
  Mic2,
  MonitorSpeaker,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);

  return (
    <div className="h-full px-6 flex items-center justify-between text-foreground">
      {/* 1. Track Info (Left) */}
      <div className="flex items-center w-[30%] space-x-4 group/info cursor-pointer">
        {/* Album Art */}
        <div className="relative w-14 h-14 rounded-xl shadow-lg overflow-hidden border border-border/10 group-hover/info:scale-105 transition-transform duration-300">
          {/* Placeholder Gradient if no image, or actual image */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 animate-gradient-xy" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <ListMusic className="text-white/50 w-6 h-6" />
          </div>
        </div>

        <div className="flex flex-col min-w-0 justify-center">
          <span className="text-sm font-bold hover:underline truncate cursor-pointer text-foreground">
            Lounge Vibes Vol. 1
          </span>
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate cursor-pointer hover:underline">
            Lobby & Lounge Signature Mix
          </span>
        </div>

        {/* Like Button (Hidden by default, visible on hover) */}
        {/* Could add Heart icon here */}
      </div>

      {/* 2. Player Controls (Center) */}
      <div className="flex flex-col items-center max-w-[40%] w-full space-y-2">
        {/* Buttons */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 w-8 h-8"
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:text-primary transition-colors hover:scale-110 w-8 h-8"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <div
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-200 cursor-pointer active:scale-95"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:text-primary transition-colors hover:scale-110 w-8 h-8"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 w-8 h-8"
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 group/progress">
          <span className="text-[10px] text-muted-foreground font-mono w-8 text-right tabular-nums">
            1:24
          </span>
          <div className="relative flex-1 h-1 bg-secondary rounded-full cursor-pointer group-hover/progress:h-1.5 transition-all duration-300">
            <div className="absolute top-0 left-0 h-full w-[33%] bg-primary rounded-full group-hover/progress:bg-primary/80" />
            {/* Scrubber Handle (Visible on group hover) */}
            <div className="absolute top-1/2 left-[33%] -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200" />
          </div>
          <span className="text-[10px] text-muted-foreground font-mono w-8 tabular-nums">
            3:45
          </span>
        </div>
      </div>

      {/* 3. Volume & Extra (Right) */}
      <div className="flex items-center justify-end w-[30%] gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <Mic2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <ListMusic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <MonitorSpeaker className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 w-28 group/volume">
          <Volume2 className="w-4 h-4 text-muted-foreground group-hover/volume:text-foreground transition-colors" />
          <Slider
            defaultValue={[75]}
            max={100}
            step={1}
            className="w-full cursor-pointer"
            onValueChange={(val) => setVolume(val)}
          />
        </div>
      </div>
    </div>
  );
}
