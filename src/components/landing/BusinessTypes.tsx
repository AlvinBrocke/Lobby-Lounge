"use client";

import React from "react";

const types = [
  {
    title: "Hotels & lobbies",
    desc: "Calm, polished sound that welcomes guests at check-in and carries through to late-night arrivals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" /><path d="M3 21h18M9 21v-4h6v4M8 9h2M14 9h2M8 13h2M14 13h2" />
      </svg>
    ),
  },
  {
    title: "Cafés & coffee shops",
    desc: "Bright mornings, mellow afternoons — a rotation that matches the pace of the day.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /><path d="M6 2v2M10 2v2M14 2v2" />
      </svg>
    ),
  },
  {
    title: "Restaurants",
    desc: "Set the mood for lunch service and dinner rush without touching a dial mid-shift.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    title: "Bars & lounges",
    desc: "Build energy through happy hour and keep it going into the night.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M8 22h8M12 11v11M5 3h14l-7 8z" />
      </svg>
    ),
  },
  {
    title: "Retail",
    desc: "Music that fits your brand keeps shoppers browsing longer and feeling at home.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    title: "Spas & wellness",
    desc: "Low-tempo, unhurried sound that lets guests switch off the moment they walk in.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 25, height: 25 }}>
        <path d="M12 22c4-4 8-7.5 8-12a8 8 0 0 0-16 0c0 4.5 4 8 8 12z" /><path d="M12 22V10" /><path d="M12 14c-2-1-3-3-3-5M12 14c2-1 3-3 3-5" />
      </svg>
    ),
  },
];

export const BusinessTypes = () => {
  return (
    <section
      id="business-types"
      style={{
        position: "relative",
        padding: "120px 0",
        background: "#0B0F14",
        color: "#fff",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div data-ll-reveal style={{ maxWidth: 680 }}>
          <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".2em", color: "var(--ll-accent)", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
            Business types
          </span>
          <h2 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 700, lineHeight: 1.02, margin: "18px 0 0", letterSpacing: "-.02em" }}>
            Built for the places people gather
          </h2>
          <p style={{ marginTop: 18, maxWidth: 560, fontFamily: "var(--ll-font-body)", fontSize: "clamp(17px,2vw,20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
            Whatever your space, there&apos;s a soundtrack for it — and a schedule that keeps it right all day.
          </p>
        </div>

        <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="btype-cards">
          {types.map((t, i) => (
            <article
              key={t.title}
              data-ll-reveal
              data-ll-delay={i === 0 ? undefined : String(Math.min(i, 3))}
              style={{
                padding: "30px 28px 28px",
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
                  marginBottom: 20,
                  background: "rgba(78,205,196,.16)",
                  color: "var(--ll-accent)",
                  transition: "transform .4s, background .3s, color .3s",
                }}
                className="ll-fcard-ico"
              >
                {t.icon}
              </div>
              <h3 style={{ fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 20, lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 10, transition: "color .25s" }} className="ll-fcard-title">
                {t.title}
              </h3>
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--ll-on-ink-2)", margin: 0 }}>
                {t.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .btype-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};
