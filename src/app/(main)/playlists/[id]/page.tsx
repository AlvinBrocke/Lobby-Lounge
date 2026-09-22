"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ListMusic, Loader2, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { cn, formatDuration, formatTotalDuration } from "@/lib/utils";
import usePlayerStore from "@/store/usePlayerStore";
import type { Track } from "@/types";
import { AddSongsDialog } from "@/components/playlists/AddSongsDialog";
import { ConfirmDialog } from "@/components/playlists/ConfirmDialog";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { PlaylistFormModal, type PlaylistFormValues } from "@/components/playlists/PlaylistFormModal";

type PlaylistTrack = FunctionReturnType<typeof api.playlists.getTracks>[number];

const ENERGY_STYLES: Record<string, string> = {
  low: "text-blue-400 bg-blue-400/12",
  mid: "text-emerald-400 bg-emerald-400/12",
  high: "text-amber-400 bg-amber-400/12",
};

/** Convex track → the shape the global player store expects. */
function toPlayerTrack(track: PlaylistTrack): Track {
  return {
    id: track._id,
    name: track.name,
    image: track.coverImage ?? "",
    audioUrl: track.audioUrl,
    category: track.category,
  };
}

function TrackRow({
  track,
  index,
  isCurrent,
  canEdit,
  onPlay,
  onRemove,
}: {
  track: PlaylistTrack;
  index: number;
  isCurrent: boolean;
  canEdit: boolean;
  onPlay: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-secondary transition-colors group"
    >
      <span className="font-mono text-[11px] text-muted-foreground w-5 text-center shrink-0 flex items-center justify-center">
        <span className="group-hover:hidden">{index + 1}</span>
        <Play className="w-3 h-3 fill-current text-primary hidden group-hover:block" />
      </span>

      <div className="flex-1 min-w-0">
        <div className={cn("text-[13px] font-semibold truncate", isCurrent ? "text-primary" : "text-foreground")}>
          {track.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {track.artist ?? "Unknown Artist"}
        </div>
      </div>

      {track.category && (
        <span className="text-[11px] font-medium text-muted-foreground hidden sm:block shrink-0">
          {track.category}
        </span>
      )}

      {track.energy && ENERGY_STYLES[track.energy] && (
        <span
          className={cn(
            "text-[9px] font-bold tracking-[0.1em] px-2 py-[3px] rounded-full shrink-0 uppercase",
            ENERGY_STYLES[track.energy],
          )}
        >
          {track.energy}
        </span>
      )}

      <span className="font-mono text-[11px] text-muted-foreground shrink-0 w-9 text-right">
        {formatDuration(track.duration)}
      </span>

      {canEdit && (
        <button
          onClick={(e) => {
            // Don't let the click bubble up to the row and start playback.
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${track.name} from playlist`}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function PlaylistDetailPage() {
  const router = useRouter();
  // Client components read dynamic route segments with `useParams`.
  const { id } = useParams<{ id: string }>();
  const playlistId = id as Id<"playlists">;
  const { isAuthenticated } = useConvexAuth();

  const playlist = useQuery(api.playlists.get, isAuthenticated ? { id: playlistId } : "skip");
  const tracks = useQuery(
    api.playlists.getTracks,
    isAuthenticated ? { playlistId } : "skip",
  );
  const { userId } = useAuth();

  const updatePlaylist = useMutation(api.playlists.update);
  const removePlaylist = useMutation(api.playlists.remove);
  const removeTrack = useMutation(api.playlists.removeTrack);

  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);

  const [modal, setModal] = useState<"edit" | "delete" | "add" | null>(null);
  const [deleting, setDeleting] = useState(false);

  const existingTrackIds = useMemo(
    () => new Set((tracks ?? []).map((t) => t._id as string)),
    [tracks],
  );

  // Once deleted, `get` reactively returns null — render nothing while we
  // navigate away instead of flashing "not found".
  if (deleting && playlist === null) return null;

  if (playlist === undefined || tracks === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (playlist === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-bold text-foreground mb-2">Playlist not found</p>
        <p className="text-sm text-muted-foreground mb-6">It may have been deleted.</p>
        <Link href="/playlists" className="text-sm font-semibold text-primary hover:underline">
          Back to My Playlists
        </Link>
      </div>
    );
  }

  // `get` also returns public playlists owned by others; only the owner edits.
  const canEdit = !!userId && playlist.clerkUserId === userId;
  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const cover = playlist.coverImage ?? tracks.find((t) => t.coverImage)?.coverImage;

  function playFrom(index: number) {
    const [first, ...rest] = tracks.slice(index);
    if (!first) return;
    clearQueue();
    setCurrentTrack(toPlayerTrack(first));
    rest.forEach((t) => addToQueue(toPlayerTrack(t)));
  }

  async function handleEdit({ name, description }: PlaylistFormValues) {
    await updatePlaylist({ id: playlistId, name, description });
    setModal(null);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removePlaylist({ id: playlistId });
    } catch (err) {
      setDeleting(false);
      throw err;
    }
    router.replace("/playlists");
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        My Playlists
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 sm:items-end">
        <PlaylistCover
          src={cover}
          alt={playlist.name}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl shadow-lg shrink-0"
          iconClassName="w-12 h-12"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
            Playlist
          </span>
          <h1
            className="text-3xl font-bold tracking-tight text-foreground mt-1 break-words"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">{playlist.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""} · {formatTotalDuration(totalDuration)}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={() => playFrom(0)}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => setModal("add")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add songs
                </button>
                <button
                  onClick={() => setModal("edit")}
                  aria-label="Edit playlist"
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModal("delete")}
                  aria-label="Delete playlist"
                  className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {tracks.length > 0 ? (
          <div className="p-2">
            {tracks.map((track, i) => (
              <TrackRow
                key={track.playlistTrackId}
                track={track}
                index={i}
                isCurrent={currentTrackId === track._id}
                canEdit={canEdit}
                onPlay={() => playFrom(i)}
                onRemove={() => removeTrack({ playlistTrackId: track.playlistTrackId })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <ListMusic className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">This playlist is empty</p>
            <p className="text-xs text-muted-foreground mb-5">Search the catalogue to add songs.</p>
            {canEdit && (
              <button
                onClick={() => setModal("add")}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add songs
              </button>
            )}
          </div>
        )}
      </div>

      {modal === "edit" && (
        <PlaylistFormModal
          mode="edit"
          initial={{ name: playlist.name, description: playlist.description ?? "" }}
          onClose={() => setModal(null)}
          onSubmit={handleEdit}
        />
      )}
      {modal === "delete" && (
        <ConfirmDialog
          title="Delete playlist?"
          message={
            <>
              <strong className="text-foreground">{playlist.name}</strong> and its track list will be
              permanently deleted. The songs stay in the library.
            </>
          }
          confirmLabel="Delete"
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
      {modal === "add" && (
        <AddSongsDialog
          playlistId={playlistId}
          existingTrackIds={existingTrackIds}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
