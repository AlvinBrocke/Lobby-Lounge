import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdate = mutation({
  args: {
    clerkUserId: v.string(),
    displayName: v.optional(v.string()),
    venueName: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    mood: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.displayName !== undefined && { displayName: args.displayName }),
        ...(args.venueName !== undefined && { venueName: args.venueName }),
        ...(args.genres !== undefined && { genres: args.genres }),
        ...(args.mood !== undefined && { mood: args.mood }),
        ...(args.onboardingCompleted !== undefined && {
          onboardingCompleted: args.onboardingCompleted,
        }),
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      clerkUserId: args.clerkUserId,
      displayName: args.displayName,
      venueName: args.venueName,
      plan: "trial",
      genres: args.genres ?? [],
      mood: args.mood,
      onboardingCompleted: args.onboardingCompleted ?? false,
    });
  },
});

export const get = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();
  },
});
