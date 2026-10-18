"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Ban, Heart, Repeat } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import usePlayerStore from "@/store/usePlayerStore";
import { cn } from "@/lib/utils";
import type { Track } from "@/types";

function useReactions() {
  const { isAuthenticated } = useConvexAuth();
  return useQuery(api.trackReactions.listMine, isAuthenticated ? {} : "skip");
}

/** Keeps the player's blocked list in step with Convex, so blocks apply on every device. */
export function useSyncBlockedTracks() {
  const reactions = useReactions();
  const setBlockedIds = usePlayerStore((s) => s.setBlockedIds);
  useEffect(() => {
    if (reactions) setBlockedIds(reactions.filter((r) => r.kind === "block").map((r) => r.trackId));
  }, [reactions, setBlockedIds]);
}

/** Love / Block / Repeat, under the track title in the expanded player. */
export function TrackReactions({ track }: { track: Track }) {
  const reactions = useReactions();
  const setReaction = useMutation(api.trackReactions.set);
  const repeat = usePlayerStore((s) => s.repeat);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const nextTrack = usePlayerStore((s) => s.nextTrack);

  const kind = reactions?.find((r) => r.trackId === track.id)?.kind ?? null;
  const trackId = track.id as Id<"tracks">;

  async function block() {
    await setReaction({ trackId, kind: "block" });
    nextTrack(); // a blocked song shouldn't keep playing
  }

  const button =
    "flex flex-col items-center gap-1 px-3 py-1.5 touch:py-2.5 rounded-lg text-[10px] touch:text-xs font-semibold transition-colors disabled:opacity-40";
  const icon = "w-[18px] h-[18px] touch:w-6 touch:h-6";

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => setReaction({ trackId, kind: kind === "like" ? null : "like" })}
        disabled={reactions === undefined}
        aria-pressed={kind === "like"}
        className={cn(button, kind === "like" ? "text-[#FF4B6E]" : "text-muted-foreground hover:text-foreground")}
      >
        <Heart className={icon} fill={kind === "like" ? "currentColor" : "none"} />
        {kind === "like" ? "Loved" : "Love"}
      </button>
      <button
        onClick={block}
        disabled={reactions === undefined}
        title="Never play this song again (undo in Library)"
        className={cn(button, "text-muted-foreground hover:text-destructive")}
      >
        <Ban className={icon} />
        Block
      </button>
      <button
        onClick={toggleRepeat}
        aria-pressed={repeat}
        title={repeat ? "Playlist repeats" : "Playlist plays once"}
        className={cn(button, repeat ? "text-primary" : "text-muted-foreground hover:text-foreground")}
      >
        <Repeat className={icon} />
        {repeat ? "Repeat on" : "Play once"}
      </button>
    </div>
  );
}
