"use client";

import { useState } from "react";
import { Play, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Jazz", "Ambient", "Electronic", "Pop", "Classical", "Focus"];

const TRACKS = [
  { id: "1", num: 1, name: "Blue Bossa", artist: "Chet Baker Trio", category: "Jazz", dur: "4:22", energy: "low" as const },
  { id: "2", num: 2, name: "Autumn Leaves", artist: "Coltrane Quartet", category: "Jazz", dur: "4:47", energy: "low" as const },
  { id: "3", num: 3, name: "So What", artist: "Miles Davis", category: "Jazz", dur: "5:14", energy: "mid" as const },
  { id: "4", num: 4, name: "Fly Me to the Moon", artist: "Frank Sinatra", category: "Jazz", dur: "3:08", energy: "low" as const },
  { id: "5", num: 5, name: "Round Midnight", artist: "Thelonious Monk", category: "Jazz", dur: "5:32", energy: "mid" as const },
  { id: "6", num: 6, name: "Deep Focus", artist: "Ambient Collective", category: "Focus", dur: "6:10", energy: "low" as const },
  { id: "7", num: 7, name: "Morning Flow", artist: "Study Sessions", category: "Focus", dur: "5:45", energy: "low" as const },
  { id: "8", num: 8, name: "Neon City", artist: "Synthwave Kids", category: "Electronic", dur: "4:55", energy: "high" as const },
  { id: "9", num: 9, name: "Pulse", artist: "DJ Static", category: "Electronic", dur: "3:58", energy: "high" as const },
  { id: "10", num: 10, name: "Floating", artist: "Ethereal Waves", category: "Ambient", dur: "7:12", energy: "low" as const },
  { id: "11", num: 11, name: "Rain Garden", artist: "Nature Sounds", category: "Ambient", dur: "8:00", energy: "low" as const },
  { id: "12", num: 12, name: "Easy Sunday", artist: "The Mellow Set", category: "Pop", dur: "3:30", energy: "mid" as const },
  { id: "13", num: 13, name: "Golden Hour", artist: "Indie Folk", category: "Pop", dur: "3:55", energy: "mid" as const },
  { id: "14", num: 14, name: "Moonlight Sonata", artist: "Beethoven", category: "Classical", dur: "5:22", energy: "low" as const },
  { id: "15", num: 15, name: "Clair de Lune", artist: "Debussy", category: "Classical", dur: "4:50", energy: "low" as const },
];

const ENERGY_STYLES = {
  low: "text-blue-400 bg-blue-400/12",
  mid: "text-emerald-400 bg-emerald-400/12",
  high: "text-amber-400 bg-amber-400/12",
} as const;

const ENERGY_LABELS = { low: "LOW", mid: "MID", high: "HIGH" } as const;

function TrackRow({ track, index }: { track: (typeof TRACKS)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-secondary transition-colors group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="font-mono text-[11px] text-muted-foreground w-5 text-center shrink-0 flex items-center justify-center">
        {hovered ? (
          <Play className="w-3 h-3 fill-current text-primary" />
        ) : (
          index + 1
        )}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-foreground truncate">{track.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{track.artist}</div>
      </div>

      <span className="text-[11px] font-medium text-muted-foreground hidden sm:block shrink-0">
        {track.category}
      </span>

      <span
        className={cn(
          "text-[9px] font-bold tracking-[0.1em] px-2 py-[3px] rounded-full shrink-0",
          ENERGY_STYLES[track.energy],
        )}
      >
        {ENERGY_LABELS[track.energy]}
      </span>

      <span className="font-mono text-[11px] text-muted-foreground shrink-0 w-9 text-right">
        {track.dur}
      </span>
    </div>
  );
}

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = TRACKS.filter(
    (t) =>
      (category === "All" || t.category === category) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.artist.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <PageWrapper
      title="Library"
      description="Browse the full licensed music catalog."
      action={
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search tracks or artists…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="space-y-5 pb-12">
        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                category === cat
                  ? "bg-primary text-[#04201d]"
                  : "bg-secondary text-muted-foreground border border-border hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border">
            <span className="w-5 shrink-0" />
            <span className="flex-1 text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Title
            </span>
            <span className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase hidden sm:block shrink-0">
              Genre
            </span>
            <span className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase shrink-0 w-8">
              Energy
            </span>
            <span className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase shrink-0 w-9 text-right">
              Time
            </span>
          </div>

          <div className="p-2">
            {filtered.length > 0 ? (
              filtered.map((track, i) => (
                <TrackRow key={track.id} track={track} index={i} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">No tracks found</p>
                <p className="text-xs text-muted-foreground">
                  Try a different search or category
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          {filtered.length} track{filtered.length !== 1 ? "s" : ""}
          {category !== "All" ? ` in ${category}` : ""}
          {search ? ` matching "${search}"` : ""}
        </p>
      </div>
    </PageWrapper>
  );
}
