import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";

/**
 * The caller's loved and blocked tracks, newest first, with enough track
 * detail to list them. No `audioUrl`: audio only ever comes from
 * `playlists.getTracks`, where the trial gate lives.
 */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const reactions = await ctx.db
      .query("trackReactions")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .collect();
    const rows = await Promise.all(
      reactions.map(async (r) => {
        const track = await ctx.db.get(r.trackId);
        if (!track) return null; // the track left the catalogue
        return {
          trackId: r.trackId,
          kind: r.kind,
          name: track.name,
          artist: track.artist,
          coverImage: track.coverImage,
          duration: track.duration,
        };
      }),
    );
    return rows.filter((r) => r !== null);
  },
});

/** Love, block, or clear (`kind: null`) a track for the caller. */
export const set = mutation({
  args: {
    trackId: v.id("tracks"),
    kind: v.union(v.literal("like"), v.literal("block"), v.null()),
  },
  handler: async (ctx, { trackId, kind }) => {
    const clerkUserId = await requireUser(ctx);
    if (!(await ctx.db.get(trackId))) throw new Error("Track not found");
    const existing = await ctx.db
      .query("trackReactions")
      .withIndex("by_user_and_track", (q) => q.eq("clerkUserId", clerkUserId).eq("trackId", trackId))
      .unique();
    if (kind === null) {
      if (existing) await ctx.db.delete(existing._id);
    } else if (existing) {
      await ctx.db.patch(existing._id, { kind });
    } else {
      await ctx.db.insert("trackReactions", { clerkUserId, trackId, kind });
    }
  },
});
