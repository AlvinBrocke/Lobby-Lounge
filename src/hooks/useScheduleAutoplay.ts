"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import usePlayerStore from "@/store/usePlayerStore";
import { activeBlock, channelToPlayerTrack } from "@/lib/schedule";
import { useNow } from "./useNow";

/**
 * Switches the player to the scheduled channel when a schedule block starts.
 *
 * Only reacts to *changes* of the active block (a boundary passing, or a block
 * being edited to cover now), so a channel picked by hand mid-block isn't
 * overridden on the next tick. And only while something is already playing:
 * browsers refuse to start audio without a user gesture, but swapping the
 * source of an element that is already playing is allowed.
 */
export function useScheduleAutoplay() {
  const { isAuthenticated } = useConvexAuth();
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const channels = useQuery(api.channels.list);
  const now = useNow(30_000);

  // `undefined` = not initialised yet; `null` = no block active.
  const lastKey = useRef<string | null | undefined>(undefined);

  const active = blocks ? activeBlock(blocks, now) : null;
  // Include the channel so re-assigning the current block counts as a change.
  const key = active ? `${active._id}:${active.channelId}` : null;

  useEffect(() => {
    if (blocks === undefined || channels === undefined) return;

    const previous = lastKey.current;
    lastKey.current = key;
    // On first load, just remember where we are — don't hijack playback.
    if (previous === undefined || previous === key || !active) return;

    const { isPlaying, currentTrack, setCurrentTrack } = usePlayerStore.getState();
    if (!isPlaying) return;

    const channel = channels.find((c) => c._id === active.channelId);
    if (!channel?.audioUrl || currentTrack?.id === channel._id) return;

    setCurrentTrack(channelToPlayerTrack(channel));
  }, [key, active, blocks, channels]);
}
