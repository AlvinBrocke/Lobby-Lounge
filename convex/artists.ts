import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { canPlay, requireUser } from "./lib/auth";

/**
 * Artists aren't a table: they're grouped from `tracks.artist`, which the
 * Jamendo sync fills in. Only `get` returns audio, behind the same trial gate
 * as `playlists.getTracks`.
 */

export interface ArtistSummary {
  name: string;
  trackCount: number;
  coverImage?: string;
  categories: string[];
}

// shortcut: scans the whole catalogue (~1–2k rows) per call, precompute an artists table in the Jamendo sync if it passes ~10k.
async function allArtists(ctx: QueryCtx): Promise<ArtistSummary[]> {
  const byName = new Map<string, ArtistSummary>();
  for (const track of await ctx.db.query("tracks").collect()) {
    if (!track.artist) continue;
    const artist = byName.get(track.artist) ?? { name: track.artist, trackCount: 0, categories: [] };
    artist.trackCount += 1;
    artist.coverImage ??= track.coverImage;
    if (track.category && !artist.categories.includes(track.category)) artist.categories.push(track.category);
    byName.set(track.artist, artist);
  }
  return [...byName.values()].sort((a, b) => b.trackCount - a.trackCount || a.name.localeCompare(b.name));
}

const clampLimit = (limit: number | undefined, fallback: number) => Math.min(Math.max(limit ?? fallback, 1), 50);

/** Artists with the most tracks in the catalogue first. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return (await allArtists(ctx)).slice(0, clampLimit(args.limit, 12));
  },
});

/** Other artists who share a category with `name`. */
export const related = query({
  args: { name: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const artists = await allArtists(ctx);
    const self = artists.find((a) => a.name === args.name);
    if (!self) return [];
    return artists
      .filter((a) => a.name !== self.name && a.categories.some((c) => self.categories.includes(c)))
      .slice(0, clampLimit(args.limit, 6));
  },
});

/** One artist and their tracks. Audio is withheld once the trial has ended. */
export const get = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_artist", (q) => q.eq("artist", args.name))
      .collect();
    if (tracks.length === 0) return null;

    const playable = await canPlay(ctx, clerkUserId);
    const categories = [...new Set(tracks.map((t) => t.category).filter((c): c is string => Boolean(c)))];
    return {
      artist: {
        name: args.name,
        trackCount: tracks.length,
        coverImage: tracks.find((t) => t.coverImage)?.coverImage,
        categories,
      } satisfies ArtistSummary,
      tracks: tracks.map((t): Doc<"tracks"> => ({ ...t, audioUrl: playable ? t.audioUrl : undefined })),
    };
  },
});

/** Albums in the catalogue, most tracks first. Tracks synced before albums were stored have none. */
export const albums = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const byKey = new Map<string, { album: string; artist: string; trackCount: number; coverImage?: string }>();
    // shortcut: same full-catalogue scan as `allArtists`.
    for (const track of await ctx.db.query("tracks").collect()) {
      if (!track.album || !track.artist) continue;
      const key = `${track.artist}\u0000${track.album}`;
      const album = byKey.get(key) ?? { album: track.album, artist: track.artist, trackCount: 0, coverImage: undefined };
      album.trackCount += 1;
      album.coverImage ??= track.coverImage;
      byKey.set(key, album);
    }
    return [...byKey.values()]
      .sort((a, b) => b.trackCount - a.trackCount || a.album.localeCompare(b.album))
      .slice(0, clampLimit(args.limit, 50));
  },
});
