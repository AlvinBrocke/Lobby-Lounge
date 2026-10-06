import React from "react";
import { Check } from "lucide-react";

// "Importance of background music" — % of US businesses agreeing.
// MRC Data × Soundtrack Your Brand, B2B study, 2021 (n=1,001).
const bars = [
  { h: 65, label: "Longer stays" },
  { h: 67, label: "Fits our brand" },
  { h: 71, label: "Purchasing" },
  { h: 75, label: "Opinion of us" },
  { h: 76, label: "Atmosphere" },
  { h: 79, label: "Guest mood" },
];

export const StatsSection = () => (
  <section id="results" className="scroll-mt-20 bg-ll-paper-2 py-24 md:py-32">
    <div className="ll-container grid items-center gap-12 md:grid-cols-2 md:gap-20">
      {/* Chart card */}
      <figure data-ll-reveal className="rounded-2xl border border-ll-line bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-sm text-ll-text-2">Say music keeps guests longer</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">65%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-ll-text-2">Businesses playing music</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">87%</p>
          </div>
        </div>

        {/* The page's scroll script adds .ll-visible, which grows the bars */}
        <div className="ll-bars mt-8 flex h-44 items-end gap-2.5">
          {bars.map((b, i) => (
            <span
              key={b.label}
              data-bar
              title={`${b.label} — ${b.h}%`}
              className="flex-1 rounded-t-md"
              style={{
                height: `${b.h}%`,
                background: i === bars.length - 1 ? "var(--ll-teal-ink)" : `rgba(24,120,115,${0.18 + i * 0.1})`,
              }}
            />
          ))}
        </div>
        <figcaption className="mt-3 text-xs text-ll-text-2">
          % of businesses who agree music impacts each outcome
        </figcaption>
      </figure>

      {/* Copy */}
      <div data-ll-reveal data-ll-delay="1">
        <p className="ll-eyebrow">The results</p>
        <h2 className="ll-h2 mt-3">The right music pays for itself.</h2>
        <p className="ll-lead mt-4">
          Business owners agree: music shapes the mood in the room, how long guests stay, and what they buy. Lobby &amp; Lounge gives you a licensed catalogue and the tools to set that atmosphere on purpose.
        </p>
        <ul className="mt-7 grid gap-3">
          {["Fully licensed catalogue", "Weekly scheduling", "Playlists you control"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-base font-medium">
              <Check className="h-4 w-4 text-ll-teal-ink" strokeWidth={2.25} aria-hidden /> {item}
            </li>
          ))}
        </ul>
        <a href="#how-it-works" className="ll-btn ll-btn-secondary mt-8">
          See how it works
        </a>
      </div>
    </div>

    {/* Headline stat */}
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
