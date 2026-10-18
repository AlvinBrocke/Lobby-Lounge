import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Seconds → "m:ss" for a single track, e.g. 262 → "4:22". */
export function formatDuration(seconds: number | undefined | null): string {
  if (!seconds) return "—:——";
  const whole = Math.round(seconds);
  const m = Math.floor(whole / 60);
  const s = String(whole % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** Seconds → "1h 12m" / "58m" for a playlist's total length. */
export function formatTotalDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/**
 * Volume multiplier (0-1) for fading over the first and last `fadeSeconds`
 * of a track. 1 when fading is off or the length isn't known yet.
 */
export function fadeGain(currentTime: number, duration: number, fadeSeconds: number): number {
  if (fadeSeconds <= 0 || !duration) return 1;
  const edge = Math.min(currentTime, duration - currentTime);
  return Math.min(1, Math.max(0, edge / fadeSeconds));
}
