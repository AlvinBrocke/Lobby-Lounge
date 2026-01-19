import React from "react";
import { Channel, Track } from "@/types";

interface ChannelGridProps {
  channels: (Channel | Track)[];
  onChannelSelect: (channel: Channel | Track) => void;
  title: string;
}

export default function ChannelGrid({
  channels,
  onChannelSelect,
  title,
}: ChannelGridProps) {
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
            {/* Optional Play Icon could be conditionally rendered if needed */}
            <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
