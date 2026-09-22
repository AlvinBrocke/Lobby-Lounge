import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { assertOwner, requireUser } from "./lib/auth";

/**
 * Read access to a playlist: the owner, or anyone when it is marked public.
 * Returns null for a genuinely missing id; throws when access is denied.
 */
async function readablePlaylist(
  ctx: QueryCtx | MutationCtx,
  id: Id<"playlists">,
  clerkUserId: string,
): Promise<Doc<"playlists"> | null> {
  const playlist = await ctx.db.get(id);
  if (!playlist) return null;
  if (playlist.clerkUserId !== clerkUserId && !playlist.isPublic) {
    throw new Error("Not authorized");
  }
  return playlist;
}

const MAX_NAME = 80;
const MAX_DESCRIPTION = 300;

/** Trims and bounds a playlist name; throws on empty/oversized input. */
function cleanName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Playlist name is required");
  if (trimmed.length > MAX_NAME) {
    throw new Error(`Playlist name must be ${MAX_NAME} characters or fewer`);
  }
  return trimmed;
}

function cleanDescription(description: string | undefined): string | undefined {
  if (description === undefined) return undefined;
  const trimmed = description.trim();
  if (trimmed.length > MAX_DESCRIPTION) {
    throw new Error(`Description must be ${MAX_DESCRIPTION} characters or fewer`);
  }
  return trimmed;
}

/** Loads a playlist and throws unless the caller owns it. */
async function ownedPlaylist(
  ctx: MutationCtx,
  id: Id<"playlists">,
  clerkUserId: string,
): Promise<Doc<"playlists">> {
  const playlist = await ctx.db.get(id);
  assertOwner(playlist, clerkUserId, "Playlist");
  return playlist;
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();

    // Enrich each playlist with the stats its card shows, so the grid needs one
    // query instead of one per playlist.
    const enriched = await Promise.all(
      playlists.map(async (playlist) => {
        const entries = await ctx.db
          .query("playlistTracks")
          .withIndex("by_playlist", (q) => q.eq("playlistId", playlist._id))
          .collect();
        entries.sort((a, b) => a.position - b.position);
        const tracks = (
          await Promise.all(entries.map((e) => ctx.db.get(e.trackId)))
        ).filter((t): t is Doc<"tracks"> => t !== null);

        return {
          ...playlist,
          trackCount: tracks.length,
          totalDuration: tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0),
          coverImage:
            playlist.coverImage ?? tracks.find((t) => t.coverImage)?.coverImage,
        };
      }),
    );

    // Newest first.
    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const get = query({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    return await readablePlaylist(ctx, args.id, clerkUserId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db.insert("playlists", {
      clerkUserId,
      name: cleanName(args.name),
      description: cleanDescription(args.description),
      coverImage: args.coverImage,
      isPublic: args.isPublic ?? false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("playlists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const { id, ...fields } = args;

    await ownedPlaylist(ctx, id, clerkUserId);

    if (fields.name !== undefined) fields.name = cleanName(fields.name);
    fields.description = cleanDescription(fields.description);

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    await ownedPlaylist(ctx, args.id, clerkUserId);

    // Remove all tracks from playlist first
    const tracks = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.id))
      .collect();
    for (const t of tracks) {
      await ctx.db.delete(t._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const addTrack = mutation({
  args: {
    playlistId: v.id("playlists"),
    trackId: v.id("tracks"),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    await ownedPlaylist(ctx, args.playlistId, clerkUserId);

    // Prevent duplicates
    const existing = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist_and_track", (q) =>
        q.eq("playlistId", args.playlistId).eq("trackId", args.trackId),
      )
      .unique();
    if (existing) return existing._id;

    const track = await ctx.db.get(args.trackId);
    if (!track) throw new Error("Track not found");

    const entries = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.playlistId))
      .collect();
    // Append after the highest position, not at `entries.length`: after a
    // removal the count is lower than the last position, which would collide.
    const nextPosition =
      entries.reduce((max, e) => Math.max(max, e.position), -1) + 1;

    return await ctx.db.insert("playlistTracks", {
      playlistId: args.playlistId,
      trackId: args.trackId,
      position: args.position ?? nextPosition,
    });
  },
});

export const removeTrack = mutation({
  args: { playlistTrackId: v.id("playlistTracks") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);

    const playlistTrack = await ctx.db.get(args.playlistTrackId);
    if (!playlistTrack) throw new Error("Playlist track not found");
    await ownedPlaylist(ctx, playlistTrack.playlistId, clerkUserId);

    await ctx.db.delete(args.playlistTrackId);
  },
});

export const getTracks = query({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const playlist = await readablePlaylist(ctx, args.playlistId, clerkUserId);
    if (!playlist) return [];

    const playlistTracks = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.playlistId))
      .collect();

    playlistTracks.sort((a, b) => a.position - b.position);

    const tracks = await Promise.all(
      playlistTracks.map(async (pt) => {
        const track = await ctx.db.get(pt.trackId);
        // A track can vanish from the catalogue (e.g. a Jamendo resync). Drop
        // it here — spreading `null` would yield a truthy half-empty object.
        if (!track) return null;
        return { ...track, playlistTrackId: pt._id, position: pt.position };
      }),
    );

    return tracks.filter((t) => t !== null);
  },
});
