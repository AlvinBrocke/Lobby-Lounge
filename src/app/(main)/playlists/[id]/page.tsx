"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ListMusic, ListPlus, Loader2, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { cn, formatDuration, formatTotalDuration } from "@/lib/utils";
import usePlayerStore from "@/store/usePlayerStore";
import { toPlayerQueue, toPlayerTrack } from "@/lib/playlists";
import { AddSongsDialog } from "@/components/playlists/AddSongsDialog";
import { ConfirmDialog } from "@/components/playlists/ConfirmDialog";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { PlaylistFormModal, type PlaylistFormValues } from "@/components/playlists/PlaylistFormModal";

type PlaylistTrack = FunctionReturnType<typeof api.playlists.getTracks>[number];

// # · Title · Artist · Time · actions
const GRID = "grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_52px_auto] items-center gap-3";

const ghostButton =
  "flex items-center gap-1.5 h-[31px] px-2.5 rounded-md border border-primary/20 text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors";

function TrackRow({
  track,
  index,
  isCurrent,
  canEdit,
  onPlay,
  onQueue,
  onRemove,
}: {
  track: PlaylistTrack;
  index: number;
  isCurrent: boolean;
  canEdit: boolean;
  onPlay: () => void;
  /** Absent when the track can't be played (no audio, or the trial has ended). */
  onQueue?: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className={cn(
        GRID,
        "group px-5 py-[9px] cursor-pointer border-b border-primary/[0.04] transition-colors",
        isCurrent ? "bg-primary/10" : "hover:bg-white/[0.03]",
      )}
    >
      <span
        className={cn(
          "text-[11px] font-mono text-center",
          isCurrent ? "text-primary" : "text-faint",
        )}
      >
        {isCurrent ? "▶" : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play className="w-3 h-3 mx-auto fill-current text-primary hidden group-hover:block" />
          </>
        )}
      </span>

      <div className="flex items-center gap-[9px] min-w-0">
        <PlaylistCover src={track.coverImage} alt="" className="w-[30px] h-[30px] rounded-[3px] shrink-0" iconClassName="w-3 h-3" />
        <span className={cn("text-xs font-semibold truncate", isCurrent ? "text-primary" : "text-foreground")}>
          {track.name}
        </span>
      </div>

      <span className="text-[11px] text-muted-foreground truncate">{track.artist ?? "Unknown Artist"}</span>

      <span className="text-[11px] font-mono text-faint">{formatDuration(track.duration)}</span>

      <div className="flex items-center gap-1">
        {onQueue && (
          <button
            onClick={(e) => {
              // Don't let the click bubble up to the row and start playback.
              e.stopPropagation();
              onQueue();
            }}
            title="Add to queue"
            aria-label={`Add ${track.name} to queue`}
            className="w-7 h-7 rounded-md border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <ListPlus className="w-3.5 h-3.5" />
          </button>
        )}
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${track.name} from playlist`}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
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

  const playQueue = usePlayerStore((s) => s.playQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
  const isActive = usePlayerStore((s) => s.activePlaylistId === playlistId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

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
          Back to Playlists
        </Link>
      </div>
    );
  }

  // `get` also returns public and curated playlists; only the owner edits.
  // Curated ones have no owner at all, so they're always read-only.
  const canEdit = !!userId && playlist.clerkUserId === userId;
  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const cover = playlist.coverImage ?? tracks.find((t) => t.coverImage)?.coverImage;
  const meta = [
    playlist.category ?? (playlist.curated ? "Curated" : "Your playlist"),
    `${tracks.length} track${tracks.length !== 1 ? "s" : ""}`,
    totalDuration ? formatTotalDuration(totalDuration) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function playFrom(index: number) {
    // Pass the whole list so the loop can refill from it. toPlayerQueue drops
    // tracks without audio, so shift the index past the ones before it.
    const skipped = tracks.slice(0, index).filter((t) => !t.audioUrl).length;
    playQueue(toPlayerQueue(tracks), playlistId, index - skipped);
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
    <div className="flex flex-col w-full pb-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3.5 pb-3.5 mb-1 border-b border-primary/[0.08]">
        <Link href="/playlists" className={ghostButton}>
          <ArrowLeft className="w-[13px] h-[13px]" />
          Back
        </Link>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <PlaylistCover src={cover} alt="" className="w-11 h-11 rounded-[5px] shrink-0" iconClassName="w-4 h-4" />
          <div className="min-w-0">
            <h1 className={cn("text-base font-bold tracking-tight truncate", isActive ? "text-primary" : "text-foreground")}>
              {playlist.name}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">{meta}</p>
          </div>
          {isActive && (
            <span className="text-[9px] font-bold bg-primary text-primary-foreground rounded px-[7px] py-0.5 ml-1 shrink-0">
              ● {isPlaying ? "PLAYING NOW" : "PAUSED"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {canEdit && (
            <>
              <button onClick={() => setModal("add")} className={ghostButton}>
                <Plus className="w-[13px] h-[13px]" />
                Add songs
              </button>
              <button onClick={() => setModal("edit")} aria-label="Edit playlist" className={ghostButton}>
                <Pencil className="w-[13px] h-[13px]" />
              </button>
              <button
                onClick={() => setModal("delete")}
                aria-label="Delete playlist"
                className={cn(ghostButton, "hover:text-destructive hover:border-destructive/50")}
              >
                <Trash2 className="w-[13px] h-[13px]" />
              </button>
            </>
          )}
          <button
            onClick={() => playFrom(0)}
            disabled={tracks.length === 0}
            className="flex items-center gap-1.5 h-[31px] px-3.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-3 h-3 fill-current" />
            Play all
          </button>
        </div>
      </div>

      {playlist.description && (
        <p className="text-xs text-muted-foreground max-w-2xl py-3">{playlist.description}</p>
      )}

      {/* Tracks */}
      {tracks.length > 0 ? (
        <div className="-mx-5 md:-mx-7">
          <div className={cn(GRID, "px-5 py-2 border-b border-primary/[0.08]")}>
            {["#", "Title", "Artist", "Time", ""].map((h, i) => (
              <span
                key={i}
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.1em] text-faint",
                  h === "#" && "text-center",
                )}
              >
                {h}
              </span>
            ))}
          </div>
          {tracks.map((track, i) => (
            <TrackRow
              key={track.playlistTrackId}
              track={track}
              index={i}
              isCurrent={currentTrackId === track._id}
              canEdit={canEdit}
              onPlay={() => playFrom(i)}
              onQueue={track.audioUrl ? () => addToQueue(toPlayerTrack(track)) : undefined}
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
          <p className="text-xs text-muted-foreground mb-5">
            {canEdit ? "Search the catalogue to add songs." : "No tracks have been added yet."}
          </p>
          {canEdit && (
            <button
              onClick={() => setModal("add")}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add songs
            </button>
          )}
        </div>
      )}

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
