"use client";

import React from "react";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: "var(--ll-accent)", flexShrink: 0, marginTop: 1 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const plan = {
  name: "L&L Basic",
  price: "$20",
  period: "/ month",
  tag: "Free for 1 month",
  desc: "Everything a single venue needs to sound great.",
  features: [
    "One location, one zone",
    "Curated channels & daypart scheduling",
    "Web & tablet app",
    "No credit card to start — cancel anytime",
    "Announcements between songs (coming soon)",
  ],
  cta: "Start free trial",
  ctaHref: "/signup",
};

export const PricingSection = () => {
  return (
    <section id="pricing" style={{ position: "relative", padding: "120px 0", background: "#0B0F14", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        {/* Heading */}
        <div data-ll-reveal style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".2em", color: "var(--ll-accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
            Pricing
          </span>
          <h2 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-.02em", margin: "18px 0 0" }}>
            One simple plan
          </h2>
          <p style={{ marginTop: 18, fontFamily: "var(--ll-font-body)", fontSize: "clamp(17px,2vw,20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
            Free for your first month. No credit card, no commitment — add a payment method only when your trial ends.
          </p>
        </div>

        {/* Card */}
        <div style={{ maxWidth: 460, margin: "64px auto 0" }}>
          <article
            data-ll-reveal
            data-ll-delay="1"
            style={{
              position: "relative",
              display: "flex", flexDirection: "column",
              padding: "38px 32px",
              borderRadius: 30,
              background: "var(--ll-ink-3)",
              border: "1px solid rgba(78,205,196,.55)",
              boxShadow: "0 40px 80px -34px rgba(78,205,196,.5)",
              transition: "transform .35s, box-shadow .35s",
            }}
            className="ll-pcard"
          >
            {plan.tag && (
              <span style={{
                position: "absolute", top: 22, right: 22,
                fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 10.5,
                textTransform: "uppercase" as const, letterSpacing: ".12em",
                padding: "7px 12px", borderRadius: 999,
                background: "var(--ll-accent)", color: "var(--ll-accent-ink)",
                animation: "ll-tag-pulse 2.6s ease-in-out infinite",
              }}>
                {plan.tag}
              </span>
            )}

            <h3 style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 15, textTransform: "uppercase" as const, letterSpacing: ".12em", color: "var(--ll-on-ink-3)", marginBottom: 20 }}>
              {plan.name}
            </h3>

            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <b style={{ fontFamily: "var(--ll-font-display)", fontWeight: 800, fontSize: 56, lineHeight: 1, letterSpacing: "-.03em", transition: "transform .35s", display: "inline-block" }} className="ll-price-num">
                {plan.price}
              </b>
              <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 600, fontSize: 15, color: "var(--ll-on-ink-3)" }}>
                {plan.period}
              </span>
            </div>

            <p style={{ margin: "16px 0 26px", fontFamily: "var(--ll-font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--ll-on-ink-2)", minHeight: 44 }}>
              {plan.desc}
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px", display: "grid", gap: 13, flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: "flex", gap: 11, fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 14.5, lineHeight: 1.45, color: "#fff" }} className="ll-pcard-li">
                  <CheckIcon /> {f}
                </li>
              ))}
            </ul>

            <a
              href={plan.ctaHref}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 15,
                padding: "16px 28px", borderRadius: 999,
                background: "var(--ll-accent)",
                color: "var(--ll-accent-ink)",
                border: "none",
                boxShadow: "0 12px 30px -8px rgba(78,205,196,.6)",
                transition: "transform .25s, border-color .25s, color .25s, box-shadow .25s",
                marginTop: "auto",
                position: "relative", overflow: "hidden",
              }}
              className="ll-btn-primary"
            >
              {plan.cta}
            </a>
          </article>
        </div>

        <p style={{ textAlign: "center", marginTop: 36, fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 14, color: "var(--ll-on-ink-3)" }}>
          Prices in USD. Music pauses at the end of your free month until a payment method is added.
        </p>
      </div>

      <style>{`
        .ll-pcard:hover { transform: translateY(-6px); }
        .ll-pcard:hover .ll-price-num { transform: scale(1.04); }
        .ll-pcard:hover .ll-pcard-li svg { transform: scale(1.18); }
        .ll-pcard-li svg { transition: transform .3s; }
        .ll-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -8px rgba(78,205,196,.7) !important; }
      `}</style>
    </section>
  );
};
