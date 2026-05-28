"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { CategoryCard } from "@/components/ui/category-card";
import { PlaylistCard } from "@/components/ui/playlist-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const genres = [
  {
    title: "Pop",
    subtitle: "Top Hits",
    image:
      "https://images.unsplash.com/photo-1514525253440-b393452086a9?w=400&h=400&fit=crop",
  },
  {
    title: "Rock",
    subtitle: "Classic & Modern",
    image:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop",
  },
  {
    title: "Hip Hop",
    subtitle: "Beats & Rhymes",
    image:
      "https://images.unsplash.com/photo-1571609825128-687f62d1c68e?w=400&h=400&fit=crop",
  },
  {
    title: "Electronic",
    subtitle: "Dance & EDM",
    image:
      "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop",
  },
  {
    title: "Jazz",
    subtitle: "Smooth & Soulful",
    image:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  },
  {
    title: "Classical",
    subtitle: "Orchestral Works",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?w=400&h=400&fit=crop",
  },
];

const featuredPlaylists = [
  {
    id: "f1",
    title: "New Releases",
    description: "Fresh this week",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: "f2",
    title: "Global Top 50",
    description: "World hits",
    image:
      "https://images.unsplash.com/photo-1534258936925-c48947387e3b?w=400&h=400&fit=crop",
  },
  {
    id: "f3",
    title: "Indie Mix",
    description: "Undiscovered gems",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
  },
];

export default function MusicPage() {
  return (
    <PageWrapper
      title="Explore"
      description="Discover new music and genres."
      action={
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search music..."
            className="pl-9 bg-background/50 backdrop-blur-sm"
          />
        </div>
      }
    >
      <div className="space-y-10 pb-24">
        {/* Browse Genres */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Browse Genres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {genres.map((genre) => (
              <CategoryCard
                key={genre.title}
                title={genre.title}
                subtitle={genre.subtitle}
                image={genre.image}
              />
            ))}
          </div>
        </section>

        {/* Featured Playlists */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Featured Playlists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                item={playlist}
                aspectRatio="video"
              />
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
