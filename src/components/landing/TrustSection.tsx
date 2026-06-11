"use client";

import React from "react";

const items = [
  {
    label: "Fully licensed",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "Curated weekly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <polygon points="12 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9 12 2" />
      </svg>
    ),
  },
  {
    label: "Multi-zone",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Global catalog",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
      </svg>
    ),
  },
];

export const TrustSection = () => {
  return (
    <div style={{
      background: "var(--ll-ink-0)",
      color: "#fff",
      padding: "30px 0",
      borderTop: "1px solid var(--ll-ink-line)",
      borderBottom: "1px solid var(--ll-ink-line)",
    }}>
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 11.5, textTransform: "uppercase" as const, letterSpacing: ".18em", color: "var(--ll-on-ink-3)", whiteSpace: "nowrap" as const }}>
          Trusted across hospitality
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 34, flexWrap: "wrap" as const }}>
          {items.map((item) => (
            <span
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-.01em", cursor: "default", transition: "color .25s" }}
              className="ll-trust-item"
            >
              <span style={{ color: "var(--ll-accent)", transition: "transform .35s" }} className="ll-trust-icon">
                {item.icon}
              </span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        .ll-trust-item:hover { color: var(--ll-accent) !important; }
        .ll-trust-item:hover .ll-trust-icon { transform: scale(1.25) rotate(-8deg); }
      `}</style>
    </div>
  );
};
