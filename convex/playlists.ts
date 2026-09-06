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
    return await ctx.db
      .query("playlists")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();
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
      name: args.name,
      description: args.description,
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

    const tracks = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.playlistId))
      .collect();

    return await ctx.db.insert("playlistTracks", {
      playlistId: args.playlistId,
      trackId: args.trackId,
      position: args.position ?? tracks.length,
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
        return { ...track, playlistTrackId: pt._id, position: pt.position };
      }),
    );

    return tracks.filter(Boolean);
  },
});
