import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("playlists")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    clerkUserId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("playlists", {
      clerkUserId: args.clerkUserId,
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
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
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
    await ctx.db.delete(args.playlistTrackId);
  },
});

export const getTracks = query({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
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
