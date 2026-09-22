import "server-only";
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Data Access Layer for the current request's session.
 *
 * Every server-side code path that needs to know who the user is (Server
 * Components, layouts, Server Actions) should go through this file rather than
 * calling Clerk's `auth()` directly. Middleware (`src/proxy.ts`) is only the
 * first, optimistic layer — this is the one that must be correct.
 */

export type Session = {
  userId: string;
  sessionId: string;
  /** Mirrors the `metadata.onboardingComplete` session-token claim. */
  onboardingComplete: boolean;
};

/**
 * Nullable variant — use in Server Actions where you want to return an error
 * to the caller instead of redirecting.
 *
 * `cache` dedupes calls within a single server render, so a layout, page and
 * several components can all call this and Clerk is only consulted once.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const { isAuthenticated, userId, sessionId, sessionClaims } = await auth();
  if (!isAuthenticated) return null;
  return {
    userId,
    sessionId,
    onboardingComplete: sessionClaims?.metadata?.onboardingComplete === true,
  };
});

/**
 * Redirecting variant — use in Server Components and layouts. Never returns
 * when the user is signed out.
 */
export const verifySession = cache(async (): Promise<Session> => {
  const session = await getSession();
  if (!session) redirect("/signin");
  return session;
});

/**
 * A Clerk JWT minted from the "convex" template, for calling Convex from the
 * server with `fetchQuery` / `fetchMutation` from `convex/nextjs`. Convex
 * verifies it against `CLERK_JWT_ISSUER_DOMAIN` (see convex/auth.config.ts).
 */
export async function getConvexToken(): Promise<string> {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("Not authenticated");
  return token;
}
