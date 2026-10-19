import type { MutationCtx } from "../_generated/server";

/**
 * Appends a line to the venue's activity log. `clerkUserId` is the venue
 * owner (what `requireUser()` returned); the actor comes from the token, so a
 * curator's change is filed under the venue but still names the curator.
 * Call it after the write, so a mutation that throws logs nothing.
 */
export async function logActivity(ctx: MutationCtx, clerkUserId: string, summary: string): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return;
  await ctx.db.insert("activity", {
    clerkUserId,
    actorId: identity.subject,
    actorName: identity.name ?? identity.email ?? "Someone",
    summary,
  });
}
