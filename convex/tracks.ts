import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    if (args.channelId) {
      return await ctx.db
        .query("tracks")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .collect();
    }
    return await ctx.db.query("tracks").collect();
  },
});

export const get = query({
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()),
    energy: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    channelId: v.optional(v.id("channels")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tracks", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("tracks"),
    name: v.optional(v.string()),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()),
    energy: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    channelId: v.optional(v.id("channels")),
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
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tracks").first();
    if (existing) return "already seeded";

    const tracksData = [
      { name: "Blue Bossa", artist: "Chet Baker Trio", category: "Jazz", duration: 262, energy: "low" },
      { name: "Autumn Leaves", artist: "Coltrane Quartet", category: "Jazz", duration: 287, energy: "low" },
      { name: "So What", artist: "Miles Davis", category: "Jazz", duration: 314, energy: "mid" },
      { name: "Fly Me to the Moon", artist: "Frank Sinatra", category: "Jazz", duration: 188, energy: "low" },
      { name: "Floating", artist: "Ethereal Waves", category: "Ambient", duration: 432, energy: "low" },
      { name: "Rain Garden", artist: "Nature Sounds", category: "Ambient", duration: 480, energy: "low" },
      { name: "Deep Focus Flow", artist: "Ambient Collective", category: "Focus", duration: 370, energy: "low" },
      { name: "Morning Flow", artist: "Study Sessions", category: "Focus", duration: 345, energy: "low" },
      { name: "Neon City", artist: "Synthwave Kids", category: "Electronic", duration: 295, energy: "high" },
      { name: "Golden Hour", artist: "Indie Folk", category: "Pop", duration: 235, energy: "mid" },
    ];

    for (const track of tracksData) {
      await ctx.db.insert("tracks", track);
    }

    return "seeded";
  },
});
