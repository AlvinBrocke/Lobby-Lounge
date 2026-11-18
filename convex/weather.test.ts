import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { DEFAULT_SETTINGS } from "./lib/autolobby";
import { MONTHLY_FREE_CALLS, REUSE_WITHIN_MS, USAGE_WARNING_SHARE, monthKey } from "./lib/weather";
import schema from "./schema";

const OWNER = "user_owner123";

function setup() {
  return convexTest(schema, import.meta.glob("./**/*.ts"));
}

const owner = (t: ReturnType<typeof setup>) => t.withIdentity({ subject: OWNER, name: "Jo" });
const curator = (t: ReturnType<typeof setup>) =>
  t.withIdentity({ subject: "user_curator", venue_owner: OWNER, org_role: "org:member" });

async function venue(t: ReturnType<typeof setup>, extra: Record<string, unknown> = {}, clerkUserId = OWNER) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      clerkUserId,
      plan: "trial",
      genres: [],
      onboardingCompleted: true,
      country: "US",
      ...extra,
    });
  });
}

const following = { autoLobby: { ...DEFAULT_SETTINGS, enabled: true, followWeather: true } };

async function profile(t: ReturnType<typeof setup>, clerkUserId = OWNER) {
  return await t.run(async (ctx) =>
    ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique(),
  );
}

function weatherJson(main = "Rain", temp = 8.26) {
  return { weather: [{ main, description: main.toLowerCase() }], main: { temp }, sys: { sunrise: 1, sunset: 2 } };
}

beforeEach(() => {
  vi.stubEnv("OPENWEATHER_API_KEY", "ow_test_key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("weather.status", () => {
  it("has no location until one is set", async () => {
    const t = setup();
    await venue(t);
    expect(await owner(t).query(api.weather.status, {})).toEqual({ configured: true, location: null, reading: null });
  });

  it("says when OpenWeather isn't set up", async () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    const t = setup();
    await venue(t);
    expect((await owner(t).query(api.weather.status, {})).configured).toBe(false);
  });

  it("falls back to the Square location's coordinates, and never returns coordinates", async () => {
    const t = setup();
    await venue(t);
    await t.run(async (ctx) => {
      await ctx.db.insert("squareConnections", {
        clerkUserId: OWNER,
        merchantId: "M1",
        accessTokenEnc: "v1.x.y",
        accessTokenExpiresAt: Date.now() + 1e9,
        status: "connected",
        locationId: "L1",
        locationName: "Main Street",
        latitude: 40.71,
        longitude: -74.01,
        connectedAt: Date.now(),
      });
      await ctx.db.insert("weatherReadings", {
        key: "40.71,-74.01",
        condition: "Clear",
        description: "clear sky",
        tempC: 21,
        fetchedAt: 123,
      });
    });
    const s = await owner(t).query(api.weather.status, {});
    expect(s.location).toEqual({ source: "square", label: "Main Street" });
    expect(s.reading).toMatchObject({ condition: "Clear", tempC: 21, fetchedAt: 123 });
    expect(JSON.stringify(s)).not.toContain("40.71");
  });

  it("prefers the venue's own location over Square's", async () => {
    const t = setup();
    await venue(t, { venueLat: 51.51, venueLon: -0.13, venueLocationLabel: "London, GB", venueLocationSource: "address" });
    await t.run(async (ctx) => {
      await ctx.db.insert("squareConnections", {
        clerkUserId: OWNER,
        merchantId: "M1",
        accessTokenEnc: "v1.x.y",
        accessTokenExpiresAt: Date.now() + 1e9,
        status: "connected",
        latitude: 40.71,
        longitude: -74.01,
        connectedAt: Date.now(),
      });
    });
    expect((await owner(t).query(api.weather.status, {})).location).toEqual({ source: "address", label: "London, GB" });
  });
});

describe("userProfiles.get", () => {
  it("never sends the venue's coordinates to the browser", async () => {
    const t = setup();
    await venue(t, { venueLat: 51.51, venueLon: -0.13, venueLocationLabel: "London, GB" });
    const p = await owner(t).query(api.userProfiles.get, {});
    expect(p).not.toHaveProperty("venueLat");
    expect(p).not.toHaveProperty("venueLon");
    expect(p?.venueLocationLabel).toBe("London, GB");
  });
});

