"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConvex, useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import usePlayerStore from "@/store/usePlayerStore";
import { activeBlock } from "@/lib/schedule";
import { toPlayerQueue } from "@/lib/playlists";
import { useNow } from "./useNow";

export interface ScheduleStatus {
  /** The block on now, if it has a playlist. */
  active: { title: string; playlistId: Id<"playlists"> } | null;
  /** The session ended (e.g. Clerk's max lifetime), so the schedule can't run. */
  signedOut: boolean;
  /** The last scheduled switch failed; `start()` retries it. */
  loadError: string | null;
  /** Loads the active block's playlist and plays it. Call from a click. */
  start: () => void;
}

/**
 * Switches the player to the scheduled playlist when a schedule block starts.
 *
 * Only reacts to *changes* of the active block (a boundary passing, or a block
 * being edited to cover now), so a playlist picked by hand mid-block isn't
 * overridden on the next tick. And only while something is already playing:
 * browsers refuse to start audio without a user gesture, but swapping the
 * source of an element that is already playing is allowed. When nothing is
 * playing, the player bar offers `start()` instead, which runs on a click.
 */
export function useScheduleAutoplay(): ScheduleStatus {
  const convex = useConvex();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const now = useNow(30_000);
  const [loadError, setLoadError] = useState<string | null>(null);

  // `undefined` = not initialised yet; `null` = no block active.
  const lastKey = useRef<string | null | undefined>(undefined);

  const block = blocks ? activeBlock(blocks, now) : null;
  // Include the playlist so re-assigning the current block counts as a change.
  const key = block ? `${block._id}:${block.playlistId}` : null;
  const playlistId = block?.playlistId;
  const title = block?.title || "Scheduled playlist";

  const load = useCallback(
    (id: Id<"playlists">, forKey: string | null) => {
      convex
        .query(api.playlists.getTracks, { playlistId: id })
        .then((tracks) => {
          // The active block may have changed again while we were fetching.
          if (lastKey.current !== forKey) return;
          setLoadError(null);
          usePlayerStore.getState().playQueue(toPlayerQueue(tracks), id);
        })
        .catch((err) => {
          // Usually an expired session. Without this the switch just never
          // happens and nobody notices until a guest asks why it's still jazz.
          console.error("Schedule: couldn't load the scheduled playlist", err);
          setLoadError(`Couldn't switch to "${title}"`);
        });
    },
    [convex, title],
  );

  useEffect(() => {
    if (blocks === undefined) return;

    const previous = lastKey.current;
    lastKey.current = key;
    // On first load, just remember where we are — don't hijack playback.
    if (previous === undefined || previous === key || !playlistId) return;

    const { isPlaying, activePlaylistId } = usePlayerStore.getState();
    if (!isPlaying || activePlaylistId === playlistId) return;

    load(playlistId, key);
  }, [key, playlistId, blocks, load]);

  const start = useCallback(() => {
    if (playlistId) load(playlistId, key);
  }, [load, playlistId, key]);

  // Signed out under us (the Clerk session hit its lifetime): the schedule
  // query is skipped, so the next block would silently never start.
  const signedOut = !isLoading && !isAuthenticated;

  return {
    active: playlistId ? { title, playlistId } : null,
    signedOut,
    loadError,
    start,
  };
}
