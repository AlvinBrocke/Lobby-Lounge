"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { accessFor, trialDaysLeft } from "@convex/lib/billing";
import { useNow } from "./useNow";

/**
 * The signed-in user's trial/plan status, or `undefined` while loading.
 *
 * Status is computed here with the browser clock rather than in a Convex
 * query: Convex caches a query's result until the data it read changes, so a
 * query using `Date.now()` wouldn't notice the trial ending. The server still
 * enforces access itself when handing out audio (`playlists.getTracks`).
 */
export function useAccess() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");
  const now = useNow(60_000).getTime();

  if (profile === undefined) return undefined;
  const access = accessFor(profile, now);
  return { profile, access, daysLeft: trialDaysLeft(access, now) };
}
