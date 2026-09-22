"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { getSession, getConvexToken } from "@/lib/session";

// Every field is optional so "Skip for now" can submit a mostly blank payload.
type OnboardingInput = {
  displayName?: string;
  venueName?: string;
  country?: string;
  region?: string;
  locationCount?: number;
  businessType?: string;
  guestDemographics?: string[];
  genres?: string[];
  mood?: string;
};

const isOptionalString = (v: unknown, max = 200) =>
  v === undefined || (typeof v === "string" && v.length <= max);
const isOptionalStringArray = (v: unknown, max = 20) =>
  v === undefined ||
  (Array.isArray(v) &&
    v.length <= max &&
    v.every((x) => typeof x === "string" && x.length <= 100));

// Server Actions are public endpoints — the browser can send anything, so
// check shapes and sizes here rather than trusting the form.
function isValidInput(input: OnboardingInput) {
  return (
    isOptionalString(input.displayName) &&
    isOptionalString(input.venueName) &&
    isOptionalString(input.country) &&
    isOptionalString(input.region) &&
    isOptionalString(input.businessType) &&
    isOptionalString(input.mood) &&
    isOptionalStringArray(input.guestDemographics) &&
    isOptionalStringArray(input.genres) &&
    (input.locationCount === undefined ||
      (Number.isInteger(input.locationCount) &&
        input.locationCount >= 0 &&
        input.locationCount <= 100_000))
  );
}

export type OnboardingResult = { ok: true } | { ok: false; error: string };

// Clerk publicMetadata is readable by the client but only writable through the
// Backend API, which is what makes it safe to use as the onboarding gate. It is
// mirrored into the session JWT as `metadata.onboardingComplete` (see
// types/globals.d.ts) so src/proxy.ts can read it without a DB round-trip.
async function setOnboardedClaim(userId: string) {
  const client = await clerkClient(); // v6: clerkClient() returns a Promise
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboardingComplete: true }, // shallow-merged with existing keys
  });
}

export async function completeOnboarding(
  input: OnboardingInput,
): Promise<OnboardingResult> {
  // Layer 3: re-verify at the top of every Server Action — the client is untrusted.
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };

  if (!input || !isValidInput(input)) {
    return { ok: false, error: "Some of your answers look invalid. Please try again." };
  }

  try {
    const token = await getConvexToken();

    // 1. Convex first. If this fails we haven't flipped the gate yet.
    await fetchMutation(
      api.userProfiles.createOrUpdate,
      {
        displayName: input.displayName,
        venueName: input.venueName || undefined,
        country: input.country,
        region: input.region,
        locationCount: input.locationCount,
        businessType: input.businessType,
        guestDemographics: input.guestDemographics,
        genres: input.genres,
        mood: input.mood,
        onboardingCompleted: true,
      },
      { token },
    );

    // 2. Then the claim. If this fails, syncOnboardingClaim heals it next visit.
    await setOnboardedClaim(session.userId);
    return { ok: true };
  } catch (e) {
    console.error("completeOnboarding failed", e);
    return {
      ok: false,
      error: "Could not save your preferences. Please try again.",
    };
  }
}

/**
 * Backfill for users who completed onboarding before the JWT claim existed
 * (their Convex profile says done, but Clerk metadata is empty). Trusts Convex,
 * queried with the user's own token — never the client.
 */
export async function syncOnboardingClaim(): Promise<OnboardingResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };
  if (session.onboardingComplete) return { ok: true };

  const token = await getConvexToken();
  const profile = await fetchQuery(api.userProfiles.get, {}, { token });
  if (!profile?.onboardingCompleted) {
    return { ok: false, error: "Onboarding not complete" };
  }

  await setOnboardedClaim(session.userId);
  return { ok: true };
}
