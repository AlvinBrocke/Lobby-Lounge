"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import NowPlaying from "@/components/dashboard/NowPlaying";
import ChannelGrid from "@/components/dashboard/ChannelGrid";

// Mock user hook for development
const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setUser({
        name: "Alvin",
        email: "alvin@lobbylounge.com",
        plan: "premium_trial",
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { data: user, loading };
};

function MainComponent() {
  const { data: user, loading } = useUser();
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      // In a real app we'd redirect, but for dev we'll just wait
      // window.location.href = "/account/signin";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickStartChannels = [
    {
      id: "focus",
      name: "Focus & Productivity",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: "retail",
      name: "Retail Energy",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      color: "from-orange-500 to-pink-500",
    },
    {
      id: "lounge",
      name: "Lounge & Chill",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      color: "from-purple-500 to-blue-500",
    },
    {
      id: "upbeat",
      name: "Upbeat & Modern",
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
      color: "from-green-500 to-teal-500",
    },
    {
      id: "ambient",
      name: "Ambient & Calm",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const moodChannels = [
    {
      id: "morning",
      name: "Morning Boost",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: "afternoon",
      name: "Afternoon Flow",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: "evening",
      name: "Evening Wind Down",
      image:
        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "weekend",
      name: "Weekend Vibes",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      color: "from-green-400 to-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex">
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                MUSIC CHANNELS
              </h1>
              <p className="text-gray-400">
                Choose the perfect atmosphere for your business
              </p>
            </div>

            <ChannelGrid
              title="Quick start"
              channels={quickStartChannels}
              onChannelSelect={setCurrentlyPlaying}
            />

            <ChannelGrid
              title="Create mood"
              channels={moodChannels}
              onChannelSelect={setCurrentlyPlaying}
            />
          </div>
        </div>

        <NowPlaying currentlyPlaying={currentlyPlaying} />
      </div>
    </div>
  );
}

export default MainComponent;
