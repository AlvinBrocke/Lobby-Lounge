import { query } from "./_generated/server";
import { requireUser } from "./lib/auth";

/** The venue's 50 most recent changes, newest first. */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db
      .query("activity")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .take(50);
  },
});
