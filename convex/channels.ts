import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channels").collect();
  },
});

export const get = query({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    bpm: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("channels", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("channels"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    bpm: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
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
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("channels").first();
    if (existing) return "already seeded";

    const channelsData = [
      {
        name: "Lounge & Chill",
        description: "Smooth background vibes for lounges and waiting areas",
        category: "Relaxing",
        bpm: 72,
        coverImage:
          "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop",
      },
      {
        name: "Retail Energy",
        description: "Upbeat pop to keep shoppers energised",
        category: "Upbeat",
        bpm: 112,
        coverImage:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
      },
      {
        name: "Deep Focus",
        description: "Instrumental tracks for productive work environments",
        category: "Productivity",
        bpm: 84,
        coverImage:
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop",
      },
      {
        name: "Dinner Jazz",
        description: "Elegant jazz for upscale dining experiences",
        category: "Elegant",
        bpm: 74,
        coverImage:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
      },
      {
        name: "Morning Boost",
        description: "Energetic tracks to kick off the morning rush",
        category: "Energetic",
        bpm: 108,
        coverImage:
          "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=600&fit=crop",
      },
      {
        name: "Ambient Spa",
        description: "Ultra-calm soundscapes for spas and wellness spaces",
        category: "Wellness",
        bpm: 60,
        coverImage:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
      },
      {
        name: "Sunday Brunch",
        description: "Laid-back acoustic grooves perfect for weekend brunch",
        category: "Relaxing",
        bpm: 80,
        coverImage:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
      },
      {
        name: "Late Night Vibes",
        description: "Smooth upbeat rhythms to keep the night going",
        category: "Upbeat",
        bpm: 96,
        coverImage:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop",
      },
    ];

    for (const channel of channelsData) {
      await ctx.db.insert("channels", channel);
    }

    return "seeded";
  },
});
