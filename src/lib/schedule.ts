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

/** Hours given to a playlist dropped onto the grid from the tray. */
export const DROP_DURATION = 2;

/** What's being dragged on the schedule grid. */
export type DragPayload =
  | { kind: "block"; id: string; duration: number }
  | { kind: "playlist"; playlistId: string };

/** Whether `slot` can go on the grid without overlapping or running past midnight. */
export function fitsAt(blocks: (BlockSlot & { _id?: string })[], slot: BlockSlot, ignoreId?: string): boolean {
  if (slot.startHour + slot.duration > 24) return false;
  return !blocks.some((b) => b._id !== ignoreId && overlaps(b, slot));
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
