"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CARD_STEP = 231; // card width + gap

/** A titled, horizontally scrolling row of cards with prev/next buttons. */
export function PlaylistCarousel({
  title,
  blurb,
  action,
  children,
}: {
  title: string;
  blurb?: string;
  /** Optional control next to the arrows, e.g. a "New" button. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const slide = (direction: number) =>
    railRef.current?.scrollBy({ left: direction * CARD_STEP, behavior: "smooth" });

  const arrow =
    "w-[29px] h-[29px] rounded-full flex items-center justify-center border border-primary/20 bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors";

  return (
    <section aria-label={title} className="mb-7">
      <div className="flex items-end justify-between gap-3.5 mb-2.5">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
          {blurb && <p className="text-[11px] text-muted-foreground mt-0.5">{blurb}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {action}
          <button onClick={() => slide(-1)} aria-label={`Previous ${title}`} className={arrow}>
            <ChevronLeft className="w-3 h-3" strokeWidth={2.4} />
          </button>
          <button onClick={() => slide(1)} aria-label={`Next ${title}`} className={arrow}>
            <ChevronRight className="w-3 h-3" strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="flex gap-[11px] overflow-x-auto snap-x snap-mandatory scrollbar-hide px-px pt-0.5 pb-2.5"
      >
        {children}
      </div>
    </section>
  );
}
