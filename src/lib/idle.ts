// Shared across tabs via localStorage so activity in one tab keeps the others alive.
export const LAST_ACTIVITY_KEY = "ll-last-activity";

/**
 * Whether an idle session should be signed out.
 *
 * A venue can leave music playing for hours with nobody touching the screen,
 * so playback always counts as activity — only a silent, untouched app times out.
 */
export function shouldSignOut(
  now: number,
  lastActivity: number,
  timeoutMs: number,
  isPlaying: boolean,
): boolean {
  if (isPlaying) return false;
  return now - lastActivity >= timeoutMs;
}

/** Parses a stored timestamp, treating anything unusable as "no record". */
export function parseLastActivity(raw: string | null): number | null {
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}
