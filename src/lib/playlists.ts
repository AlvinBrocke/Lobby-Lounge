import type { Doc } from "@convex/_generated/dataModel";
import type { Energy } from "@convex/lib/energy";
import type { Track } from "@/types";

/** Convex track → the shape the global player store expects. */
export function toPlayerTrack(track: Doc<"tracks">): Track {
  return {
    id: track._id,
    name: track.name,
    artist: track.artist,
    duration: track.duration,
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

/** What a venue said it likes during onboarding (or later, in Preferences). */
export type Taste = { genres: string[]; mood?: string };

/**
 * Picks the curated playlists to show under "Suggested for you" in the search
 * pop-up. `tagsFor(category)` returns the Jamendo genre tags behind a
 * category (e.g. "Elegant" → ["jazz", "lounge"]).
 */
export function suggestedPlaylists<P extends { category?: string }>(
  playlists: P[],
  taste: Taste,
  tagsFor: (category: string | undefined) => string[],
  limit = 4,
): P[] {
  const moodCategories = MOOD_CATEGORIES[taste.mood ?? ""] ?? [];
  const score = (p: P) =>
    // One deliberate mood pick outweighs any single genre from the multi-select.
    (moodCategories.includes(p.category ?? "") ? 2 : 0) +
    taste.genres.filter((g) => tagsFor(p.category).some((t) => t.startsWith(g))).length;
  // Array.sort is stable, so ties (and an empty taste) keep the catalogue's seed order.
  return [...playlists].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/** Onboarding mood ids → the curated categories that suit them. */
const MOOD_CATEGORIES: Record<string, string[]> = {
  relaxed: ["Relaxing", "Wellness"],
  upbeat: ["Upbeat", "Energetic"],
  elegant: ["Elegant"],
  focused: ["Productivity"],
};
