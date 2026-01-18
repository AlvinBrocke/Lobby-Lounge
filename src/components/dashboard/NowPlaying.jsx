import React from "react";

export default function NowPlaying({ currentlyPlaying }) {
  return (
    <div className="w-80 bg-surface border-l border-gray-800 p-6 flex flex-col h-full">
      <div className="text-right mb-6">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          NOW PLAYING
        </span>
      </div>

      {currentlyPlaying ? (
        <div className="space-y-6">
          {/* Album Art */}
          <div className="relative">
            <img
              src={currentlyPlaying.image}
              alt={currentlyPlaying.name}
              className="w-full aspect-square rounded-xl object-cover"
            />
            <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
          </div>

          {/* Track Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-1">
              {currentlyPlaying.name}
            </h3>
            <p className="text-sm text-gray-400">Business Atmosphere</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <i className="fas fa-step-backward text-white text-sm"></i>
            </button>
            <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
              <i className="fas fa-pause text-white"></i>
            </button>
            <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
              <i className="fas fa-step-forward text-white text-sm"></i>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div className="bg-primary h-1 rounded-full w-1/3"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>2:34</span>
              <span>7:42</span>
            </div>
          </div>

          {/* Queue */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
              QUEUE (empty)
            </h4>
            <p className="text-xs text-gray-500">Add tracks to see them here</p>
          </div>

          {/* Coming Up Next */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
              COMING UP NEXT
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <i className="fas fa-music text-gray-500 text-xs"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Smooth Jazz Mix</p>
                  <p className="text-xs text-gray-500">Auto-generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 mt-10">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-music text-gray-600 text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No music playing
            </h3>
            <p className="text-sm text-gray-400">
              Select a channel to start playing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
