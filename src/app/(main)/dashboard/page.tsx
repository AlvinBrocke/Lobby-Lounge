"use client";
import React, { useState, useEffect } from "react";
import ChannelGrid from "@/components/dashboard/ChannelGrid";
import usePlayerStore from "@/store/usePlayerStore";
import { User, Channel, Track } from "@/types";

// Mock user hook for development (keep for now until auth is real)
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setUser({
        name: "My Venue",
        email: "venue@lobbylounge.com",
        plan: "premium_trial",
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { data: user, loading };
};

function MainComponent() {
  const { data: user, loading } = useUser();
  const { setCurrentTrack, currentTrack } = usePlayerStore();

  if (loading) {
    return (
      <div className="flex bg-background h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const quickStartChannels: Channel[] = [
    {
      id: "focus",
      name: "Focus & Productivity",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Mock Audio
    },
    {
      id: "retail",
      name: "Retail Energy",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "lounge",
      name: "Lounge & Chill",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      id: "upbeat",
      name: "Upbeat & Modern",
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
    {
      id: "ambient",
      name: "Ambient & Calm",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      audioUrl:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    },
  ];

  const moodChannels: Channel[] = [
    {
      id: "morning",
      name: "Morning Boost",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    },
    {
      id: "afternoon",
      name: "Afternoon Flow",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    },
    {
      id: "evening",
      name: "Evening Wind Down",
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
      audioUrl:
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    },
  ];

  return (
    <div className="p-8 pb-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.name}</p>
      </div>

      {currentTrack && (
        <div className="mb-12 bg-surface p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Now Playing
            </h2>
            <div className="text-3xl font-bold text-primary">
              {currentTrack.name}
            </div>
            <div className="text-gray-400 mt-1">
              Lobby & Lounge Signature Mix
            </div>
          </div>
          <div className="h-32 w-32 rounded-xl overflow-hidden relative">
            <img
              src={currentTrack.image}
              className="w-full h-full object-cover"
              alt={currentTrack.name}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        </div>
      )}

      <ChannelGrid
        title="Quick start"
        channels={quickStartChannels}
        onChannelSelect={setCurrentTrack}
      />

      <ChannelGrid
        title="Create mood"
        channels={moodChannels}
        onChannelSelect={setCurrentTrack}
      />
    </div>
  );
}

export default MainComponent;
