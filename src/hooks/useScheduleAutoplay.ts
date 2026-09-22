"use client";

import { useEffect, useRef } from "react";
import { useConvex, useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import usePlayerStore from "@/store/usePlayerStore";
import { activeBlock } from "@/lib/schedule";
import { toPlayerQueue } from "@/lib/playlists";
import { useNow } from "./useNow";

/**
 * Switches the player to the scheduled playlist when a schedule block starts.
 *
 * Only reacts to *changes* of the active block (a boundary passing, or a block
 * being edited to cover now), so a playlist picked by hand mid-block isn't
 * overridden on the next tick. And only while something is already playing:
 * browsers refuse to start audio without a user gesture, but swapping the
 * source of an element that is already playing is allowed.
 */
export function useScheduleAutoplay() {
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const now = useNow(30_000);

  // `undefined` = not initialised yet; `null` = no block active.
  const lastKey = useRef<string | null | undefined>(undefined);

  const active = blocks ? activeBlock(blocks, now) : null;
  // Include the playlist so re-assigning the current block counts as a change.
  const key = active ? `${active._id}:${active.playlistId}` : null;
  const playlistId = active?.playlistId;

  useEffect(() => {
    if (blocks === undefined) return;

    const previous = lastKey.current;
    lastKey.current = key;
    // On first load, just remember where we are — don't hijack playback.
    if (previous === undefined || previous === key || !playlistId) return;

    const { isPlaying, activePlaylistId } = usePlayerStore.getState();
    if (!isPlaying || activePlaylistId === playlistId) return;

    convex.query(api.playlists.getTracks, { playlistId }).then((tracks) => {
      // The active block may have changed again while we were fetching.
      if (lastKey.current !== key) return;
      usePlayerStore.getState().playQueue(toPlayerQueue(tracks), playlistId);
    });
  }, [key, playlistId, blocks, convex]);
}
