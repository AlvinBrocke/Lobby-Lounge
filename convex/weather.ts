import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { logActivity } from "./lib/activity";
import { requireUser, requireVenueAdmin } from "./lib/auth";
import {
  HEARTBEAT_EVERY_MS,
  MONTHLY_FREE_CALLS,
  OPENWEATHER_API,
  PLAYING_WITHIN_MS,
  REUSE_WITHIN_MS,
  USAGE_WARNING_SHARE,
  callDelay,
  locationKey,
  looksLikePostcode,
  monthKey,
  parseCurrent,
  roundCoord,
  validCoords,
  type OpenWeatherCurrent,
} from "./lib/weather";

/*
 * Local weather for AutoLobby (OpenWeather, free plan). The venue's position
 * comes from Settings → Venue details → Location (a town or postcode, or the
 * device's location), or else from its Square location. A cron fetches the
 * weather every 30 minutes, only for venues that are playing with "Follow
 * the weather" on; venues in the same ~1 km square share one reading. The
 * player turns the reading into a mood (convex/lib/weather.ts).
 *
 * Env: OPENWEATHER_API_KEY. Only rounded coordinates (~1 km) are ever sent
 * to OpenWeather or stored.
 */

const ADMIN_ONLY = "Only venue admins can change the venue's location.";

function apiKey(): string | null {
  return process.env.OPENWEATHER_API_KEY || null;
}

async function profileOf(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

type LocationSource = "address" | "device" | "square";

/** Where the venue's weather comes from: its own saved location first, then its Square location. */
async function effectiveLocation(ctx: QueryCtx, clerkUserId: string) {
  const profile = await profileOf(ctx, clerkUserId);
  if (profile && validCoords(profile.venueLat, profile.venueLon)) {
    return {
      lat: profile.venueLat,
      lon: profile.venueLon!,
      source: (profile.venueLocationSource ?? "address") as LocationSource,
      label: profile.venueLocationLabel ?? null,
    };
  }
  const conn = await ctx.db
    .query("squareConnections")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
  if (conn && conn.status === "connected" && validCoords(conn.latitude, conn.longitude)) {
    return { lat: conn.latitude, lon: conn.longitude!, source: "square" as LocationSource, label: conn.locationName ?? null };
  }
  return null;
}

async function readingFor(ctx: QueryCtx, key: string) {
  return await ctx.db
    .query("weatherReadings")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
}

/* ── Public ───────────────────────────────────────────────────────────────── */

/**
 * The venue's weather location (never the coordinates themselves) and the
 * latest reading for it. The player decides whether the reading is fresh
 * enough to follow (STALE_AFTER_MS), since a query can't watch the clock.
 */
export const status = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const loc = await effectiveLocation(ctx, clerkUserId);
    const reading = loc ? await readingFor(ctx, locationKey(loc.lat, loc.lon)) : null;
    return {
      configured: apiKey() !== null,
      location: loc ? { source: loc.source, label: loc.label } : null,
      reading: reading
        ? {
            condition: reading.condition,
            description: reading.description,
            tempC: reading.tempC,
            sunrise: reading.sunrise ?? null,
            sunset: reading.sunset ?? null,
            fetchedAt: reading.fetchedAt,
          }
        : null,
    };
  },
});

interface GeoResult {
  name?: string;
  lat?: number;
  lon?: number;
  country?: string;
  state?: string;
}

async function geocode(text: string, country: string | undefined, key: string): Promise<GeoResult | null> {
  const get = async (path: string, params: Record<string, string>) => {
    const url = new URL(path, OPENWEATHER_API);
    for (const [k, val] of Object.entries(params)) url.searchParams.set(k, val);
    url.searchParams.set("appid", key);
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new ConvexError("The location lookup isn't working right now. Try again in a minute.");
    return (await res.json()) as GeoResult | GeoResult[];
  };
  const withCountry = (q: string) => (country ? `${q},${country}` : q);

  if (looksLikePostcode(text)) {
    // OpenWeather knows US ZIPs and most countries' postcodes; for UK-style
    // postcodes it only knows the first half ("SW1A 1AA" → "SW1A").
    const candidates = [text, text.split(/\s+/)[0]].filter((c, i, all) => c && all.indexOf(c) === i);
    for (const c of candidates) {
      const hit = (await get("/geo/1.0/zip", { zip: withCountry(c) })) as GeoResult | null;
      if (hit && validCoords(hit.lat, hit.lon)) return hit;
    }
  }
  const list = (await get("/geo/1.0/direct", { q: withCountry(text), limit: "1" })) as GeoResult[] | null;
  const hit = list?.[0];
  return hit && validCoords(hit.lat, hit.lon) ? hit : null;
}

function placeLabel(g: GeoResult, fallback: string): string {
  return [g.name, g.state, g.country].filter(Boolean).join(", ").slice(0, 80) || fallback;
}

