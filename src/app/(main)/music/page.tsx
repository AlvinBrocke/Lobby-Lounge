"use client";
import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import ChannelGrid from "@/components/dashboard/ChannelGrid";
import usePlayerStore from "@/store/usePlayerStore";
import { Channel } from "@/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=300&fit=crop";

function toChannel(ch: Doc<"channels">): Channel {
  return {
    id: ch._id,
    name: ch.name,
    image: ch.coverImage ?? FALLBACK_IMAGE,
    audioUrl: ch.audioUrl,
    category: ch.category,
  };
}

export default function MusicPage() {
  const { setCurrentTrack } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const rawChannels = useQuery(api.channels.list);
  const channelsLoading = rawChannels === undefined;
  const channels = (rawChannels ?? []).map(toChannel);

  const filters = [
    "All",
    ...Array.from(new Set(channels.map((c) => c.category).filter((c): c is string => !!c))),
  ];

  const filteredChannels = channels.filter((channel) => {
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

      {channelsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
