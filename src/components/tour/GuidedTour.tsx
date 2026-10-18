"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { primaryButton, secondaryButton } from "@/components/playlists/Modal";
import usePlayerStore from "@/store/usePlayerStore";
import { cn } from "@/lib/utils";
import { useTour, visibleSteps } from "./tour";

const CARD_WIDTH = 320;
const GAP = 14;

/**
 * The first visible `[data-tour=target]` element's box, kept in sync while the
 * page scrolls or resizes. `undefined` while still looking, `null` if it never
 * showed up (slow query, empty state): the card then shows centred.
 */
function useTargetRect(target: string | undefined, pathname: string) {
  const [rect, setRect] = useState<DOMRect | null | undefined>(undefined);

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    setRect(undefined);
    let el: Element | undefined;
    let frame = 0;
    const startedAt = performance.now();
    const measure = () => el && setRect(el.getBoundingClientRect());
    const ro = new ResizeObserver(measure);
    const find = () => {
      // The sidebar and the mobile tab bar both carry the nav targets; only one is displayed.
      el = Array.from(document.querySelectorAll(`[data-tour="${target}"]`)).find(
        (e) => e.getClientRects().length > 0,
      );
      if (el) {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
        measure();
        ro.observe(el);
      } else if (performance.now() - startedAt < 1500) {
        frame = requestAnimationFrame(find);
      } else {
        setRect(null);
      }
    };
    find();
    window.addEventListener("resize", measure);
    // Capture phase: the page scrolls inside ScrollArea, not the window.
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [target, pathname]);

  return rect;
}

/** Beside targets in the left rail, otherwise below (or above, near the bottom). */
function cardPosition(rect: DOMRect | null): React.CSSProperties {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  const width = Math.min(CARD_WIDTH, window.innerWidth - 32);
  const clampLeft = (x: number) => Math.min(Math.max(x, 16), window.innerWidth - width - 16);
  if (rect.right < 260 && rect.right + GAP + width < window.innerWidth) {
    return { top: Math.max(16, Math.min(rect.top, window.innerHeight - 240)), left: rect.right + GAP };
  }
  const left = clampLeft(rect.left + rect.width / 2 - width / 2);
  return rect.bottom + GAP + 220 < window.innerHeight
    ? { top: rect.bottom + GAP, left }
    : { bottom: window.innerHeight - rect.top + GAP, left };
}

/**
 * The guided tour overlay, mounted once in AppLayout. Starts by itself the first
 * time someone reaches the app; the "?" menu replays it. Steps move with
 * `router.push`, which keeps AppLayout (and the player) mounted.
 */
export function GuidedTour() {
  const { active, index, start, next, back, stop } = useTour();
  const { isLoaded, user } = useUser();
  const isCurator = useAuth().orgRole === "org:member";
  const router = useRouter();
  const pathname = usePathname();
  const cardRef = useRef<HTMLDivElement>(null);
  const autoStarted = useRef(false);

  const steps = visibleSteps(isCurator);
  // The org role can arrive after the tour starts and shorten the list.
  const step = active ? steps[Math.min(index, steps.length - 1)] : undefined;
  const last = index >= steps.length - 1;
  const rect = useTargetRect(step?.target, pathname);

  // Per Clerk user, not in Convex: staff share the owner's profile, so a flag
  // there would hide the tour from every curator the owner invites.
  useEffect(() => {
    if (!isLoaded || !user || autoStarted.current || user.unsafeMetadata.tourCompletedAt) return;
    autoStarted.current = true;
    start();
  }, [isLoaded, user, start]);

  // Not keyed on pathname: if someone wanders off mid-step, Next brings them back.
  useEffect(() => {
    if (step?.route && pathname !== step.route) router.push(step.route);
  }, [step?.id]);

  function finish() {
    stop();
    document.querySelector<HTMLElement>('[data-tour="help-button"]')?.focus();
    if (user && !user.unsafeMetadata.tourCompletedAt) {
      // If this fails (offline), the tour just shows again next session.
      user
        .update({ unsafeMetadata: { ...user.unsafeMetadata, tourCompletedAt: Date.now() } })
        .catch(() => {});
    }
  }
  const advance = () => (last ? finish() : next());

  // The "play" step moves on by itself once music starts.
  useEffect(() => {
    if (step?.id !== "play") return;
    return usePlayerStore.subscribe((s, prev) => {
      if (s.isPlaying && (!prev.isPlaying || s.currentTrack !== prev.currentTrack)) next();
    });
  }, [step?.id, next]);

  useEffect(() => {
    if (!step) return;
    const onKey = (e: KeyboardEvent) => {
      // Leave keys alone while someone is typing (e.g. the search box during that step).
      if ((e.target as HTMLElement).closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") advance();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const ready = rect !== undefined;
  useEffect(() => {
    if (ready) cardRef.current?.focus({ preventScroll: true });
  }, [step?.id, ready]);

  if (!step || !ready) return null;

  const pad = 6;
  return createPortal(
    <>
      {/* One element dims the whole page: its huge shadow is the backdrop, its
          hole is the spotlight. pointer-events-none keeps the target clickable. */}
      <div
        aria-hidden
        className={cn(
          "fixed z-[60] pointer-events-none",
          rect ? "rounded-xl ring-2 ring-primary motion-safe:transition-all motion-safe:duration-300" : "inset-0 bg-black/60",
        )}
        style={
          rect
            ? {
                top: rect.top - pad,
                left: rect.left - pad,
                width: rect.width + pad * 2,
                height: rect.height + pad * 2,
                boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.6)",
              }
            : undefined
        }
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        className="fixed z-[61] bg-card border border-primary/30 rounded-2xl p-5 shadow-2xl outline-none"
        style={{ width: `min(${CARD_WIDTH}px, calc(100vw - 32px))`, ...cardPosition(rect) }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            Step {Math.min(index, steps.length - 1) + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={finish}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
        </div>
        <h2 id="tour-title" className="text-base font-bold text-foreground mt-1.5">
          {step.title}
        </h2>
        <p id="tour-body" className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {step.body}
        </p>
        <div className="flex gap-2 mt-4">
          {index > 0 && (
            <button type="button" onClick={back} className={cn(secondaryButton, "py-2")}>
              Back
            </button>
          )}
          <button type="button" onClick={advance} className={cn(primaryButton, "py-2")}>
            {index === 0 ? "Show me around" : last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
