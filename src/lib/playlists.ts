import type { Doc } from "@convex/_generated/dataModel";
import type { Energy } from "@convex/lib/energy";
import type { Track } from "@/types";

/** Convex track → the shape the global player store expects. */
export function toPlayerTrack(track: Doc<"tracks">): Track {
  return {
    id: track._id,
    name: track.name,
    image: track.coverImage ?? "",
    audioUrl: track.audioUrl,
    category: track.category,
  };
}

/** Tracks without audio can't be played, so they're left out of the queue. */
export function toPlayerQueue(tracks: Doc<"tracks">[]): Track[] {
  return tracks.filter((t) => t.audioUrl).map(toPlayerTrack);
}

/** Tempo-style labels for a playlist's overall energy. */
export const ENERGY_LABELS: Record<Energy, string> = {
  low: "Slow",
  mid: "Medium",
  high: "Upbeat",
};
