import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Identity of the caller, taken from the verified Clerk JWT.
 *
 * `identity.subject` is the Clerk user id ("user_2abc..."), which is what the
 * `by_clerk_user` indexes are keyed on. Do not use `tokenIdentifier` — it is
 * issuer-prefixed and will not match stored values.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

/** Throws unless `doc` exists and belongs to `userId`. */
export function assertOwner<T extends { clerkUserId: string }>(
  doc: T | null,
  userId: string,
  what: string,
): asserts doc is T {
  if (!doc) throw new Error(`${what} not found`);
  if (doc.clerkUserId !== userId) throw new Error("Not authorized");
}
