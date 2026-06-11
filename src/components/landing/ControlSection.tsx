"use client";

import React from "react";
import Image from "next/image";

const rows = [
  {
    title: "Smart scheduling",
    desc: "Set the perfect soundtrack for the whole year in minutes — by day, daypart or season.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Zone control",
    desc: "Lobby, bar, terrace, spa — give every area its own atmosphere, independently.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "Announcements",
    desc: "Schedule messages and promos that fade in over the music — no awkward silences.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
  },
  {
    title: "Remote management",
    desc: "Manage every venue from your phone. Hardware-compatible with Sonos, Axis and more.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
    ),
  },
];

export const ControlSection = () => {
  return (
    <section
      id="control"
      style={{ position: "relative", padding: "120px 0", background: "var(--ll-ink-1)", color: "#fff" }}
    >
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 64, alignItems: "center" }} className="control-grid">

          {/* Visual */}
          <div data-ll-reveal style={{ position: "relative", borderRadius: 30, overflow: "hidden", border: "1px solid var(--ll-ink-line)", boxShadow: "0 50px 90px -36px rgba(0,0,0,.7)" }}>
            <Image
              src="/images/Playlist On Tablet mockup(1).jpg"
              alt="Scheduling and zone control on a tablet"
              width={700}
              height={525}
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", left: 20, bottom: 20,
              display: "flex", alignItems: "center", gap: 9,
              padding: "9px 14px", borderRadius: 11,
              background: "rgba(10,14,18,.62)", backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,.13)",
              fontFamily: "var(--ll-font-body)", fontWeight: 600, fontSize: 12.5, color: "#fff",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ll-accent)", boxShadow: "0 0 12px 2px var(--ll-accent)", flexShrink: 0 }} />
              Zone 1 live · v2.4
            </div>
          </div>

          {/* Copy */}
          <div data-ll-reveal data-ll-delay="1">
            <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".2em", color: "var(--ll-accent)", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
              Take control
            </span>
            <h2 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-.02em", margin: "18px 0 0" }}>
              One dashboard,<br />every zone
            </h2>
            <p style={{ marginTop: 20, fontFamily: "var(--ll-font-body)", fontSize: "clamp(17px,2vw,20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
              Schedule your music, plan announcements and tune each space from a single place. Use the web portal or the dedicated tablet app — anywhere, anytime.
            </p>

            <div style={{ marginTop: 34, display: "grid", gap: 6 }}>
              {rows.map((row) => (
                <div
                  key={row.title}
                  style={{
                    display: "flex", gap: 16, padding: "18px 0",
                    borderTop: "1px solid var(--ll-ink-line)",
                    borderRadius: 10,
                    transition: "background .28s, padding .28s, border-radius .28s",
                  }}
                  className="ll-crow"
                >
                  <div
                    style={{
                      width: 40, height: 40, flexShrink: 0,
                      borderRadius: 11, display: "grid", placeItems: "center",
                      background: "rgba(78,205,196,.15)", color: "var(--ll-accent)",
                      transition: "transform .35s, background .3s, color .3s",
                    }}
                    className="ll-crow-ico"
                  >
                    {row.icon}
                  </div>
                  <div>
                    <b style={{ display: "block", fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 16.5, lineHeight: 1.3, letterSpacing: "-.01em", marginBottom: 3, transition: "color .25s" }} className="ll-crow-title">
                      {row.title}
                    </b>
                    <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--ll-on-ink-2)", margin: 0 }}>
                      {row.desc}
                    </p>
                  </div>
                </div>
              ))}
              <div style={{ borderBottom: "1px solid var(--ll-ink-line)" }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .control-grid { grid-template-columns: 1fr !important; gap: 44px !important; }
        }
        .ll-crow:hover { background: rgba(78,205,196,.06); padding-left: 14px !important; padding-right: 14px !important; }
        .ll-crow:hover .ll-crow-ico { transform: scale(1.12) rotate(-6deg); background: var(--ll-accent) !important; color: var(--ll-accent-ink) !important; }
        .ll-crow:hover .ll-crow-title { color: var(--ll-accent); }
      `}</style>
    </section>
  );
};
