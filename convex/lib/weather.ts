/**
 * Weather for AutoLobby: pure rules and the OpenWeather client, no Convex
 * imports. Server side in convex/weather.ts; the player combines the mood
 * with busyness in src/hooks/useAutoLobby.ts. Setup in CLAUDE.md →
 * "Weather (OpenWeather)".
 */
import type { Level } from "./autolobby";

export const OPENWEATHER_API = "https://api.openweathermap.org";

/** How often a playing venue's weather is refreshed. */
export const FETCH_EVERY_MS = 30 * 60 * 1000;
/** A reading fresher than this is reused instead of calling again. */
export const REUSE_WITHIN_MS = 25 * 60 * 1000;
/** Older than this, a reading is ignored: the music never follows stale weather. */
export const STALE_AFTER_MS = 2 * 60 * 60 * 1000;
/** Only venues whose player reported playing within this long get fetched. */
export const PLAYING_WITHIN_MS = 60 * 60 * 1000;
/** How often the player reports that it's playing. */
export const HEARTBEAT_EVERY_MS = 10 * 60 * 1000;
/** OpenWeather's free plan: 60 calls a minute, 1,000,000 a month. */
export const MIN_CALL_SPACING_MS = 1100;
export const MONTHLY_FREE_CALLS = 1_000_000;
export const USAGE_WARNING_SHARE = 0.8;

/* ── Location ─────────────────────────────────────────────────────────────── */

/** 2 decimal places, about 1 km: enough for local weather, not enough to pinpoint a building. */
export function roundCoord(x: number): number {
  return Math.round(x * 100) / 100;
}

export function validCoords(lat: unknown, lon: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0)
  );
}

/** Venues within the same ~1 km square share one weather reading (and one API call). */
export function locationKey(lat: number, lon: number): string {
  return `${roundCoord(lat).toFixed(2)},${roundCoord(lon).toFixed(2)}`;
}

/** A postcode or ZIP has a digit in it; a town name doesn't. Picks OpenWeather's zip or direct lookup. */
export function looksLikePostcode(text: string): boolean {
  return /\d/.test(text);
}

/* ── Mood ─────────────────────────────────────────────────────────────────── */

export type Mood = "bright" | "mild" | "cosy";

export const MOOD_LABELS: Record<Mood, string> = { bright: "Bright", mild: "Mild", cosy: "Cosy" };

/** Warm enough for "bright", cold enough for "cosy", in °C. */
export const BRIGHT_MIN_C = 18;
export const COSY_BELOW_C = 8;

const WET = new Set(["Rain", "Drizzle", "Thunderstorm", "Snow"]);

/** OpenWeather's `weather[0].main` and the temperature → the room's weather mood. */
export function moodFor(condition: string, tempC: number): Mood {
  if (WET.has(condition) || tempC < COSY_BELOW_C) return "cosy";
  if (condition === "Clear" && tempC >= BRIGHT_MIN_C) return "bright";
  return "mild";
}

/** What the music should do, from the room's busyness (if a POS is connected) and the weather (if followed). */
export interface Target {
  /** Which energy the next track leans towards (see `pickNextIndex`). */
  lean: Level;
  /** A playlist that should take over: the peak playlist, or the rainy-day one. */
  special: "peak" | "rainy" | null;
}

/**
 * The room comes first: Busy and Peak ignore the weather. When the room is
 * Steady (or there's no POS), Bright leans upbeat and Cosy leans calm. A
 * Quiet room stays calm, unless it's Bright, which only stops it getting sleepy.
 * The rainy-day playlist plays in Cosy weather whenever the room isn't busy.
 */
export function combine(room: Level | null, mood: Mood | null): Target | null {
  if (room === null && mood === null) return null;
  if (room === "peak") return { lean: "peak", special: "peak" };
  if (room === "busy") return { lean: "busy", special: null };
  const special = mood === "cosy" ? "rainy" : null;
  if (room === "quiet") return { lean: mood === "bright" ? "steady" : "quiet", special };
  // Steady room, or no POS at all.
  if (mood === "bright") return { lean: "busy", special: null };
  if (mood === "cosy") return { lean: "quiet", special };
  return { lean: "steady", special: null };
}

/** One string per target, for smoothing (`stepHold`) and comparing. */
export function targetKey(t: Target): string {
  return `${t.lean}:${t.special ?? "-"}`;
}

export function parseTargetKey(key: string): Target {
  const [lean, special] = key.split(":");
  return { lean: lean as Level, special: special === "-" ? null : (special as Target["special"]) };
}

/* ── OpenWeather ──────────────────────────────────────────────────────────── */

/** The fields of `GET /data/2.5/weather` the app uses. */
export interface OpenWeatherCurrent {
  weather?: { main?: string; description?: string }[];
  main?: { temp?: number };
  sys?: { sunrise?: number; sunset?: number };
}

export interface WeatherReading {
  condition: string; // e.g. "Rain"
  description: string; // e.g. "light rain"
  tempC: number;
  sunrise?: number; // epoch ms
  sunset?: number;
}

export function parseCurrent(json: OpenWeatherCurrent): WeatherReading | null {
  const w = json.weather?.[0];
  const temp = json.main?.temp;
  if (!w?.main || typeof temp !== "number" || !Number.isFinite(temp)) return null;
  return {
    condition: w.main,
    description: w.description ?? w.main.toLowerCase(),
    tempC: Math.round(temp * 10) / 10,
    ...(json.sys?.sunrise && { sunrise: json.sys.sunrise * 1000 }),
    ...(json.sys?.sunset && { sunset: json.sys.sunset * 1000 }),
  };
}

/** Short label for the player bar and activity log, e.g. "Rain, 8°C". */
export function weatherLabel(r: { condition: string; tempC: number }): string {
  return `${r.condition}, ${Math.round(r.tempC)}°C`;
}

/** When call `i` of `n` in one refresh round should go out: spread over the round, never faster than the rate limit. */
export function callDelay(i: number, n: number): number {
  const spread = Math.floor(REUSE_WITHIN_MS / Math.max(n, 1));
  return i * Math.max(MIN_CALL_SPACING_MS, spread);
}

/** "2026-11" — the bucket for the monthly usage counter. */
export function monthKey(now: number): string {
  return new Date(now).toISOString().slice(0, 7);
}
