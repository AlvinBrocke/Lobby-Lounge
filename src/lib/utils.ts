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
