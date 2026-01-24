"use client";

/**
 * Example Client Component using Mock Data
 *
 * Replaced Supabase integration with mock data for development
 */

import { useEffect, useState } from "react";
import type { Track } from "@/types/database.types";

export function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data fetching
    const mockTracks: Track[] = [
      {
        id: "1",
        created_at: new Date().toISOString(),
        name: "Lobby Jazz Vol. 1",
        image:
          "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
        audio_url: null,
        category: "Jazz",
        duration: 180,
        artist: "The Lounge Trio",
      },
      {
        id: "2",
        created_at: new Date().toISOString(),
        name: "Morning Coffee Vibes",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
        audio_url: null,
        category: "Ambient",
        duration: 210,
        artist: "Chill Waves",
      },
      {
        id: "3",
        created_at: new Date().toISOString(),
        name: "Deep Focus",
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
        audio_url: null,
        category: "Focus",
        duration: 240,
        artist: "Mindful Beats",
      },
    ];

    setTimeout(() => {
      setTracks(mockTracks);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          {track.image && (
            <img
              src={track.image}
              alt={track.name}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{track.name}</h3>
            {track.artist && (
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            )}
          </div>
          {track.category && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
              {track.category}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
