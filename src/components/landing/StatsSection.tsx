"use client";

import React, { useEffect, useRef, useState } from "react";

const BarChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, color: "var(--ll-accent)", flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const bars = [
  { h: "40%", opacity: 0.18 }, { h: "58%", opacity: 0.18 },
  { h: "50%", opacity: 0.32 }, { h: "74%", opacity: 0.55 },
  { h: "90%", opacity: 0.80 }, { h: "85%", opacity: 1 },
];

function useCountUp(target: number, trigger: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return value;
}

export const StatsSection = () => {
  const statRef = useRef<HTMLDivElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const [statVisible, setStatVisible] = useState(false);
  const [bigVisible, setBigVisible] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.target === statRef.current && e.isIntersecting) setStatVisible(true);
          if (e.target === bigRef.current && e.isIntersecting) setBigVisible(true);
          if (e.target === barsRef.current && e.isIntersecting) setBarsVisible(true);
        });
      },
      { threshold: 0.3 }
    );
    if (statRef.current) obs.observe(statRef.current);
    if (bigRef.current) obs.observe(bigRef.current);
    if (barsRef.current) obs.observe(barsRef.current);
    return () => obs.disconnect();
  }, []);

  const dwell = useCountUp(24, statVisible);
  const bigStat = useCountUp(71, bigVisible);

  return (
    <section id="results" style={{ position: "relative", padding: "120px 0", background: "var(--ll-ink-0)", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="stats-grid">

          {/* Stat card */}
          <div style={{ position: "relative" }} data-ll-reveal>
            <div style={{
              padding: 34, borderRadius: 30,
              background: "var(--ll-ink-2)", border: "1px solid var(--ll-ink-line)",
            }}>
              <div ref={statRef} style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, display: "grid", placeItems: "center", background: "rgba(78,205,196,.16)", color: "var(--ll-accent)" }}>
                  <BarChartIcon />
                </div>
                <div>
                  <small style={{ display: "block", fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 13, color: "var(--ll-on-ink-3)", marginBottom: 6 }}>Customer dwell time</small>
                  <b style={{ fontFamily: "var(--ll-font-display)", fontWeight: 800, fontSize: 26, lineHeight: 1 }}>+{dwell}%</b>
                </div>
              </div>

              {/* Bar chart */}
              <div ref={barsRef} style={{ display: "flex", alignItems: "flex-end", gap: 11, height: 190 }} className={`ll-bars${barsVisible ? " ll-visible" : ""}`}>
                {bars.map((b, i) => (
                  <span
                    key={i}
                    data-bar
                    style={{
                      flex: 1, height: b.h, borderRadius: "8px 8px 0 0",
                      background: `rgba(78,205,196,${b.opacity})`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Floating time-saved badge */}
            <div style={{
              position: "absolute", top: -22, right: -18,
              padding: "15px 18px", borderRadius: 16,
              background: "var(--ll-ink-3)", border: "1px solid var(--ll-ink-line)",
              boxShadow: "0 24px 44px -20px rgba(0,0,0,.6)",
              animation: "ll-floaty 4.5s ease-in-out infinite",
            }}>
              <small style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: ".1em", color: "var(--ll-on-ink-3)", marginBottom: 9 }}>
                <span style={{ color: "var(--ll-accent)" }}><ClockIcon /></span> Time saved
              </small>
              <b style={{ fontFamily: "var(--ll-font-display)", fontWeight: 800, fontSize: 20, lineHeight: 1, color: "#fff" }}>3h / week</b>
            </div>
          </div>

          {/* Copy */}
          <div data-ll-reveal data-ll-delay="1">
            <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".2em", color: "var(--ll-accent)", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
              The results
            </span>
            <h2 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-.02em", margin: "18px 0 0" }}>
              Save time. Sell more.
            </h2>
            <p style={{ marginTop: 20, fontFamily: "var(--ll-font-body)", fontSize: "clamp(17px,2vw,20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
              Stop manually curating playlists. Automation lets you set the perfect schedule for the entire year in minutes — and the right atmosphere keeps guests staying, and spending, longer.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "30px 0 0", display: "grid", gap: 14 }}>
              {["AI-powered music selection", "Multi-location sync", "Remote management from any device"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 13, fontFamily: "var(--ll-font-body)", fontWeight: 600, fontSize: 16, lineHeight: 1.4, color: "var(--ll-on-ink-2)" }} className="ll-stat-li">
                  <CheckIcon /> {item}
                </li>
              ))}
            </ul>
            <a href="#control" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 15, padding: "16px 28px", borderRadius: 999, background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.28)", transition: "transform .25s, border-color .25s, color .25s", marginTop: 34 }} className="ll-btn-ghost">
              See how it works
            </a>
          </div>
        </div>

        {/* Big stat */}
        <div ref={bigRef} data-ll-reveal style={{ marginTop: 130, textAlign: "center" }}>
          <h3 style={{
            fontFamily: "var(--ll-font-display)",
            fontSize: "clamp(110px, 18vw, 240px)",
            fontWeight: 800,
            lineHeight: .85,
            letterSpacing: "-.05em",
            background: "var(--ll-grad-tide)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}>
            {bigStat}%
          </h3>
          <p style={{ maxWidth: 640, margin: "26px auto 0", fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: "clamp(18px,2.4vw,24px)", lineHeight: 1.5, color: "#fff" }}>
            of businesses find that the right music helps staff start conversations with customers.
          </p>
          <small style={{ display: "block", marginTop: 18, fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".2em", color: "var(--ll-accent)" }}>
            Lobby &amp; Lounge Research · 2025
          </small>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) { .stats-grid { grid-template-columns: 1fr !important; } }
        .ll-stat-li svg { transition: transform .3s; }
        .ll-stat-li:hover svg { transform: scale(1.3) rotate(8deg); }
        .ll-btn-ghost:hover { border-color: var(--ll-accent) !important; color: var(--ll-accent) !important; transform: translateY(-2px); }
      `}</style>
    </section>
  );
};
