"use client";

import React from "react";

const features = [
  {
    title: "Fully licensed",
    desc: "Every track is cleared for commercial use, so you can play with total peace of mind — no royalty collectors, no copyright strikes, no surprise invoices.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Curated weekly",
    desc: "Every channel is refreshed with new tracks each week, so your regulars — and your staff — never hear the same rotation on repeat.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9 12 2" />
      </svg>
    ),
  },
  {
    title: "Works in the browser",
    desc: "No hardware to buy, nothing to install. Open Lobby & Lounge on any laptop, tablet or phone with a browser and press play.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <rect x="2" y="4" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 18v3" />
      </svg>
    ),
  },
];

export const LicensingSection = () => {
  return (
    <section
      id="licensing"
      style={{
        position: "relative",
        padding: "120px 0",
        background: "#0B0F14",
        color: "#fff",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        {/* Top two-col heading */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end" }} className="feat-top">
          <h2
            data-ll-reveal
            style={{
              fontFamily: "var(--ll-font-display)",
              fontSize: "clamp(40px, 5.2vw, 66px)",
              fontWeight: 700,
              lineHeight: .98,
              letterSpacing: "-.02em",
              margin: 0,
            }}
          >
            Licensed music,<br />zero paperwork
          </h2>
          <div data-ll-reveal data-ll-delay="1">
            <p style={{ fontFamily: "var(--ll-font-body)", fontSize: "clamp(17px, 2vw, 20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)", margin: 0 }}>
              <b style={{ color: "#fff" }}>56% of business owners</b>{" "}don&apos;t know that a personal Spotify or Apple Music subscription isn&apos;t licensed for commercial use. Every track in Lobby &amp; Lounge is — so you can stop worrying about licensing and start building your brand sound.
            </p>
            <p style={{ marginTop: 14, fontFamily: "var(--ll-font-body)", fontSize: 12.5, color: "var(--ll-on-ink-3)" }}>
              Source: MRC Data × Soundtrack Your Brand, B2B study, 2021
            </p>
          </div>
        </div>

        {/* Cards */}
        <div style={{ marginTop: 72, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="feat-cards">
          {features.map((f, i) => (
            <article
              key={f.title}
              data-ll-reveal
              data-ll-delay={i === 0 ? undefined : String(i)}
              style={{
                padding: "34px 30px 32px",
                background: "var(--ll-ink-2)",
                border: "1px solid var(--ll-ink-line)",
                borderRadius: 22,
                transition: "transform .35s, border-color .35s, box-shadow .35s",
                position: "relative",
                overflow: "hidden",
              }}
              className="ll-fcard"
            >
              <div
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  display: "grid", placeItems: "center",
                  marginBottom: 22,
                  background: "rgba(78,205,196,.16)",
                  color: "var(--ll-accent)",
                  transition: "transform .4s, background .3s, color .3s",
                }}
                className="ll-fcard-ico"
              >
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 21, lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 11, transition: "color .25s" }} className="ll-fcard-title">
                {f.title}
              </h3>
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--ll-on-ink-2)", margin: 0 }}>
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .feat-top { }
        @media (max-width: 800px) {
          .feat-top { grid-template-columns: 1fr !important; }
          .feat-cards { grid-template-columns: 1fr !important; }
        }
        .ll-fcard:hover { transform: translateY(-6px); border-color: rgba(78,205,196,.55) !important; box-shadow: 0 30px 60px -28px rgba(78,205,196,.45); }
        .ll-fcard:hover .ll-fcard-ico { transform: rotate(-6deg) scale(1.1); background: var(--ll-accent) !important; color: var(--ll-accent-ink) !important; }
        .ll-fcard:hover .ll-fcard-title { color: var(--ll-accent); }
        .ll-fcard::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; opacity: 0;
          background: radial-gradient(120% 80% at 100% 0%, rgba(78,205,196,.14), transparent 60%);
          transition: opacity .4s; pointer-events: none;
        }
        .ll-fcard:hover::before { opacity: 1; }
      `}</style>
    </section>
  );
};