describe("weather.setLocationFromText", () => {
  it("looks up a ZIP with the venue's country, rounds it and fetches the weather", async () => {
    const t = setup();
    await venue(t);
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);
        calls.push(url);
        if (url.includes("/geo/1.0/zip")) return Response.json({ name: "Brooklyn", lat: 40.7081, lon: -73.9571, country: "US" });
        return Response.json(weatherJson());
      }),
    );
    vi.useFakeTimers();
    const res = await owner(t).action(api.weather.setLocationFromText, { text: " 11211 " });
    expect(res).toEqual({ label: "Brooklyn, US" });
    expect(new URL(calls[0]).searchParams.get("zip")).toBe("11211,US");

    expect(await profile(t)).toMatchObject({
      venueLat: 40.71,
      venueLon: -73.96,
      venueLocationLabel: "Brooklyn, US",
      venueLocationSource: "address",
    });

    await t.finishAllScheduledFunctions(vi.runAllTimers);
    const weatherCall = new URL(calls.find((c) => c.includes("/data/2.5/weather"))!);
    expect(weatherCall.searchParams.get("lat")).toBe("40.71");
    expect(weatherCall.searchParams.get("lon")).toBe("-73.96");
    expect(weatherCall.searchParams.get("units")).toBe("metric");
    const s = await owner(t).query(api.weather.status, {});
    expect(s.reading).toMatchObject({ condition: "Rain", tempC: 8.3 });

    const activity = await t.run(async (ctx) => ctx.db.query("activity").collect());
    expect(activity.map((a) => a.summary)).toContain("Set the venue's weather location to Brooklyn, US");
  });

  it("looks up a town by name", async () => {
    const t = setup();
    await venue(t, { country: "GB" });
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      if (url.pathname === "/geo/1.0/direct") {
        expect(url.searchParams.get("q")).toBe("Manchester,GB");
        return Response.json([{ name: "Manchester", lat: 53.4794, lon: -2.2453, country: "GB", state: "England" }]);
      }
      return Response.json(weatherJson("Clouds", 11));
    });
    vi.stubGlobal("fetch", fetchMock);
    expect(await owner(t).action(api.weather.setLocationFromText, { text: "Manchester" })).toEqual({
      label: "Manchester, England, GB",
    });
    expect(await profile(t)).toMatchObject({ venueLat: 53.48, venueLon: -2.25 });
  });

  it("tries the first half of a UK postcode", async () => {
    const t = setup();
    await venue(t, { country: "GB" });
    const zips: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = new URL(String(input));
        if (url.pathname === "/geo/1.0/zip") {
          zips.push(url.searchParams.get("zip")!);
          if (url.searchParams.get("zip") === "SW1A,GB") return Response.json({ name: "London", lat: 51.501, lon: -0.1416, country: "GB" });
          return new Response("not found", { status: 404 });
        }
        return Response.json(weatherJson());
      }),
    );
    await owner(t).action(api.weather.setLocationFromText, { text: "SW1A 1AA" });
    expect(zips).toEqual(["SW1A 1AA,GB", "SW1A,GB"]);
    expect(await profile(t)).toMatchObject({ venueLat: 51.5, venueLon: -0.14 });
  });

  it("says when nothing matches", async () => {
    const t = setup();
    await venue(t);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json([])));
    await expect(owner(t).action(api.weather.setLocationFromText, { text: "Nowhereville" })).rejects.toThrow(/Couldn't find/);
    expect((await profile(t))?.venueLat).toBeUndefined();
  });

  it("is for admins only", async () => {
    const t = setup();
    await venue(t);
    await expect(curator(t).action(api.weather.setLocationFromText, { text: "Brooklyn" })).rejects.toThrow(/Only venue admins/);
  });
});

describe("weather.setLocationFromDevice", () => {
  it("rounds the position and names the place", async () => {
    const t = setup();
    await venue(t);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = new URL(String(input));
        if (url.pathname === "/geo/1.0/reverse") {
          // Only the rounded position is ever sent.
          expect(url.searchParams.get("lat")).toBe("40.71");
          return Response.json([{ name: "Lower Manhattan", country: "US", state: "New York" }]);
        }
        return Response.json(weatherJson());
      }),
    );
    expect(await owner(t).action(api.weather.setLocationFromDevice, { lat: 40.712776, lon: -74.005974 })).toEqual({
      label: "Lower Manhattan, New York, US",
    });
    expect(await profile(t)).toMatchObject({ venueLat: 40.71, venueLon: -74.01, venueLocationSource: "device" });
  });

  it("still saves when the place name can't be found", async () => {
    const t = setup();
    await venue(t);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 500 })));
    expect(await owner(t).action(api.weather.setLocationFromDevice, { lat: 40.7, lon: -74 })).toEqual({
      label: "This device's location",
    });
  });

  it("rejects nonsense", async () => {
    const t = setup();
    await venue(t);
    await expect(owner(t).action(api.weather.setLocationFromDevice, { lat: 0, lon: 0 })).rejects.toThrow(/doesn't look right/);
  });
});

describe("weather.clearLocation", () => {
  it("forgets the venue's location", async () => {
    const t = setup();
    await venue(t, { venueLat: 51.51, venueLon: -0.13, venueLocationLabel: "London, GB", venueLocationSource: "address" });
    await owner(t).mutation(api.weather.clearLocation, {});
    const p = await profile(t);
    expect(p?.venueLat).toBeUndefined();
    expect(p?.venueLocationLabel).toBeUndefined();
    expect((await owner(t).query(api.weather.status, {})).location).toBeNull();
  });
});

