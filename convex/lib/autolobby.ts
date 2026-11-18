/**
 * AutoLobby: the music follows a venue's peak and slow hours, read from its
 * connected POS orders (convex/square.ts). Pure rules only, no Convex
 * imports, shared by the server (convex/autolobby.ts) and the player
 * (src/hooks/useAutoLobby.ts) so both always agree.
 */
import { v, type Infer } from "convex/values";
import type { Energy } from "./energy";

export const LEVELS = ["quiet", "steady", "busy", "peak"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  quiet: "Quiet",
  steady: "Steady",
  busy: "Busy",
  peak: "Peak",
};

export const STRENGTHS = ["gentle", "balanced", "strong"] as const;
export type Strength = (typeof STRENGTHS)[number];

export const STRENGTH_LABELS: Record<Strength, string> = {
  gentle: "Gentle",
  balanced: "Balanced",
  strong: "Strong",
};

/** Saved on `userProfiles.autoLobby` (Settings → Integrations → AutoLobby). */
export const autoLobbySettings = v.object({
  enabled: v.boolean(),
  strength: v.union(v.literal("gentle"), v.literal("balanced"), v.literal("strong")),
  /** Takes over during Peak, when set. The schedule resumes afterwards. */
  peakPlaylistId: v.optional(v.id("playlists")),
  /**
   * Orders in 15 minutes that count as "busy" until the venue has two weeks of
   * its own history to compare with.
   */
  busyOrders: v.number(),
});
export type AutoLobbySettings = Infer<typeof autoLobbySettings>;

export const DEFAULT_SETTINGS: AutoLobbySettings = { enabled: false, strength: "balanced", busyOrders: 10 };
export const MAX_BUSY_ORDERS = 500;

/** The busyness window: orders over the last 15 minutes. */
export const WINDOW_MS = 15 * 60 * 1000;
/** Each past week contributes the hour around "now" (±30 min) to the venue's normal. */
export const BASELINE_HALF_SPAN_MS = 30 * 60 * 1000;
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** How many past weeks make up "normal", and how many are needed before it's trusted. */
export const BASELINE_WEEKS = 4;
export const MIN_BASELINE_WEEKS = 2;
/** A level must hold this long before the music changes. */
export const HOLD_MS = 10 * 60 * 1000;
/** Staff picking music by hand pauses AutoLobby for this long. */
export const MANUAL_PAUSE_MS = 30 * 60 * 1000;

/**
 * Busy/peak/quiet as multiples of the venue's normal order rate. Stronger
 * reacts to smaller swings and looks further ahead in the queue for a track
 * of the right energy.
 */
export const STRENGTH_RULES: Record<Strength, { quiet: number; busy: number; peak: number; lookahead: number }> = {
  gentle: { quiet: 0.35, busy: 1.6, peak: 2.5, lookahead: 4 },
  balanced: { quiet: 0.5, busy: 1.3, peak: 2, lookahead: 8 },
  strong: { quiet: 0.65, busy: 1.15, peak: 1.6, lookahead: 16 },
};

/** What the meter query returns. `baseline` is the venue's normal orders per 15 minutes at this time of week. */
export interface MeterReading {
  recent: number;
  baseline: number | null;
  weeks: number;
}

/**
 * Fewer than this many orders per 15 minutes never counts as a "normal"
 * rate, so a venue that is usually empty at 3 pm doesn't hit Peak on two orders.
 */
const MIN_REFERENCE = 2;

/** The venue's normal orders per 15 minutes: its own history once there's enough, otherwise the owner's busy count. */
export function referenceRate(reading: MeterReading, settings: AutoLobbySettings): number {
  const rules = STRENGTH_RULES[settings.strength];
  const ref =
    reading.baseline !== null && reading.weeks >= MIN_BASELINE_WEEKS
      ? reading.baseline
      : settings.busyOrders / rules.busy;
  return Math.max(ref, MIN_REFERENCE);
}

export function levelFor(reading: MeterReading, settings: AutoLobbySettings): Level {
  const rules = STRENGTH_RULES[settings.strength];
  const ratio = reading.recent / referenceRate(reading, settings);
  if (ratio >= rules.peak) return "peak";
  if (ratio >= rules.busy) return "busy";
  if (ratio < rules.quiet) return "quiet";
  return "steady";
}

/**
 * The past windows that make up a venue's normal at `now`: the same time of
 * week in each of the last BASELINE_WEEKS weeks, from when it connected.
 * Same time last week needs no time-zone maths.
 */
export function baselineWindows(now: number, connectedAt: number): { from: number; to: number }[] {
  const windows: { from: number; to: number }[] = [];
  for (let k = 1; k <= BASELINE_WEEKS; k++) {
    const centre = now - k * WEEK_MS;
    if (centre - BASELINE_HALF_SPAN_MS < connectedAt) break;
    windows.push({ from: centre - BASELINE_HALF_SPAN_MS, to: centre + BASELINE_HALF_SPAN_MS });
  }
  return windows;
}

/** Orders counted in each baseline window → the normal per 15 minutes. */
export function baselineRate(counts: number[]): number | null {
  if (counts.length === 0) return null;
  const perWindow = counts.reduce((a, b) => a + b, 0) / counts.length;
  return perWindow * (WINDOW_MS / (2 * BASELINE_HALF_SPAN_MS));
}

/* ── Smoothing ────────────────────────────────────────────────────────────── */

export interface HoldState {
  /** The level the music follows. */
  effective: Level;
  /** What the meter says now, and since when. */
  candidate: Level;
  since: number;
}

/** A new reading only takes effect once it has held for HOLD_MS, so one big table doesn't flip the room. */
export function stepHold(state: HoldState | null, observed: Level, now: number): HoldState {
  if (!state) return { effective: observed, candidate: observed, since: now };
  if (observed === state.effective) return { effective: state.effective, candidate: observed, since: now };
  if (observed !== state.candidate) return { effective: state.effective, candidate: observed, since: now };
  if (now - state.since >= HOLD_MS) return { effective: observed, candidate: observed, since: now };
  return state;
}

/* ── Picking the next track ───────────────────────────────────────────────── */

/** Energies to look for, best first. Steady leaves the queue alone. */
export const ENERGY_PREFERENCE: Record<Level, Energy[] | null> = {
  quiet: ["low", "mid"],
  steady: null,
  busy: ["high", "mid"],
  peak: ["high"],
};

/**
 * Index of the queued track to play next: the first one, within
 * `lookahead`, with the most preferred energy; otherwise the head of the queue.
 */
export function pickNextIndex(queue: { energy?: string }[], level: Level, lookahead: number): number {
  const prefs = ENERGY_PREFERENCE[level];
  if (!prefs) return 0;
  const window = queue.slice(0, lookahead);
  for (const energy of prefs) {
    const i = window.findIndex((t) => t.energy === energy);
    if (i >= 0) return i;
  }
  return 0;
}

/** Activity-log line for a level change. */
export function changeSummary(level: Level, playlistName?: string): string {
  const base = `AutoLobby: ${LEVEL_LABELS[level]}`;
  return playlistName ? `${base}, switched to "${playlistName}"` : base;
}
