"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ListMusic, Plus } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PlaylistFormModal, type PlaylistFormValues } from "@/components/playlists/PlaylistFormModal";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { formatTotalDuration } from "@/lib/utils";

type PlaylistSummary = FunctionReturnType<typeof api.playlists.listByUser>[number];

function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  return (
    <Link
      href={`/playlists/${playlist._id}`}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden">
        <PlaylistCover
          src={playlist.coverImage}
          alt={playlist.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-4">
        <h3
          className="font-bold text-[15px] text-foreground truncate"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {playlist.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {playlist.description || "No description"}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] text-muted-foreground">
            {playlist.trackCount} track{playlist.trackCount !== 1 ? "s" : ""}
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-muted-foreground/50 shrink-0" />
          <span className="text-[11px] text-muted-foreground">
            {formatTotalDuration(playlist.totalDuration)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PlaylistCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-secondary" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 rounded bg-secondary" />
        <div className="h-3 w-1/2 rounded bg-secondary" />
      </div>
    </div>
  );
}

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [showModal, setShowModal] = useState(false);

  // "skip" until Clerk's token reaches Convex — otherwise the query runs
  // unauthenticated and `requireUser` throws.
  const playlists = useQuery(api.playlists.listByUser, isAuthenticated ? {} : "skip");
  const createPlaylist = useMutation(api.playlists.create);

  async function handleCreate({ name, description }: PlaylistFormValues) {
    const id = await createPlaylist({ name, description: description || undefined });
    router.push(`/playlists/${id}`);
  }

  const newButton = (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
    >
      <Plus className="w-4 h-4" />
      New Playlist
    </button>
  );

  return (
    <>
      <PageWrapper
        title="My Playlists"
        description="Your curated collections for every occasion."
        action={newButton}
      >
        <div className="pb-12">
          {playlists === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }, (_, i) => (
                <PlaylistCardSkeleton key={i} />
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {playlists.map((p) => (
                <PlaylistCard key={p._id} playlist={p} />
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
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            </div>
          )}
        </div>
      </PageWrapper>

      {showModal && (
        <PlaylistFormModal
          mode="create"
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </>
  );
}