describe("weather.heartbeat", () => {
  it("records playing, throttled, and fetches straight away after a break", async () => {
    const t = setup();
    await venue(t, { ...following, venueLat: 51.51, venueLon: -0.13 });
    vi.useFakeTimers();
    await owner(t).mutation(api.weather.heartbeat, {});
    await owner(t).mutation(api.weather.heartbeat, {});
    const rows = await t.run(async (ctx) => ctx.db.query("playerHeartbeats").collect());
    expect(rows).toHaveLength(1);
    const scheduled = await t.run(async (ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled.map((s) => s.name)).toEqual(["weather:fetchOne"]);
  });
});

describe("weather.refreshAll", () => {
  it("fetches once per ~1 km square, only for playing venues following the weather", async () => {
    const t = setup();
    const now = Date.now();
    // Two venues in the same square, one elsewhere, one not following, one not playing.
    await venue(t, { ...following, venueLat: 51.51, venueLon: -0.13 }, "user_a");
    await venue(t, { ...following, venueLat: 51.51, venueLon: -0.13 }, "user_b");
    await venue(t, { ...following, venueLat: 53.48, venueLon: -2.25 }, "user_c");
    await venue(t, { venueLat: 48.86, venueLon: 2.35 }, "user_d");
    await venue(t, { ...following, venueLat: 40.71, venueLon: -74.01 }, "user_e");
    // And one whose square was fetched a moment ago.
    await venue(t, { ...following, venueLat: 52.2, venueLon: 0.12 }, "user_f");
    await t.run(async (ctx) => {
      for (const id of ["user_a", "user_b", "user_c", "user_d", "user_f"]) {
        await ctx.db.insert("playerHeartbeats", { clerkUserId: id, at: now - 5 * 60_000 });
      }
      await ctx.db.insert("playerHeartbeats", { clerkUserId: "user_e", at: now - 2 * 60 * 60_000 });
      await ctx.db.insert("weatherReadings", {
        key: "52.20,0.12",
        condition: "Clear",
        description: "clear",
        tempC: 10,
        fetchedAt: now - REUSE_WITHIN_MS / 2,
      });
    });
    const res = await t.mutation(internal.weather.refreshAll, {});
    expect(res).toEqual({ scheduled: 2 });
    const scheduled = await t.run(async (ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled.map((s) => (s.args[0] as { key: string }).key).sort()).toEqual(["51.51,-0.13", "53.48,-2.25"]);
  });

  it("does nothing without an API key", async () => {
    vi.stubEnv("OPENWEATHER_API_KEY", "");
    const t = setup();
    expect(await t.mutation(internal.weather.refreshAll, {})).toEqual({ scheduled: 0 });
  });
});

describe("weather.fetchOne", () => {
  it("counts every call, and keeps the last good reading when a call fails", async () => {
    const t = setup();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(weatherJson("Snow", -1))));
    await t.action(internal.weather.fetchOne, { key: "51.51,-0.13", lat: 51.51, lon: -0.13 });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 401 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await t.action(internal.weather.fetchOne, { key: "51.51,-0.13", lat: 51.51, lon: -0.13 });
    const readings = await t.run(async (ctx) => ctx.db.query("weatherReadings").collect());
    expect(readings).toHaveLength(1);
    expect(readings[0]).toMatchObject({ condition: "Snow", tempC: -1 });
    expect(await t.query(internal.weather.usage, {})).toMatchObject({ calls: 2 });
  });

  it("warns at 80% of the free plan", async () => {
    const t = setup();
    const warnAt = Math.floor(MONTHLY_FREE_CALLS * USAGE_WARNING_SHARE);
    await t.run(async (ctx) => {
      await ctx.db.insert("weatherUsage", { month: monthKey(Date.now()), calls: warnAt - 1 });
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await t.mutation(internal.weather.saveReading, { key: "k" });
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/80%\+ of the free plan/));
  });
});

describe("autolobby.saveSettings with weather", () => {
  it("saves Follow the weather and a rainy-day playlist", async () => {
    const t = setup();
    await venue(t);
    const playlistId = await t.run(async (ctx) =>
      ctx.db.insert("playlists", { name: "Rainy Day", curated: true, isPublic: true }),
    );
    await owner(t).mutation(api.autolobby.saveSettings, {
      ...DEFAULT_SETTINGS,
      enabled: true,
      followWeather: true,
      rainyPlaylistId: playlistId,
    });
    const s = await owner(t).query(api.autolobby.settings, {});
    expect(s).toMatchObject({ followWeather: true, rainyPlaylistName: "Rainy Day" });
  });
});
