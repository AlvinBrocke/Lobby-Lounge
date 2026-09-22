import type { Channel } from "@/types";

/**
 * Pure helpers for the weekly schedule. A schedule block is a recurring
 * weekly slot: a day, a start hour and a length in whole hours. The rules
 * here mirror the server-side validation in convex/scheduleBlocks.ts.
 */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

export const MAX_TITLE = 60;

export interface BlockSlot {
  day: string;
  startHour: number;
  duration: number;
}

/** `Date.getDay()` counts from Sunday = 0; our week starts on Monday. */
export function todayKey(now: Date): Day {
  return DAYS[(now.getDay() + 6) % 7];
}

/** 0 → "12 am", 13 → "1 pm", 24 → "12 am" (end of day). */
export function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12 am";
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

export function formatRange(startHour: number, duration: number): string {
  return `${formatHour(startHour)} – ${formatHour(startHour + duration)}`;
}

/** Same rule as the server: same day and the half-open hour ranges intersect. */
export function overlaps(a: BlockSlot, b: BlockSlot): boolean {
  return (
    a.day === b.day &&
    a.startHour < b.startHour + b.duration &&
    b.startHour < a.startHour + a.duration
  );
}

/** The block playing right now, or null if nothing is scheduled. */
export function activeBlock<T extends BlockSlot>(blocks: T[], now: Date): T | null {
  const day = todayKey(now);
  const h = now.getHours();
  return blocks.find((b) => b.day === day && h >= b.startHour && h < b.startHour + b.duration) ?? null;
}

export type BlockStatus = "done" | "now" | "upcoming";

/** Where a block sits relative to `now` within the current Mon–Sun week. */
export function blockStatus(block: BlockSlot, now: Date): BlockStatus {
  const dayDiff = DAYS.indexOf(block.day as Day) - DAYS.indexOf(todayKey(now));
  if (dayDiff !== 0) return dayDiff < 0 ? "done" : "upcoming";
  const h = now.getHours();
  if (h < block.startHour) return "upcoming";
  return h < block.startHour + block.duration ? "now" : "done";
}

export const DEFAULT_CHANNEL_COVER =
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop";

/** The shape the player store expects for a channel. */
export function channelToPlayerTrack(channel: {
  _id: string;
  name: string;
  coverImage?: string;
  audioUrl?: string;
  category?: string;
}): Channel {
  return {
    id: channel._id,
    name: channel.name,
    image: channel.coverImage ?? DEFAULT_CHANNEL_COVER,
    audioUrl: channel.audioUrl,
    category: channel.category,
  };
}
