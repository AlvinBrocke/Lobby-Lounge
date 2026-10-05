import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";
import { TRIAL_DAYS } from "./lib/billing";

export const createOrUpdate = mutation({
  args: {
    displayName: v.optional(v.string()),
    venueName: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    mood: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    businessType: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    locationCount: v.optional(v.number()),
    guestDemographics: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
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
        ...(args.businessType !== undefined && { businessType: args.businessType }),
        ...(args.country !== undefined && { country: args.country }),
        ...(args.region !== undefined && { region: args.region }),
        ...(args.locationCount !== undefined && { locationCount: args.locationCount }),
        ...(args.guestDemographics !== undefined && {
          guestDemographics: args.guestDemographics,
        }),
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      clerkUserId,
      displayName: args.displayName,
      venueName: args.venueName,
      plan: "trial",
      genres: args.genres ?? [],
      mood: args.mood,
      onboardingCompleted: args.onboardingCompleted ?? false,
      businessType: args.businessType,
      country: args.country,
      region: args.region,
      locationCount: args.locationCount,
      guestDemographics: args.guestDemographics,
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

/* ── Billing admin (internal only) ────────────────────────────────────────── */
// Billing is a Stripe Payment Link with no webhook, so after a payment lands
// you flip the plan by hand. The Stripe payment's "client_reference_id" is
// the Clerk user id to pass here:
//   npx convex run userProfiles:setPlan '{"clerkUserId":"user_...","plan":"basic"}'

async function profileFor(ctx: MutationCtx, clerkUserId: string) {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
  if (!profile) throw new Error(`No profile for ${clerkUserId}`);
  return profile;
}

export const setPlan = internalMutation({
  args: {
    clerkUserId: v.string(),
    plan: v.union(v.literal("trial"), v.literal("basic")),
  },
  handler: async (ctx, args) => {
    const profile = await profileFor(ctx, args.clerkUserId);
    await ctx.db.patch(profile._id, { plan: args.plan });
  },
});

/** Gives a trial user `days` more days from now (default: a full trial). */
export const extendTrial = internalMutation({
  args: { clerkUserId: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const profile = await profileFor(ctx, args.clerkUserId);
    const days = args.days ?? TRIAL_DAYS;
    await ctx.db.patch(profile._id, { trialEndsAt: Date.now() + days * 24 * 60 * 60 * 1000 });
  },
});
