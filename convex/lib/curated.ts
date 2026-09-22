import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * The curated catalogue playlists that ship with the app (formerly "channels").
 * Used by `playlists.seedCurated` on a fresh deployment and by the channel
 * migration to place each existing channel in a section.
 */
export const CURATED_PLAYLISTS: {
  name: string;
  description: string;
  category: string;
  section: "daytime" | "evening";
  coverImage: string;
}[] = [
  {
    name: "Morning Boost",
    description: "Energetic tracks to kick off the morning rush",
    category: "Energetic",
    section: "daytime",
    coverImage:
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=600&fit=crop",
  },
  {
    name: "Deep Focus",
    description: "Instrumental tracks for productive work environments",
    category: "Productivity",
    section: "daytime",
    coverImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop",
  },
  {
    name: "Retail Energy",
    description: "Upbeat pop to keep shoppers energised",
    category: "Upbeat",
    section: "daytime",
    coverImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
  },
  {
    name: "Sunday Brunch",
    description: "Laid-back acoustic grooves perfect for weekend brunch",
    category: "Relaxing",
    section: "daytime",
    coverImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
  },
  {
    name: "Lounge & Chill",
    description: "Smooth background vibes for lounges and waiting areas",
    category: "Relaxing",
    section: "evening",
    coverImage:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop",
  },
  {
    name: "Dinner Jazz",
    description: "Elegant jazz for upscale dining experiences",
    category: "Elegant",
    section: "evening",
    coverImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
  },
  {
    name: "Late Night Vibes",
    description: "Smooth upbeat rhythms to keep the night going",
    category: "Upbeat",
    section: "evening",
    coverImage:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop",
  },
  {
    name: "Ambient Spa",
    description: "Ultra-calm soundscapes for spas and wellness spaces",
    category: "Wellness",
    section: "evening",
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
  },
];

/** Section for a curated playlist name, falling back to daytime. */
export function sectionFor(name: string): "daytime" | "evening" {
  return CURATED_PLAYLISTS.find((p) => p.name === name)?.section ?? "daytime";
}


/** Appends tracks to the end of a playlist, skipping ones already in it. */
export async function appendTracksTo(
  ctx: MutationCtx,
  playlistId: Id<"playlists">,
  trackIds: Id<"tracks">[],
): Promise<number> {
  const entries = await ctx.db
    .query("playlistTracks")
    .withIndex("by_playlist", (q) => q.eq("playlistId", playlistId))
    .collect();
  const present = new Set<string>(entries.map((e) => e.trackId));
  let next = entries.reduce((max, e) => Math.max(max, e.position), -1) + 1;

  let added = 0;
  for (const trackId of trackIds) {
    if (present.has(trackId)) continue;
    present.add(trackId);
    await ctx.db.insert("playlistTracks", { playlistId, trackId, position: next++ });
    added++;
  }
  return added;
}

