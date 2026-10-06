/**
 * Pure helpers for announcements. An announcement repeats weekly on the
 * chosen days, either once at a set time or every N minutes inside a window.
 * The limits here mirror the server-side validation in convex/announcements.ts.
 */

import { DAYS, todayKey, type Day } from "./schedule";

export const MAX_TITLE = 60;
export const MAX_MESSAGE = 300;
export const MAX_AUDIO_SECONDS = 45;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
export const RECORDING_LIMITS = [15, 30, 45] as const;
export const EVERY_MINUTES = [15, 30, 60] as const;
export const VOLUME_BOOSTS = [0, 2, 4, 6] as const;

export interface AnnouncementTiming {
  status: "scheduled" | "draft";
  days: string[];
  occurrence: "once" | "multiple";
  startMinute: number;
  endMinute?: number;
  everyMinutes?: number;
}

/** "17:30" → 1050. */
export function parseTime(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** 1050 → "17:30" (the format `<input type="time">` uses). */
export function toTimeValue(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

/** Minutes after midnight at which the announcement plays on any of its days. */
export function playMinutes(a: AnnouncementTiming): number[] {
  if (a.occurrence === "once") return [a.startMinute];
  const end = a.endMinute ?? a.startMinute;
  const every = a.everyMinutes ?? 30;
  const out: number[] = [];
  for (let m = a.startMinute; m <= end; m += every) out.push(m);
  return out;
}

/** Days in week order, collapsing the whole week to "Daily". */
export function formatDays(days: string[]): string {
  if (days.length === 7) return "Daily";
  return DAYS.filter((d) => days.includes(d)).join(", ");
}

export function formatTiming(a: AnnouncementTiming): string {
  if (a.status === "draft") return "Not scheduled";
  const days = formatDays(a.days);
  if (a.occurrence === "once") return `${days} ${toTimeValue(a.startMinute)} · Once per day`;
  const every = a.everyMinutes === 60 ? "Every hour" : `Every ${a.everyMinutes} minutes`;
  return `${days} ${toTimeValue(a.startMinute)}–${toTimeValue(a.endMinute ?? a.startMinute)} · ${every}`;
}

/** "Live" means it plays at some point today; other scheduled ones are upcoming. */
export function isLiveToday(a: AnnouncementTiming, now: Date): boolean {
  return a.status === "scheduled" && a.days.includes(todayKey(now));
}

/** The next play time from `now` (inclusive), searching one week ahead. */
export function nextPlay(a: AnnouncementTiming, now: Date): { day: Day; minute: number; today: boolean } | null {
  if (a.status === "draft" || a.days.length === 0) return null;
  const minutes = playMinutes(a);
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  const todayIndex = DAYS.indexOf(todayKey(now));
  for (let offset = 0; offset <= 7; offset++) {
    const day = DAYS[(todayIndex + offset) % 7];
    if (!a.days.includes(day)) continue;
    const minute = minutes.find((m) => offset > 0 || m >= nowMinute);
    if (minute !== undefined) return { day, minute, today: offset === 0 };
  }
  return null;
}

export function formatNextPlay(a: AnnouncementTiming, now: Date): string | null {
  const next = nextPlay(a, now);
  if (!next) return null;
  return next.today ? toTimeValue(next.minute) : `${next.day} ${toTimeValue(next.minute)}`;
}

/**
 * The play slot due right now, if any, as a key unique to that slot on that
 * date — so the player can remember what it already played. A slot stays due
 * for `graceMinutes` so a timer tick that lands a little late still catches it.
 */
export function dueSlot(a: AnnouncementTiming, now: Date, graceMinutes = 2): string | null {
  if (!isLiveToday(a, now)) return null;
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  const minute = playMinutes(a).find((m) => nowMinute >= m && nowMinute < m + graceMinutes);
  if (minute === undefined) return null;
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}@${minute}`;
}

/** Announcement volume (0-1) relative to the music volume (0-100), boosted by `db`. */
export function announcementVolume(musicVolume: number, db: number): number {
  return Math.min(1, (musicVolume / 100) * 10 ** (db / 20));
}

/** The 0-100 sliders mapped onto SpeechSynthesisUtterance's pitch (0-2) and rate (0.1-10) ranges. */
export function speechPitch(pitch: number): number {
  return 0.5 + (pitch / 100) * 1.5;
}

export function speechRate(speed: number): number {
  return 0.6 + (speed / 100) * 0.9;
}
