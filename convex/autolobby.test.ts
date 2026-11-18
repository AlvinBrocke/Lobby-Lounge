import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import { WEEK_MS } from "./lib/autolobby";
import schema from "./schema";

const OWNER = "user_owner123";
const NOW = Date.now();

function setup() {
  return convexTest(schema, import.meta.glob("./**/*.ts"));
}

async function venue(t: ReturnType<typeof setup>, connectedAt = NOW - 5 * WEEK_MS, locationId: string | null = "L1") {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", { clerkUserId: OWNER, plan: "trial", genres: [], onboardingCompleted: true });
    await ctx.db.insert("squareConnections", {
      clerkUserId: OWNER,
      merchantId: "M1",
      accessTokenEnc: "v1.x.y",
      accessTokenExpiresAt: NOW + WEEK_MS,
      status: "connected",
      locationId: locationId ?? undefined,
      connectedAt,
    });
  });
}

async function orders(t: ReturnType<typeof setup>, times: number[]) {
  await t.run(async (ctx) => {
    for (const [i, at] of times.entries()) {
      await ctx.db.insert("posOrders", { clerkUserId: OWNER, source: "square", orderId: `o${at}-${i}`, at });
    }
  });
}

const owner = (t: ReturnType<typeof setup>) => t.withIdentity({ subject: OWNER, name: "Jo" });

describe("autolobby.meter", () => {
  it("counts the last 15 minutes and the same hour in past weeks", async () => {
    const t = setup();
    await venue(t);
    // 6 orders in the last 15 minutes, 1 just outside it.
    await orders(t, [1, 2, 3, 4, 5, 6].map((m) => NOW - m * 60_000).concat(NOW - 20 * 60_000));
    // 20 orders around this time one week ago, 20 two weeks ago.
    await orders(t, Array.from({ length: 20 }, (_, i) => NOW - WEEK_MS + (i - 10) * 60_000));
    await orders(t, Array.from({ length: 20 }, (_, i) => NOW - 2 * WEEK_MS + (i - 10) * 60_000));
    const r = await owner(t).query(api.autolobby.meter, { now: NOW });
    expect(r?.recent).toBe(6);
    expect(r?.weeks).toBe(4);
    // (20 + 20 + 0 + 0) / 4 weeks per hour → 2.5 per 15 minutes.
    expect(r?.baseline).toBe(2.5);
  });

  it("only uses weeks since the venue connected", async () => {
    const t = setup();
    await venue(t, NOW - 9 * 86_400_000);
    const r = await owner(t).query(api.autolobby.meter, { now: NOW });
    expect(r).toEqual({ recent: 0, baseline: 0, weeks: 1 });
  });

  it("is null until a location is chosen", async () => {
    const t = setup();
    await venue(t, NOW - WEEK_MS, null);
    expect(await owner(t).query(api.autolobby.meter, { now: NOW })).toBeNull();
  });

  it("refuses a device clock that is days off", async () => {
    const t = setup();
    await venue(t);
    await expect(owner(t).query(api.autolobby.meter, { now: NOW - 3 * 86_400_000 })).rejects.toThrow(/clock/);
  });
});

describe("autolobby.saveSettings", () => {
  it("saves settings and logs turning it on", async () => {
    const t = setup();
    await venue(t);
    await owner(t).mutation(api.autolobby.saveSettings, { enabled: true, strength: "strong", busyOrders: 12.4 });
    const s = await owner(t).query(api.autolobby.settings, {});
    expect(s).toMatchObject({ enabled: true, strength: "strong", busyOrders: 12, peakPlaylistName: null });
    const log = await t.run((ctx) => ctx.db.query("activity").collect());
    expect(log.map((r) => r.summary)).toEqual(["Turned on AutoLobby"]);
  });

  it("defaults to off with a busy count of 10", async () => {
    const t = setup();
    await venue(t);
    expect(await owner(t).query(api.autolobby.settings, {})).toMatchObject({ enabled: false, strength: "balanced", busyOrders: 10 });
  });

  it("accepts a curated or own peak playlist, not someone else's", async () => {
    const t = setup();
    await venue(t);
    const [curated, mine, theirs] = await t.run(async (ctx) => [
      await ctx.db.insert("playlists", { name: "Energetic", isPublic: true, curated: true }),
      await ctx.db.insert("playlists", { name: "Friday Peak", isPublic: false, clerkUserId: OWNER }),
      await ctx.db.insert("playlists", { name: "Not yours", isPublic: true, clerkUserId: "user_other" }),
    ]);
    const base = { enabled: true, strength: "balanced" as const, busyOrders: 10 };
    await owner(t).mutation(api.autolobby.saveSettings, { ...base, peakPlaylistId: curated });
    await owner(t).mutation(api.autolobby.saveSettings, { ...base, peakPlaylistId: mine });
    expect((await owner(t).query(api.autolobby.settings, {})).peakPlaylistName).toBe("Friday Peak");
    await expect(owner(t).mutation(api.autolobby.saveSettings, { ...base, peakPlaylistId: theirs })).rejects.toThrow(
      /Pick one of your playlists/,
    );
  });

  it("rejects a silly busy count", async () => {
    const t = setup();
    await venue(t);
    const base = { enabled: true, strength: "balanced" as const };
    await expect(owner(t).mutation(api.autolobby.saveSettings, { ...base, busyOrders: 0 })).rejects.toThrow(/between 1/);
    await expect(owner(t).mutation(api.autolobby.saveSettings, { ...base, busyOrders: 9999 })).rejects.toThrow(/between 1/);
  });

  it("keeps curators out", async () => {
    const t = setup();
    await venue(t);
    const curator = t.withIdentity({ subject: "user_curator", venue_owner: OWNER, org_role: "org:member" });
    await expect(
      curator.mutation(api.autolobby.saveSettings, { enabled: true, strength: "balanced", busyOrders: 10 }),
    ).rejects.toThrow(/Only venue admins/);
  });
});

describe("autolobby.logChange", () => {
  it("logs a level change once even when several devices report it", async () => {
    const t = setup();
    await venue(t);
    await owner(t).mutation(api.autolobby.logChange, { level: "peak", playlistName: "Friday Peak" });
    await owner(t).mutation(api.autolobby.logChange, { level: "peak", playlistName: "Friday Peak" });
    await owner(t).mutation(api.autolobby.logChange, { level: "busy" });
    const log = await t.run((ctx) => ctx.db.query("activity").collect());
    expect(log.map((r) => r.summary)).toEqual(['AutoLobby: Peak, switched to "Friday Peak"', "AutoLobby: Busy"]);
  });
});
