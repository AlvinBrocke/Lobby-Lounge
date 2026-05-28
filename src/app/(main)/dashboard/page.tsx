"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { CategoryCard } from "@/components/ui/category-card";
import { PlaylistCard } from "@/components/ui/playlist-card";
import { PlaylistModal } from "@/components/ui/playlist-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

// Mock Data
const energeticPlaylists = [
  {
    id: "e1",
    title: "Morning Boost",
    description: "Start the day right",
    gradient: "from-orange-400 to-rose-500",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: "e2",
    title: "Power Workout",
    description: "High BPM energy",
    gradient: "from-red-500 to-orange-500",
    image:
      "https://images.unsplash.com/photo-1534258936925-c48947387e3b?w=400&h=400&fit=crop",
  },
  {
    id: "e3",
    title: "Summer Hits",
    description: "Feel good vibes",
    gradient: "from-amber-400 to-orange-500",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
  },
  {
    id: "e4",
    title: "Retail Pop",
    description: "Upbeat shopping tunes",
    gradient: "from-rose-400 to-red-500",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
  },
];

const chillPlaylists = [
  {
    id: "c1",
    title: "Lounge Jazz",
    description: "Smooth background",
    gradient: "from-blue-400 to-indigo-500",
    image:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  },
  {
    id: "c2",
    title: "Deep Focus",
    description: "Productivity flow",
    gradient: "from-sky-400 to-blue-500",
    image:
      "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop",
  },
  {
    id: "c3",
    title: "Ambient Calm",
    description: "Stress relief",
    gradient: "from-cyan-400 to-blue-500",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
  },
  {
    id: "c4",
    title: "Night Mode",
    description: "Dark & moody",
    gradient: "from-indigo-400 to-purple-500",
    image:
      "https://images.unsplash.com/photo-1514525253440-b393452086a9?w=400&h=400&fit=crop",
  },
];

export default function Dashboard() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    (typeof energeticPlaylists)[0] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlaylistClick = (playlist: (typeof energeticPlaylists)[0]) => {
    setSelectedPlaylist(playlist);
    setIsModalOpen(true);
  };

  return (
    <PageWrapper
      title="Your Playlists"
      action={
        <Button
          variant="outline"
          className="rounded-full border-dashed border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      }
    >
      <div className="space-y-10 pb-24">
        <PlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          playlist={selectedPlaylist}
        />

        {/* Grid Section 1: Energetic */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <CategoryCard
            title="Energetic Vibes"
            subtitle="Keep the tempo up"
            image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
          />
          {energeticPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              item={playlist}
              onClick={() => handlePlaylistClick(playlist)}
            />
          ))}
        </section>

        {/* Grid Section 2: Chill */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <CategoryCard
            title="Chill Atmosphere"
            subtitle="Relax and unwind"
            image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop"
          />
          {chillPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              item={playlist}
              onClick={() => handlePlaylistClick(playlist)}
            />
          ))}
        </section>
      </div>
    </PageWrapper>
  );
}
