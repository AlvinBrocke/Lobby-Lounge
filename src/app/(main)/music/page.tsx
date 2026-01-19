"use client";
import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import ChannelGrid from "@/components/dashboard/ChannelGrid";
import usePlayerStore from "@/store/usePlayerStore";
import { Channel } from "@/types";

const allChannels: Channel[] = [
  {
    id: "focus",
    name: "Focus & Productivity",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "Productivity",
  },
  {
    id: "retail",
    name: "Retail Energy",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "Upbeat",
  },
  {
    id: "lounge",
    name: "Lounge & Chill",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "Relaxing",
  },
  {
    id: "upbeat",
    name: "Upbeat & Modern",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    category: "Upbeat",
  },
  {
    id: "ambient",
    name: "Ambient & Calm",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    category: "Relaxing",
  },
  {
    id: "morning",
    name: "Morning Boost",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    category: "Productivity",
  },
  {
    id: "evening",
    name: "Evening Wind Down",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    category: "Relaxing",
  },
];

export default function MusicPage() {
  const { setCurrentTrack } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Productivity", "Upbeat", "Relaxing"];

  const filteredChannels = allChannels.filter((channel) => {
    const matchesSearch = channel.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || channel.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Music Library</h1>
          <p className="text-gray-400">
            Explore our curated collection of business-friendly soundscapes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search playlists..."
            className="w-full bg-surface border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-500 mr-2" />
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === filter
                ? "bg-primary text-black"
                : "bg-surface text-gray-400 hover:text-white border border-gray-800"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <ChannelGrid
        title={`${activeFilter} Channels`}
        channels={filteredChannels}
        onChannelSelect={setCurrentTrack}
      />

      {filteredChannels.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No playlists found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
