import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertOwner, requireUser } from "./lib/auth";

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db
      .query("scheduleBlocks")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();
  },
});

export const create = mutation({
  args: {
    day: v.string(),
    startHour: v.number(),
    duration: v.number(),
    channelId: v.optional(v.id("channels")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db.insert("scheduleBlocks", { ...args, clerkUserId });
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
    const clerkUserId = await requireUser(ctx);
    const { id, ...fields } = args;

    const block = await ctx.db.get(id);
    assertOwner(block, clerkUserId, "Schedule block");

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("scheduleBlocks") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);

    const block = await ctx.db.get(args.id);
    assertOwner(block, clerkUserId, "Schedule block");

    await ctx.db.delete(args.id);
  },
});
