import { ConvexError, v } from "convex/values";
import { action, httpAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireUser } from "./lib/auth";
import { checkoutTrialEnd } from "./lib/billing";
import {
  isLiveSubscription,
  stripeRequest,
  subscriptionIdFor,
  verifyStripeSignature,
  type StripeEvent,
  type StripeSubscription,
} from "./lib/stripe";

/*
 * Stripe billing: Checkout to subscribe, the customer portal to manage, and a
 * webhook that keeps `userProfiles.plan` in sync. Setup lives in CLAUDE.md →
 * "Billing (Stripe)". Everything is keyed by the venue owner's Clerk user id
 * (what `requireUser` returns), so an admin paying for the venue credits the
 * owner's profile.
 */

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Run \`npx convex env set ${name} <value>\`.`);
  return value;
}

/** `SITE_URL` without a trailing slash, e.g. https://www.lobbyloungemusic.com */
function siteUrl() {
  return env("SITE_URL").replace(/\/+$/, "");
}

/* ── Internal reads & writes ──────────────────────────────────────────────── */

export const profileByUser = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

/** Stores the Stripe customer id once. Returns whichever id ends up stored. */
export const saveCustomer = internalMutation({
  args: { clerkUserId: v.string(), stripeCustomerId: v.string() },
  handler: async (ctx, { clerkUserId, stripeCustomerId }) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!profile) throw new Error(`No profile for ${clerkUserId}`);
    // A double click can race two customer creations; keep the first one.
    if (profile.stripeCustomerId) return profile.stripeCustomerId;
    await ctx.db.patch(profile._id, { stripeCustomerId });
    return stripeCustomerId;
  },
});

/**
 * Applies a subscription's current state to the venue's profile. Called by
 * the webhook with a subscription freshly fetched from Stripe, so events
 * arriving out of order still leave the latest state.
 */
export const syncSubscription = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = args.clerkUserId
      ? await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId!))
          .unique()
      : await ctx.db
          .query("userProfiles")
          .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
          .first();
    if (!profile) {
      console.warn(`Stripe subscription ${args.stripeSubscriptionId} matches no profile; ignoring.`);
      return "no_profile" as const;
    }

    const live = isLiveSubscription(args.status);
    // An old subscription ending must not cancel a newer one.
    if (!live && profile.stripeSubscriptionId && profile.stripeSubscriptionId !== args.stripeSubscriptionId) {
      return "stale" as const;
    }

    await ctx.db.patch(profile._id, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: args.status,
      // Back to "trial" when it ends: access then follows the trial dates,
      // which are long past for anyone who has been paying.
      plan: live ? "basic" : "trial",
    });
    return live ? ("basic" as const) : ("trial" as const);
  },
});

/* ── Called from the app ──────────────────────────────────────────────────── */

/**
 * Starts Stripe Checkout for the venue's subscription and returns its URL.
 * The card is collected now; a venue still in its free trial isn't charged
 * until the trial ends (see `checkoutTrialEnd`).
 */
export const startCheckout = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const clerkUserId = await requireUser(ctx);
    const identity = await ctx.auth.getUserIdentity();
    const profile = await ctx.runQuery(internal.billing.profileByUser, { clerkUserId });
    if (!profile) throw new ConvexError("Finish setting up your venue before subscribing.");
    if (profile.plan === "basic") {
      throw new ConvexError("Your subscription is already active. Use “Manage subscription” to change it.");
    }

    let customerId = profile.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeRequest<{ id: string }>("POST", "/customers", {
        email: typeof identity?.email === "string" ? identity.email : undefined,
        name: profile.venueName || undefined,
        metadata: { clerkUserId },
      });
      customerId = await ctx.runMutation(internal.billing.saveCustomer, {
        clerkUserId,
        stripeCustomerId: customer.id,
      });
    }

    const base = siteUrl();
    const session = await stripeRequest<{ url: string }>("POST", "/checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      client_reference_id: clerkUserId,
      line_items: [{ price: env("STRIPE_PRICE_ID"), quantity: 1 }],
      subscription_data: {
        metadata: { clerkUserId },
        trial_end: checkoutTrialEnd(profile, Date.now()),
      },
      success_url: `${base}/settings?tab=billing&checkout=success`,
      cancel_url: `${base}/settings?tab=billing&checkout=cancelled`,
    });
    return session.url;
  },
});

/** A Stripe customer-portal URL: update the card, see invoices, cancel. */
export const openPortal = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const clerkUserId = await requireUser(ctx);
    const profile = await ctx.runQuery(internal.billing.profileByUser, { clerkUserId });
    if (!profile?.stripeCustomerId) {
      throw new ConvexError("There's no billing account yet. Subscribe first.");
    }
    const session = await stripeRequest<{ url: string }>("POST", "/billing_portal/sessions", {
      customer: profile.stripeCustomerId,
      return_url: `${siteUrl()}/settings?tab=billing`,
    });
    return session.url;
  },
});

/* ── Webhook (routed in convex/http.ts) ───────────────────────────────────── */

export const stripeWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting Stripe webhook.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret);
  if (!valid) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(payload) as StripeEvent;
  const subscriptionId = subscriptionIdFor(event);
  if (!subscriptionId) return new Response(null, { status: 200 });

  try {
    // Re-read the subscription rather than trusting the event body, so a
    // late-arriving old event can't overwrite newer state.
    const sub = await stripeRequest<StripeSubscription>("GET", `/subscriptions/${subscriptionId}`);
    await ctx.runMutation(internal.billing.syncSubscription, {
      clerkUserId: sub.metadata?.clerkUserId || undefined,
      stripeCustomerId: sub.customer,
      stripeSubscriptionId: sub.id,
      status: sub.status,
    });
  } catch (err) {
    console.error(`Stripe webhook ${event.id} (${event.type}) failed:`, err);
    // A non-2xx makes Stripe retry with backoff.
    return new Response("Sync failed", { status: 500 });
  }
  return new Response(null, { status: 200 });
});
