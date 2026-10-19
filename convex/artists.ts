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

/**
 * The Jamendo sync stores a song once per playlist it lands in, so the same
 * song can have several rows. Artists and albums count it once (by name).
 */
function firstOfEachSong<T extends { name: string }>(tracks: T[]): T[] {
  const seen = new Set<string>();
  return tracks.filter((t) => !seen.has(t.name) && Boolean(seen.add(t.name)));
}

/**
 * Most tracks `list`, `related` and `albums` read per call. Convex fails a query
 * past 16,384 documents, which would take the Playlists and Library pages down
 * with it; past this cap they show a partial list instead.
 */
export const SCAN_LIMIT = 8000;

// shortcut: scans up to SCAN_LIMIT tracks per call, precompute an artists table in the Jamendo sync before the catalogue nears it.
async function allArtists(ctx: QueryCtx): Promise<ArtistSummary[]> {
  const byName = new Map<string, ArtistSummary & { songs: Set<string> }>();
  for (const track of await ctx.db.query("tracks").take(SCAN_LIMIT)) {
    if (!track.artist) continue;
    const artist = byName.get(track.artist) ?? { name: track.artist, trackCount: 0, categories: [], songs: new Set<string>() };
    artist.songs.add(track.name);
    artist.trackCount = artist.songs.size;
    artist.coverImage ??= track.coverImage;
    if (track.category && !artist.categories.includes(track.category)) artist.categories.push(track.category);
    byName.set(track.artist, artist);
  }
  return [...byName.values()]
    .map(({ songs: _songs, ...artist }) => artist)
    .sort((a, b) => b.trackCount - a.trackCount || a.name.localeCompare(b.name));
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
    const rows = await ctx.db
      .query("tracks")
      .withIndex("by_artist", (q) => q.eq("artist", args.name))
      .collect();
    if (rows.length === 0) return null;
    const tracks = firstOfEachSong(rows);

    const playable = await canPlay(ctx, clerkUserId);
    const categories = [...new Set(rows.map((t) => t.category).filter((c): c is string => Boolean(c)))];
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
    const byKey = new Map<string, { album: string; artist: string; trackCount: number; coverImage?: string; songs: Set<string> }>();
    // shortcut: same capped scan as `allArtists`.
    for (const track of await ctx.db.query("tracks").take(SCAN_LIMIT)) {
      if (!track.album || !track.artist) continue;
      const key = `${track.artist}\u0000${track.album}`;
      const album = byKey.get(key) ?? { album: track.album, artist: track.artist, trackCount: 0, coverImage: undefined, songs: new Set<string>() };
      album.songs.add(track.name);
      album.trackCount = album.songs.size;
      album.coverImage ??= track.coverImage;
      byKey.set(key, album);
    }
    return [...byKey.values()]
      .map(({ songs: _songs, ...album }) => album)
      .sort((a, b) => b.trackCount - a.trackCount || a.album.localeCompare(b.album))
      .slice(0, clampLimit(args.limit, 50));
  },
});
