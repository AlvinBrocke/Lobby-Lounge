"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export function useIdleTimeout(timeoutMs = 30 * 60 * 1000) {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await signOut({ redirectUrl: "/signin" });
      }, timeoutMs);
    }

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isSignedIn, timeoutMs, signOut]);
}
