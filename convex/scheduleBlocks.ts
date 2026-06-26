import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduleBlocks")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .collect();
  },
});

export const create = mutation({
  args: {
    clerkUserId: v.string(),
    day: v.string(),
    startHour: v.number(),
    duration: v.number(),
    channelId: v.optional(v.id("channels")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduleBlocks", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("scheduleBlocks"),
    day: v.optional(v.string()),
    startHour: v.optional(v.number()),
    duration: v.optional(v.number()),
    channelId: v.optional(v.id("channels")),
    title: v.optional(v.string()),
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
  args: { id: v.id("scheduleBlocks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
