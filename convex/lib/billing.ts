/**
 * Subscription access rules. Pure functions with no Convex imports, so the
 * same logic runs server-side (gating audio in queries) and in the browser
 * (banners, the account page).
 */

export const TRIAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Plans a profile can be on. `plan` is stored as a plain string. */
export type Plan = "trial" | "basic";

export type AccessStatus = "trial" | "active" | "expired";

export interface Access {
  status: AccessStatus;
  /** When the trial ends (or ended), in ms. Null for paying customers. */
  trialEndsAt: number | null;
}

/** The profile fields access depends on. */
export interface BillingProfile {
  plan: string;
  _creationTime: number;
  trialEndsAt?: number;
}

/**
 * Whether `profile` may play music at `now`. The trial starts when the profile
 * is created (end of onboarding) unless `trialEndsAt` overrides it. No
 * profile means no access.
 */
export function accessFor(profile: BillingProfile | null, now: number): Access {
  if (!profile) return { status: "expired", trialEndsAt: null };
  if (profile.plan === "basic") return { status: "active", trialEndsAt: null };

  const trialEndsAt = trialEndFor(profile);
  return { status: now < trialEndsAt ? "trial" : "expired", trialEndsAt };
}

/** When the profile's free trial ends (or ended), in ms, whatever its plan. */
export function trialEndFor(profile: BillingProfile): number {
  return profile.trialEndsAt ?? profile._creationTime + TRIAL_DAYS * DAY_MS;
}

/**
 * Stripe Checkout only accepts a `trial_end` at least 48 hours away. Within
 * that window (or after the trial) the first $20 is charged at checkout.
 */
export const MIN_CHECKOUT_TRIAL_MS = 48 * 60 * 60 * 1000;

/**
 * The `subscription_data.trial_end` (Unix seconds) for a new Checkout
 * session, so subscribing early doesn't cut the free trial short. Null means
 * "bill immediately". A little margin keeps a request in flight from landing
 * under Stripe's 48-hour minimum.
 */
export function checkoutTrialEnd(profile: BillingProfile, now: number): number | null {
  const end = trialEndFor(profile);
  if (end - now < MIN_CHECKOUT_TRIAL_MS + 5 * 60 * 1000) return null;
  return Math.floor(end / 1000);
}

/** Whole days left in a trial, rounded up so the last day reads "1 day". */
export function trialDaysLeft(access: Access, now: number): number {
  if (access.trialEndsAt === null) return 0;
  return Math.max(0, Math.ceil((access.trialEndsAt - now) / DAY_MS));
}
