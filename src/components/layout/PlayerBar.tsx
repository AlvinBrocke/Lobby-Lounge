"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import usePlayerStore from "@/store/usePlayerStore";

export default function PlayerBar() {
  const { isPlaying, currentTrack, volume, togglePlay } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 p-4 z-30 ml-64">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/4">
          <img
            src={currentTrack.image}
            alt={currentTrack.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h4 className="text-white font-medium text-sm">
              {currentTrack.name}
            </h4>
            <p className="text-gray-400 text-xs">Lobby Moods</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-current" />
              ) : (
                <Play className="w-5 h-5 text-black fill-current ml-1" />
              )}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          {/* Progress Bar Mock */}
          <div className="w-full max-w-md mt-2 flex items-center space-x-2 text-xs text-gray-500">
            <span>1:23</span>
            <div className="flex-1 h-1 bg-gray-800 rounded-full">
              <div className="w-1/3 h-full bg-white rounded-full"></div>
            </div>
            <span>3:45</span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-1/4 flex justify-end items-center space-x-2">
          <Volume2 className="w-5 h-5 text-gray-400" />
          <div className="w-24 h-1 bg-gray-800 rounded-full">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${volume * 100}%` }}
            ></div>
          </div>
        </div>

        <audio ref={audioRef} src={currentTrack.audioUrl} />
      </div>
    </div>
  );
}
