import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { logActivity } from "./lib/activity";
import { requireUser, requireVenueAdmin } from "./lib/auth";
import {
  DEFAULT_SETTINGS,
  HOLD_MS,
  LEVELS,
  MAX_BUSY_ORDERS,
  WINDOW_MS,
  autoLobbySettings,
  baselineRate,
  baselineWindows,
  changeSummary,
  type MeterReading,
} from "./lib/autolobby";

/*
 * AutoLobby, server side: the venue's settings and the busyness meter.
 * The player does the rest (src/hooks/useAutoLobby.ts). Rules live in
 * convex/lib/autolobby.ts; order times come from convex/square.ts.
 */

async function profileOf(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

async function countOrders(ctx: QueryCtx, clerkUserId: string, from: number, to: number) {
  const rows = await ctx.db
    .query("posOrders")
    .withIndex("by_clerk_user_and_at", (q) => q.eq("clerkUserId", clerkUserId).gte("at", from).lt("at", to))
    .collect();
  return rows.length;
}

/** The venue's AutoLobby settings (defaults when never saved) and the peak playlist's name. */
export const settings = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const saved = (await profileOf(ctx, clerkUserId))?.autoLobby;
    const s = { ...DEFAULT_SETTINGS, ...saved };
    const peak = s.peakPlaylistId ? await ctx.db.get(s.peakPlaylistId) : null;
    return { ...s, peakPlaylistName: peak?.name ?? null };
  },
});

/** Settings → Integrations → AutoLobby. Admins only, like the Square connection. */
export const saveSettings = mutation({
  args: autoLobbySettings,
  handler: async (ctx, args) => {
    const clerkUserId = await requireVenueAdmin(ctx, "Only venue admins can change AutoLobby.");
    const profile = await profileOf(ctx, clerkUserId);
    if (!profile) throw new ConvexError("Finish onboarding first.");
    const busyOrders = Math.round(args.busyOrders);
    if (!Number.isFinite(busyOrders) || busyOrders < 1 || busyOrders > MAX_BUSY_ORDERS) {
      throw new ConvexError(`The busy order count must be between 1 and ${MAX_BUSY_ORDERS}.`);
    }
    if (args.peakPlaylistId) {
      const playlist = await ctx.db.get(args.peakPlaylistId);
      if (!playlist || !(playlist.curated || playlist.clerkUserId === clerkUserId)) {
        throw new ConvexError("Pick one of your playlists or a Lobby & Lounge playlist.");
      }
    }
    const wasEnabled = profile.autoLobby?.enabled ?? false;
    await ctx.db.patch(profile._id, { autoLobby: { ...args, busyOrders } });
    if (wasEnabled !== args.enabled) {
      await logActivity(ctx, clerkUserId, args.enabled ? "Turned on AutoLobby" : "Turned off AutoLobby");
    } else {
      await logActivity(ctx, clerkUserId, "Updated AutoLobby settings");
    }
  },
});

/**
 * Orders in the last 15 minutes, and the venue's normal for this time of
 * week. `now` comes from the player, rounded to the minute: Convex caches a
 * query until its inputs change, so a query reading the clock itself would
 * never notice time passing. Null when no POS location is connected.
 */
export const meter = query({
  args: { now: v.number() },
  handler: async (ctx, { now }): Promise<MeterReading | null> => {
    const clerkUserId = await requireUser(ctx);
    const conn = await ctx.db
      .query("squareConnections")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (!conn || conn.status !== "connected" || !conn.locationId) return null;
    // A sane clock only: within a day of the server's.
    if (Math.abs(now - Date.now()) > 24 * 60 * 60 * 1000) throw new ConvexError("Check this device's clock.");

    const recent = await countOrders(ctx, clerkUserId, now - WINDOW_MS, now);
    const windows = baselineWindows(now, conn.connectedAt);
    const counts = await Promise.all(windows.map((w) => countOrders(ctx, clerkUserId, w.from, w.to)));
    return { recent, baseline: baselineRate(counts), weeks: windows.length };
  },
});

/**
 * Activity log line when the music follows a new level. Every playing device
 * reports its change, so the same line within the hold time is logged once.
 */
export const logChange = mutation({
  args: {
    level: v.union(...LEVELS.map((l) => v.literal(l))),
    playlistName: v.optional(v.string()),
  },
  handler: async (ctx, { level, playlistName }) => {
    const clerkUserId = await requireUser(ctx);
    const summary = changeSummary(level, playlistName?.slice(0, 80));
    const recent = await ctx.db
      .query("activity")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .take(10);
    if (recent.some((r) => r.summary === summary && Date.now() - r._creationTime < HOLD_MS)) return;
    await logActivity(ctx, clerkUserId, summary);
  },
});