/** Settings → Venue details → Location: a town, city or postcode, looked up with OpenWeather. */
export const setLocationFromText = action({
  args: { text: v.string() },
  handler: async (ctx, { text }): Promise<{ label: string }> => {
    await requireVenueAdmin(ctx, ADMIN_ONLY);
    const key = apiKey();
    if (!key) throw new ConvexError("Weather isn't set up on this deployment yet.");
    const query = text.trim().slice(0, 80);
    if (query.length < 2) throw new ConvexError("Enter a town, city or postcode.");
    const country = await ctx.runQuery(internal.weather.venueCountry, {});
    const hit = await geocode(query, country ?? undefined, key);
    if (!hit) throw new ConvexError(`Couldn't find "${query}". Try the town or city name.`);
    const label = placeLabel(hit, query);
    await ctx.runMutation(internal.weather.saveLocation, { lat: hit.lat!, lon: hit.lon!, label, source: "address" });
    return { label };
  },
});

/** Settings → Venue details → "Use this device's location". Rounded before it's stored or sent anywhere. */
export const setLocationFromDevice = action({
  args: { lat: v.number(), lon: v.number() },
  handler: async (ctx, args): Promise<{ label: string }> => {
    await requireVenueAdmin(ctx, ADMIN_ONLY);
    if (!validCoords(args.lat, args.lon)) throw new ConvexError("That location doesn't look right. Try entering a town instead.");
    const lat = roundCoord(args.lat);
    const lon = roundCoord(args.lon);
    let label = "This device's location";
    const key = apiKey();
    if (key) {
      try {
        const url = new URL("/geo/1.0/reverse", OPENWEATHER_API);
        url.searchParams.set("lat", String(lat));
        url.searchParams.set("lon", String(lon));
        url.searchParams.set("limit", "1");
        url.searchParams.set("appid", key);
        const res = await fetch(url);
        const hit = res.ok ? ((await res.json()) as GeoResult[])[0] : undefined;
        if (hit) label = placeLabel(hit, label);
      } catch {
        // The name is only for display; the coordinates are what matter.
      }
    }
    await ctx.runMutation(internal.weather.saveLocation, { lat, lon, label, source: "device" });
    return { label };
  },
});

/** Forget the venue's own location. Weather then falls back to the Square location, if there is one. */
export const clearLocation = mutation({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireVenueAdmin(ctx, ADMIN_ONLY);
    const profile = await profileOf(ctx, clerkUserId);
    if (!profile || profile.venueLat === undefined) return;
    await ctx.db.patch(profile._id, {
      venueLat: undefined,
      venueLon: undefined,
      venueLocationLabel: undefined,
      venueLocationSource: undefined,
    });
    await logActivity(ctx, clerkUserId, "Removed the venue's weather location");
  },
});

/**
 * The player reports that it's playing, at most every 10 minutes, while
 * AutoLobby follows the weather. Venues that stop reporting stop costing API
 * calls within the hour. When a venue starts playing again after a break and
 * its reading is old, the weather is fetched straight away.
 */
export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const now = Date.now();
    const row = await ctx.db
      .query("playerHeartbeats")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
    if (row && now - row.at < HEARTBEAT_EVERY_MS - 60_000) return;
    const wasIdle = !row || now - row.at >= PLAYING_WITHIN_MS;
    if (row) await ctx.db.patch(row._id, { at: now });
    else await ctx.db.insert("playerHeartbeats", { clerkUserId, at: now });

    if (!wasIdle || !apiKey()) return;
    const loc = await effectiveLocation(ctx, clerkUserId);
    if (!loc) return;
    const key = locationKey(loc.lat, loc.lon);
    const reading = await readingFor(ctx, key);
    if (!reading || now - reading.fetchedAt >= REUSE_WITHIN_MS) {
      await ctx.scheduler.runAfter(0, internal.weather.fetchOne, { key, lat: roundCoord(loc.lat), lon: roundCoord(loc.lon) });
    }
  },
});

/* ── Internal ─────────────────────────────────────────────────────────────── */

export const venueCountry = internalQuery({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const clerkUserId = await requireUser(ctx);
    return (await profileOf(ctx, clerkUserId))?.country ?? null;
  },
});

/** Called from the two `setLocation…` actions, so the caller's identity is there for the activity log. */
export const saveLocation = internalMutation({
  args: {
    lat: v.number(),
    lon: v.number(),
    label: v.string(),
    source: v.union(v.literal("address"), v.literal("device")),
  },
  handler: async (ctx, { lat, lon, label, source }) => {
    const clerkUserId = await requireUser(ctx);
    const profile = await profileOf(ctx, clerkUserId);
    if (!profile) throw new ConvexError("Finish onboarding first.");
    const rLat = roundCoord(lat);
    const rLon = roundCoord(lon);
    await ctx.db.patch(profile._id, {
      venueLat: rLat,
      venueLon: rLon,
      venueLocationLabel: label,
      venueLocationSource: source,
    });
    await logActivity(ctx, clerkUserId, `Set the venue's weather location to ${label}`);
    const key = locationKey(rLat, rLon);
    const reading = await readingFor(ctx, key);
    if (apiKey() && (!reading || Date.now() - reading.fetchedAt >= REUSE_WITHIN_MS)) {
      await ctx.scheduler.runAfter(0, internal.weather.fetchOne, { key, lat: rLat, lon: rLon });
    }
  },
});

