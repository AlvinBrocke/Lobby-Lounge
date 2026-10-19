import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { logActivity } from "./lib/activity";
import { requireUser } from "./lib/auth";
import { TRIAL_DAYS } from "./lib/billing";
import { BRAND_COLORS, MAX_LOGO_BYTES } from "./lib/brand";
import { FADE_OPTIONS, soundSettings } from "./lib/sound";

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
    audienceGender: v.optional(v.string()),
    ageGroups: v.optional(v.array(v.string())),
    tempo: v.optional(v.union(v.literal("low"), v.literal("mid"), v.literal("high"))),
    sound: v.optional(soundSettings),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    if (args.sound) {
      const { defaultVolume, fadeSeconds } = args.sound;
      if (!Number.isInteger(defaultVolume) || defaultVolume < 0 || defaultVolume > 100) {
        throw new ConvexError("Default volume must be between 0 and 100.");
      }
      if (!FADE_OPTIONS.includes(fadeSeconds)) throw new ConvexError("Pick a fade length from the list.");
    }

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
        ...(args.audienceGender !== undefined && { audienceGender: args.audienceGender }),
        ...(args.ageGroups !== undefined && { ageGroups: args.ageGroups }),
        ...(args.tempo !== undefined && { tempo: args.tempo }),
        ...(args.sound !== undefined && { sound: args.sound }),
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
      audienceGender: args.audienceGender,
      ageGroups: args.ageGroups,
      tempo: args.tempo,
      sound: args.sound,
    });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!profile) return null;
    const logoUrl = profile.logoStorageId ? await ctx.storage.getUrl(profile.logoStorageId) : null;
    return { ...profile, logoUrl };
  },
});

/** Step one of a logo upload: a short-lived URL the browser POSTs the image to. */
export const generateLogoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Saves the brand profile. `logo`: a new upload's storage id, `null` to
 * remove the logo, or omitted to keep it. A replaced logo's file is deleted.
 */
export const saveBrand = mutation({
  args: {
    venueName: v.string(),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    brandColor: v.string(),
    logo: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!profile) throw new ConvexError("Finish onboarding before editing your brand.");
    if (!Object.hasOwn(BRAND_COLORS, args.brandColor)) throw new ConvexError("Pick a colour from the list.");
    const venueName = args.venueName.trim();
    if (!venueName || venueName.length > 80) throw new ConvexError("Company name must be 1–80 characters.");

    if (args.logo) {
      // `_storage` is a system table: it has each file's size and content type.
      const file = await ctx.db.system.get(args.logo);
      if (!file) throw new ConvexError("That logo upload has expired. Add it again.");
      // contentType is only known when the upload sent one; the app always does.
      // shortcut: a rejected upload stays in storage (deleting it here would roll back with the throw); add a cleanup cron if it matters.
      if ((file.contentType && !file.contentType.startsWith("image/")) || file.size > MAX_LOGO_BYTES) {
        throw new ConvexError("The logo must be an image smaller than 2 MB.");
      }
    }
    if (args.logo !== undefined && profile.logoStorageId && profile.logoStorageId !== args.logo) {
      await ctx.storage.delete(profile.logoStorageId);
    }

    await ctx.db.patch(profile._id, {
      venueName,
      country: args.country || undefined,
      region: args.region?.trim() || undefined,
      brandColor: args.brandColor,
      ...(args.logo !== undefined && { logoStorageId: args.logo ?? undefined }),
    });
    await logActivity(ctx, clerkUserId, "Updated the venue brand");
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
