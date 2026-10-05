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

  const trialEndsAt = profile.trialEndsAt ?? profile._creationTime + TRIAL_DAYS * DAY_MS;
  return { status: now < trialEndsAt ? "trial" : "expired", trialEndsAt };
}

/** Whole days left in a trial, rounded up so the last day reads "1 day". */
export function trialDaysLeft(access: Access, now: number): number {
  if (access.trialEndsAt === null) return 0;
  return Math.max(0, Math.ceil((access.trialEndsAt - now) / DAY_MS));
}
