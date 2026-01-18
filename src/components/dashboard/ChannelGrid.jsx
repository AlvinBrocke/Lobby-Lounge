import React from "react";

export default function ChannelGrid({ channels, onChannelSelect, title }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel)}
            className="group relative overflow-hidden rounded-xl aspect-square hover:scale-105 transition-transform duration-200 text-left"
          >
            <img
              src={channel.image}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-sm">
                {channel.name}
              </h3>
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fas fa-play text-white text-xs"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
