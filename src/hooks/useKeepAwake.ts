"use client";

import { useEffect } from "react";
import type { Track } from "@/types";

/**
 * Keeps the screen on while music plays. A sleeping tablet suspends the tab,
 * and a suspended tab stops the schedule and announcements.
 *
 * The browser drops the lock whenever the tab is hidden, so it's re-requested
 * when the tab becomes visible again. Unsupported browsers (or plain-http
 * pages — the API needs HTTPS) just skip it.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      if (document.visibilityState !== "visible" || (lock && !lock.released)) return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) next.release();
        else lock = next;
      } catch {
        // Refused (battery saver, permissions policy) — nothing else to try.
      }
    }

    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      lock?.release();
    };
  }, [active]);
}

/** Lock-screen / notification-shade metadata and controls for the current track. */
export function useMediaSession(
  track: Track | null,
  playing: boolean,
  actions: { play: () => void; pause: () => void; next: () => void },
) {
  const { play, pause, next } = actions;

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = track
      ? new MediaMetadata({
          title: track.name,
          artist: track.artist ?? "Lobby & Lounge",
          album: track.category ?? "Lobby & Lounge",
          artwork: track.image ? [{ src: track.image }] : [],
        })
      : null;
  }, [track]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = track ? (playing ? "playing" : "paused") : "none";
  }, [track, playing]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", play);
    ms.setActionHandler("pause", pause);
    ms.setActionHandler("nexttrack", next);
    return () => {
      ms.setActionHandler("play", null);
      ms.setActionHandler("pause", null);
      ms.setActionHandler("nexttrack", null);
    };
  }, [play, pause, next]);
}
