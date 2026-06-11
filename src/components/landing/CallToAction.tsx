"use client";

import React from "react";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export const CallToAction = () => {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "var(--ll-ink-1)", color: "#fff", padding: "130px 0", textAlign: "center" }}>
      {/* BG radials */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(70% 120% at 50% 0%, rgba(44,181,176,.22), transparent 60%), radial-gradient(80% 120% at 50% 120%, rgba(21,31,108,.5), transparent 55%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <h2
          data-ll-reveal
          style={{
            fontFamily: "var(--ll-font-display)",
            fontSize: "clamp(46px, 7vw, 92px)",
            fontWeight: 800,
            lineHeight: .95,
            letterSpacing: "-.035em",
            margin: 0,
          }}
        >
          Start playing today
        </h2>

        <p
          data-ll-reveal
          data-ll-delay="1"
          style={{
            maxWidth: 560,
            margin: "26px auto 0",
            fontFamily: "var(--ll-font-body)",
            fontSize: "clamp(17px,2vw,20px)",
            lineHeight: 1.6,
            color: "var(--ll-on-ink-2)",
          }}
        >
          Set the perfect atmosphere in minutes. Compatible with the hardware you already use — or just open the app.
        </p>

        <div data-ll-reveal data-ll-delay="1" style={{ marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/signup"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 16,
              padding: "19px 34px", borderRadius: 999,
              background: "var(--ll-accent)", color: "var(--ll-accent-ink)",
              boxShadow: "0 12px 30px -8px rgba(78,205,196,.6)",
              transition: "transform .25s, box-shadow .25s",
              position: "relative", overflow: "hidden",
            }}
            className="ll-btn-primary"
          >
            Sign up now <ArrowIcon />
          </a>
          <a
            href="#pricing"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 16,
              padding: "19px 34px", borderRadius: 999,
              background: "transparent", color: "#fff",
              border: "1.5px solid rgba(255,255,255,.28)",
              transition: "transform .25s, border-color .25s, color .25s",
            }}
            className="ll-btn-ghost"
          >
            View pricing
          </a>
        </div>

        <div data-ll-reveal data-ll-delay="2" style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--ll-on-ink-3)" }}>
            Works with
          </span>
          {["Sonos", "Axis", "Bose", "Any pro audio"].map((hw, i, arr) => (
            <React.Fragment key={hw}>
              <b
                style={{ fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 17, color: "rgba(255,255,255,.78)", letterSpacing: "-.01em", transition: "color .25s, transform .25s", cursor: "default" }}
                className="ll-hw-item"
              >
                {hw}
              </b>
              {i < arr.length - 1 && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ll-on-ink-3)" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        .ll-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -8px rgba(78,205,196,.7) !important; }
        .ll-btn-primary::after {
          content: ""; position: absolute; top: 0; left: -130%;
          width: 55%; height: 100%; transform: skewX(-18deg);
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.38), transparent);
          pointer-events: none;
        }
        .ll-btn-primary:hover::after { animation: ll-btn-shine .85s var(--ll-ease); }
        .ll-btn-ghost:hover { border-color: var(--ll-accent) !important; color: var(--ll-accent) !important; transform: translateY(-2px); }
        .ll-hw-item:hover { color: #fff !important; transform: translateY(-2px); }
      `}</style>
    </section>
  );
};
