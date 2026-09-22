"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { formatDuration } from "@/lib/utils";
import { Modal } from "./Modal";

interface AddSongsDialogProps {
  playlistId: Id<"playlists">;
  /** Track ids already in the playlist, so results can show a ✓. */
  existingTrackIds: Set<string>;
  onClose: () => void;
}

export function AddSongsDialog({ playlistId, existingTrackIds, onClose }: AddSongsDialogProps) {
  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set());

  // Debounce: only query Convex once typing pauses for 250ms.
  useEffect(() => {
    const id = setTimeout(() => setTerm(input), 250);
    return () => clearTimeout(id);
  }, [input]);

  const results = useQuery(api.tracks.search, { term });
  const addTrack = useMutation(api.playlists.addTrack);

  async function handleAdd(trackId: Id<"tracks">) {
    setPending((prev) => new Set(prev).add(trackId));
    try {
      await addTrack({ playlistId, trackId });
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
    }
  }

  return (
    <Modal title="Add songs" onClose={onClose} className="max-w-lg">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          autoFocus
          type="search"
          placeholder="Search tracks…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      </div>

      <div className="max-h-[50vh] overflow-y-auto -mx-2">
        {results === undefined ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No tracks match &ldquo;{term}&rdquo;
          </p>
        ) : (
          results.map((track) => {
            const added = existingTrackIds.has(track._id);
            const busy = pending.has(track._id);
            return (
              <div
                key={track._id}
                className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">
                    {track.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {track.artist ?? "Unknown Artist"}
                    {track.category ? ` · ${track.category}` : ""}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  {formatDuration(track.duration)}
                </span>
                <button
                  onClick={() => handleAdd(track._id)}
                  disabled={added || busy}
                  aria-label={added ? `${track.name} is in this playlist` : `Add ${track.name}`}
                  className={
                    added
                      ? "w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/15 text-primary"
                      : "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
                  }
                >
                  {busy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : added ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
