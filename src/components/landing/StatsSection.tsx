import React from "react";
import { LandingVideo } from "@/components/landing/LandingVideo";

export const StatsSection = () => (
  <section id="results" className="scroll-mt-20 py-24 md:py-32">
    <div className="ll-container grid items-center gap-12 md:grid-cols-2 md:gap-20">
      <div data-ll-reveal>
        <LandingVideo src="/videos/landing/tempo.mp4" poster="/videos/landing/tempo.jpg" label="Animation: slower music keeps diners at the table longer and ordering more rounds" />
      </div>

      {/* Copy */}
      <div data-ll-reveal data-ll-delay="1">
        <p className="ll-eyebrow">The results</p>
        <h2 className="ll-h2 mt-3">The right music pays for itself.</h2>
        <p className="ll-lead mt-4">
          Business owners agree: music shapes the mood in the room, how long guests stay, and what they buy. Lobby &amp; Lounge gives you a licensed catalogue and the tools to set that atmosphere on purpose.
        </p>
      </div>
    </div>

    {/* Headline stat — MRC Data × Soundtrack Your Brand, B2B study, 2021 (n=1,001) */}
    <div data-ll-reveal className="ll-container mt-20 md:mt-28">
      <div className="grid items-end gap-6 border-t border-ll-line pt-10 md:grid-cols-[auto_1fr] md:gap-12">
        <p className="text-[64px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-ll-navy md:text-[88px]">
          71%
        </p>
        <div className="pb-2">
          <p className="max-w-xl text-xl font-medium leading-snug">
            of businesses say the right music positively impacts what their customers buy.
          </p>
          <p className="mt-2 text-[13px] text-ll-text-2">
            MRC Data × Soundtrack Your Brand · B2B study · 2021
          </p>
        </div>
      </div>
    </div>
  </section>
);