/**
 * Every 30 minutes: one fetch per ~1 km square that has a venue playing with
 * "Follow the weather" on, skipping squares fetched in the last 25 minutes.
 * The calls are spread over the round so they never hit the rate limit.
 */
export const refreshAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (!apiKey()) return { scheduled: 0 };
    const now = Date.now();
    const playing = await ctx.db
      .query("playerHeartbeats")
      .withIndex("by_at", (q) => q.gte("at", now - PLAYING_WITHIN_MS))
      .collect();

    const due = new Map<string, { lat: number; lon: number }>();
    for (const hb of playing) {
      const profile = await profileOf(ctx, hb.clerkUserId);
      const s = profile?.autoLobby;
      if (!s?.enabled || !s.followWeather) continue;
      const loc = await effectiveLocation(ctx, hb.clerkUserId);
      if (!loc) continue;
      const key = locationKey(loc.lat, loc.lon);
      if (due.has(key)) continue;
      const reading = await readingFor(ctx, key);
      if (reading && now - reading.fetchedAt < REUSE_WITHIN_MS) continue;
      due.set(key, { lat: roundCoord(loc.lat), lon: roundCoord(loc.lon) });
    }

    let i = 0;
    for (const [key, { lat, lon }] of due) {
      await ctx.scheduler.runAfter(callDelay(i++, due.size), internal.weather.fetchOne, { key, lat, lon });
    }

    // Tidy up: readings nobody has needed for a day.
    const old = await ctx.db
      .query("weatherReadings")
      .filter((q) => q.lt(q.field("fetchedAt"), now - 24 * 60 * 60 * 1000))
      .take(100);
    for (const r of old) await ctx.db.delete(r._id);

    return { scheduled: due.size };
  },
});

/** One OpenWeather call for one ~1 km square. */
export const fetchOne = internalAction({
  args: { key: v.string(), lat: v.number(), lon: v.number() },
  handler: async (ctx, { key, lat, lon }) => {
    const appid = apiKey();
    if (!appid) return;
    const url = new URL("/data/2.5/weather", OPENWEATHER_API);
    url.searchParams.set("lat", String(roundCoord(lat)));
    url.searchParams.set("lon", String(roundCoord(lon)));
    url.searchParams.set("units", "metric");
    url.searchParams.set("appid", appid);
    let reading = null;
    try {
      const res = await fetch(url);
      if (res.ok) reading = parseCurrent((await res.json()) as OpenWeatherCurrent);
      else console.error(`OpenWeather: ${res.status} for ${key}`);
    } catch (err) {
      console.error(`OpenWeather: request failed for ${key}`, err);
    }
    await ctx.runMutation(internal.weather.saveReading, { key, reading: reading ?? undefined });
  },
});

export const saveReading = internalMutation({
  args: {
    key: v.string(),
    reading: v.optional(
      v.object({
        condition: v.string(),
        description: v.string(),
        tempC: v.number(),
        sunrise: v.optional(v.number()),
        sunset: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, { key, reading }) => {
    const now = Date.now();
    // Every call counts towards the month, answered or not.
    const month = monthKey(now);
    const usage = await ctx.db
      .query("weatherUsage")
      .withIndex("by_month", (q) => q.eq("month", month))
      .unique();
    const calls = (usage?.calls ?? 0) + 1;
    if (usage) await ctx.db.patch(usage._id, { calls });
    else await ctx.db.insert("weatherUsage", { month, calls });
    const warnAt = Math.floor(MONTHLY_FREE_CALLS * USAGE_WARNING_SHARE);
    if (calls === warnAt || (calls > warnAt && calls % 10_000 === 0)) {
      console.warn(
        `OpenWeather: ${calls.toLocaleString("en")} calls in ${month}, ` +
          `${Math.round(USAGE_WARNING_SHARE * 100)}%+ of the free plan's ${MONTHLY_FREE_CALLS.toLocaleString("en")}.`,
      );
    }

    if (!reading) return;
    const existing = await readingFor(ctx, key);
    const row = { key, ...reading, fetchedAt: now };
    if (existing) await ctx.db.replace(existing._id, row);
    else await ctx.db.insert("weatherReadings", row);
  },
});

/** For support: how many OpenWeather calls this month so far (`npx convex run weather:usage`). */
export const usage = internalQuery({
  args: {},
  handler: async (ctx) => {
    const month = monthKey(Date.now());
    const row = await ctx.db
      .query("weatherUsage")
      .withIndex("by_month", (q) => q.eq("month", month))
      .unique();
    return { month, calls: row?.calls ?? 0, freeLimit: MONTHLY_FREE_CALLS };
  },
});
