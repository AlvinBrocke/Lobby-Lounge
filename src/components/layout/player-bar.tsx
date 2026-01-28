"use client";

import React from "react";
import {
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Mic2,
  ListMusic,
  MonitorSpeaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlayerBar() {
  return (
    <div className="h-full px-6 flex items-center justify-between text-white">
      {/* Current Song Info */}
      <div className="flex items-center w-[30%] space-x-4 group/info cursor-pointer">
        <div className="w-16 h-16 bg-[#282828] rounded-xl shadow-2xl flex items-center justify-center overflow-hidden border border-white/5 group-hover/info:scale-105 transition-transform duration-300">
          <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-indigo-400 opacity-60" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold hover:underline truncate">
            Lounge Vibes Vol. 1
          </span>
          <span className="text-xs text-[#b3b3b3] hover:underline hover:text-white transition-colors truncate">
            Lobby & Lounge Signature Mix
          </span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center max-w-[40%] w-full space-y-3">
        <div className="flex items-center space-x-8">
          <button className="text-[#b3b3b3] hover:text-[#27e0c5] transition-all hover:scale-110">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition-all hover:scale-110">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl active:scale-95">
            <Play className="w-6 h-6 text-black fill-current ml-0.5" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition-all hover:scale-110">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-[#b3b3b3] hover:text-[#27e0c5] transition-all hover:scale-110">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Placeholder */}
        <div className="w-full flex items-center space-x-3 group/progress">
          <span className="text-[10px] text-gray-500 font-mono w-8 text-right">
            0:00
          </span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-white group-hover/progress:bg-[#27e0c5] transition-colors rounded-full" />
          </div>
          <span className="text-[10px] text-gray-500 font-mono w-8">3:45</span>
        </div>
      </div>

      {/* Extra Controls */}
      <div className="flex items-center justify-end w-[30%] space-x-4 text-[#b3b3b3]">
        <button className="hover:text-white transition-colors">
          <Mic2 className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition-colors">
          <ListMusic className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition-colors">
          <MonitorSpeaker className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-3 group/volume w-32">
          <Volume2 className="w-4 h-4 group-hover/volume:text-white transition-colors" />
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            <div className="w-2/3 h-full bg-white group-hover/volume:bg-[#27e0c5] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
