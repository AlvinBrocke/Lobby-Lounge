"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import usePlayerStore from "@/store/usePlayerStore";
import { LAST_ACTIVITY_KEY, parseLastActivity, shouldSignOut } from "@/lib/idle";

const CHECK_INTERVAL_MS = 30 * 1000;
// Input events fire dozens of times a second; writing localStorage that often is wasteful.
const WRITE_THROTTLE_MS = 5 * 1000;

/**
 * Signs the user out after a period of inactivity across *all* tabs, where
 * music playing counts as activity.
 *
 * The last-activity time lives in localStorage, which every tab on this origin
 * shares, so an active tab keeps idle background tabs signed in. A tab that is
 * playing music refreshes it on every check, so an unattended lobby player
 * never times out.
 *
 * This is a UX courtesy, not a security boundary: it only runs while the tab is
 * open. The real enforcement is Clerk's server-side session inactivity timeout
 * and maximum lifetime (Dashboard → Configure → Sessions), which expire the
 * session regardless of what the browser does.
 */
export function useIdleTimeout(timeoutMs = 30 * 60 * 1000) {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  // Fallback when localStorage is unavailable (private mode, blocked storage):
  // we lose cross-tab sharing but still time out correctly within this tab.
  const memoryRef = useRef(0);

  useEffect(() => {
    if (!isSignedIn) return;

    let lastWrite = 0;

    function readLastActivity() {
      try {
        const stored = parseLastActivity(localStorage.getItem(LAST_ACTIVITY_KEY));
        if (stored !== null) return Math.max(stored, memoryRef.current);
      } catch {
        // storage blocked — fall back to this tab's own record
      }
      return memoryRef.current;
    }

    function markActive(now = Date.now()) {
      memoryRef.current = now;
      lastWrite = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      } catch {
        // storage blocked — memoryRef still covers this tab
      }
    }

    function onInput() {
      const now = Date.now();
      if (now - lastWrite >= WRITE_THROTTLE_MS) markActive(now);
    }

    function check() {
      const now = Date.now();
      // Read at check time rather than subscribing: we only need the current
      // value every 30s, not a re-render on every play/pause.
      const { isPlaying } = usePlayerStore.getState();
      if (isPlaying) {
        markActive(now); // heartbeat keeps other tabs alive too
        return;
      }
      if (shouldSignOut(now, readLastActivity(), timeoutMs, isPlaying)) {
        // Clerk broadcasts the sign-out to the app's other open tabs.
        void signOut({ redirectUrl: "/signin" });
      }
    }

    // Loading the app is itself activity (and resets a stale value from a past visit).
    markActive();

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true }));
    // Background tabs throttle timers, so also check the moment a tab is refocused.
    document.addEventListener("visibilitychange", check);
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      events.forEach((e) => window.removeEventListener(e, onInput));
    };
  }, [isSignedIn, timeoutMs, signOut]);
}
