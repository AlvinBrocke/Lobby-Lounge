"use client";

import { useState } from "react";
import { ListMusic, Plus, X } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";

const SAMPLE_PLAYLISTS = [
  {
    id: "1",
    name: "Morning Calm",
    description: "Peaceful ambient to start the day",
    trackCount: 18,
    duration: "1h 12m",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Lunch Rush",
    description: "Upbeat pop to keep energy high",
    trackCount: 24,
    duration: "1h 28m",
    cover: "https://images.unsplash.com/photo-1514525253440-b393452086a9?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Evening Wind Down",
    description: "Soft jazz for closing hours",
    trackCount: 14,
    duration: "58m",
    cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
  },
];

function PlaylistCard({ playlist }: { playlist: (typeof SAMPLE_PLAYLISTS)[0] }) {
  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-md cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.cover}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#04201d">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3
          className="font-bold text-[15px] text-foreground truncate"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {playlist.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{playlist.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] text-muted-foreground">
            {playlist.trackCount} tracks
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-muted-foreground/50 shrink-0" />
          <span className="text-[11px] text-muted-foreground">{playlist.duration}</span>
        </div>
      </div>
    </div>
  );
}

function NewPlaylistModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            New Playlist
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Playlist Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Friday Evening Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && onCreate(name.trim())}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => name.trim() && onCreate(name.trim())}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary text-[#04201d] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState(SAMPLE_PLAYLISTS);

  const handleCreate = (name: string) => {
    setPlaylists((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        description: "No tracks yet",
        trackCount: 0,
        duration: "0m",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      },
    ]);
    setShowModal(false);
  };

  return (
    <>
      <PageWrapper
        title="My Playlists"
        description="Your curated collections for every occasion."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-[#04201d] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        }
      >
        <div className="pb-12">
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {playlists.map((p) => (
                <PlaylistCard key={p.id} playlist={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <ListMusic className="w-7 h-7 text-primary" />
              </div>
              <h2
                className="text-xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                No playlists yet
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Create your first playlist to start curating music for your venue.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-[#04201d] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            </div>
          )}
        </div>
      </PageWrapper>

      {showModal && (
        <NewPlaylistModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </>
  );
}
