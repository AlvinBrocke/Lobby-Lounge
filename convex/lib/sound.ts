import { v } from "convex/values";

/** How the player behaves for a venue (Settings → Preferences → Sound). */
export const soundSettings = v.object({
  defaultVolume: v.number(), // 0-100, the player's volume when the app opens
  fadeSeconds: v.number(), // fade out/in at track boundaries; 0 = off
  followSchedule: v.boolean(), // switch playlists automatically when a schedule block starts
});

export const FADE_OPTIONS = [0, 3, 6, 10];

export const DEFAULT_SOUND = { defaultVolume: 50, fadeSeconds: 0, followSchedule: true };
