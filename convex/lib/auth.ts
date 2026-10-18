import type { MutationCtx, QueryCtx } from "../_generated/server";
import { accessFor } from "./billing";

/**
 * The Clerk user id whose venue the caller is acting on, taken from the
 * verified Clerk JWT. This is what the `by_clerk_user` indexes are keyed on.
 *
 * Venue staff share the owner's data: when the active Clerk organization is a
 * venue, the "convex" JWT template copies its `publicMetadata.venueOwnerId`
 * into a `venue_owner` claim (see CLAUDE.md → Venue staff). Without one, it's
 * the caller's own id (`identity.subject`). Do not use `tokenIdentifier` — it
 * is issuer-prefixed and will not match stored values.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const venueOwner = identity.venue_owner;
  return typeof venueOwner === "string" && venueOwner !== "" ? venueOwner : identity.subject;
}

/**
 * Throws unless `doc` exists and belongs to `userId`. Ownerless docs (curated
 * playlists) always fail, so users can never modify them.
 */
export function assertOwner<T extends { clerkUserId?: string }>(
  doc: T | null,
  userId: string,
  what: string,
): asserts doc is T {
  if (!doc) throw new Error(`${what} not found`);
  if (doc.clerkUserId !== userId) throw new Error("Not authorized");
}

/**
 * Whether the caller's trial or plan currently allows playback. Queries
 * withhold audio URLs when it doesn't; see `accessFor` for the rules.
 */
export async function canPlay(ctx: QueryCtx | MutationCtx, userId: string): Promise<boolean> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", userId))
    .unique();
  return accessFor(profile, Date.now()).status !== "expired";
}
