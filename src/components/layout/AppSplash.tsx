"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Full-screen brand splash shown on a fresh load of the signed-in app. Fades
 * out once `ready`, then unmounts. MainShell persists across navigations, so
 * it never reappears on page changes.
 */
export function AppSplash({ ready }: { ready: boolean }) {
  const [gone, setGone] = useState(false);

  // Fallback for when transitionend doesn't fire (e.g. reduced motion, hidden tab).
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(id);
  }, [ready]);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onTransitionEnd={(e) => ready && e.target === e.currentTarget && setGone(true)}
      className={cn(
        "ll-splash fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-background",
        "transition-[opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
        ready && "opacity-0 scale-[1.02] pointer-events-none",
      )}
    >
      <div
        aria-hidden
        className="absolute h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
      />
      <span className="relative dark:hidden">
        <Image src="/images/ll-logo-color.png" alt="" width={140} height={59} priority className="object-contain" />
      </span>
      <span className="relative hidden dark:block">
        <Image src="/images/ll-logo-white.png" alt="" width={140} height={59} priority className="object-contain" />
      </span>
      <span aria-hidden className="relative flex h-10 items-center gap-[3px]">
        {WAVE.map((h, i) => (
          <span
            key={i}
            className="ll-wave-bar w-[3px] rounded-full bg-primary"
            style={{ height: h, animationDelay: `${i * 0.07}s` }}
          />
        ))}
      </span>
      <span className="sr-only">Loading Lobby &amp; Lounge</span>
    </div>
  );
}

// Resting heights (px) of a waveform envelope: loud in the middle, tapering at the edges.
const WAVE = [6, 10, 16, 12, 22, 30, 18, 36, 26, 40, 28, 34, 20, 38, 24, 30, 16, 22, 12, 14, 8, 6];
