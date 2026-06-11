"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: "var(--ll-accent)" }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);

export const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const card = cardRef.current;
    const orb = orbRef.current;
    const chip = chipRef.current;
    if (!hero || !card) return;

    let raf: number | null = null;
    let tx = 0, ty = 0;

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); };
    const apply = () => {
      raf = null;
      card.style.transform = `rotate(2.5deg) translate(${tx * 10}px,${ty * 10}px)`;
      if (orb) orb.style.transform = `translate(${tx * -22}px,${ty * -22}px)`;
      if (chip) chip.style.transform = `translate(${tx * 16}px,${ty * 16}px)`;
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--ll-ink-1)",
        color: "#fff",
        padding: "168px 0 110px",
      }}
    >
      {/* BG gradient */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(120% 90% at 85% 0%, rgba(44,181,176,.20) 0%, transparent 55%),
          radial-gradient(90% 80% at 0% 100%, rgba(21,31,108,.55) 0%, transparent 60%),
          linear-gradient(160deg, #0F1419 0%, #0c1322 45%, #0A0E12 100%)`,
      }} />
      {/* Soundwave texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url('/images/LL soundwave3.png')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: .16, mixBlendMode: "screen", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center" }} className="hero-grid">

          {/* Copy */}
          <div className="hero-copy">
            <span
              data-ll-reveal
              style={{
                fontFamily: "var(--ll-font-body)",
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".2em",
                color: "var(--ll-accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
              Licensed music for hospitality
            </span>

            <h1
              data-ll-reveal
              data-ll-delay="1"
              style={{
                fontFamily: "var(--ll-font-display)",
                fontSize: "clamp(54px, 8vw, 104px)",
                fontWeight: 800,
                lineHeight: .92,
                letterSpacing: "-.035em",
                margin: "26px 0 0",
              }}
            >
              Music<br />for your<br />
              <span style={{
                background: "var(--ll-grad-product)",
                backgroundSize: "220% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                animation: "ll-grad-drift 8s ease-in-out infinite",
              }}>
                Business
              </span>
            </h1>

            <p
              data-ll-reveal
              data-ll-delay="2"
              style={{
                marginTop: 28,
                maxWidth: 480,
                fontFamily: "var(--ll-font-body)",
                fontSize: "clamp(17px, 2vw, 20px)",
                lineHeight: 1.6,
                color: "var(--ll-on-ink-2)",
              }}
            >
              The complete music solution for hotels, cafés, restaurants and retail. Legal, expertly curated, and designed to set the perfect atmosphere.
            </p>

            <div data-ll-reveal data-ll-delay="2" style={{ marginTop: 38, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href="#pricing"
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
                Try it free <ArrowIcon />
              </a>
              <a
                href="#music"
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
                <PlayIcon /> See it in action
              </a>
            </div>

            <p data-ll-reveal data-ll-delay="3" style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 13.5, color: "var(--ll-on-ink-3)" }}>
              <CheckIcon /> 14-day free trial · No credit card required
            </p>
          </div>

          {/* Visual */}
          <div data-ll-reveal data-ll-delay="1" style={{ position: "relative" }} className="hero-visual">
            {/* Orb */}
            <div
              ref={orbRef}
              style={{
                position: "absolute", top: 30, right: -18, zIndex: 1,
                width: 96, height: 96, borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, rgba(78,205,196,.5), rgba(78,205,196,.05))",
                border: "1px solid rgba(255,255,255,.14)",
                backdropFilter: "blur(8px)",
                display: "grid", placeItems: "center",
                animation: "ll-float 5s ease-in-out infinite",
                transition: "transform .35s var(--ll-ease)",
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--ll-accent)", boxShadow: "0 0 22px 4px rgba(78,205,196,.7)" }} />
            </div>

            {/* Card */}
            <div
              ref={cardRef}
              style={{
                borderRadius: 30,
                overflow: "hidden",
                transform: "rotate(2.5deg)",
                boxShadow: "0 50px 90px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.07)",
                transition: "transform .6s var(--ll-ease)",
                cursor: "pointer",
              }}
            >
              <Image
                src="/images/Playlist mockup 1.2.jpg"
                alt="Lobby & Lounge playlist dashboard"
                width={600}
                height={600}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
                priority
              />
            </div>

            {/* Now-playing chip */}
            <div
              ref={chipRef}
              style={{
                position: "absolute", left: -26, bottom: 44, zIndex: 3,
                display: "flex", alignItems: "center", gap: 13,
                padding: "13px 17px 13px 13px",
                background: "rgba(15,20,25,.72)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 16,
                boxShadow: "0 24px 50px -18px rgba(0,0,0,.6)",
                transition: "transform .35s var(--ll-ease)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "var(--ll-grad-product)",
                display: "grid", placeItems: "center",
                color: "var(--ll-accent-ink)", flexShrink: 0,
              }}>
                <MusicIcon />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {/* EQ animation */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 18 }} aria-hidden>
                  {[
                    { h: "40%", delay: "-.2s" },
                    { h: "90%", delay: "-.5s" },
                    { h: "60%", delay: "-.1s" },
                    { h: "100%", delay: "-.7s" },
                  ].map((b, i) => (
                    <span key={i} style={{
                      width: 3, height: b.h, background: "var(--ll-accent)", borderRadius: 2,
                      animation: `ll-eq 1.1s var(--ll-ease) infinite`,
                      animationDelay: b.delay,
                    }} />
                  ))}
                </div>
                <b style={{ display: "block", fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: "#fff", whiteSpace: "nowrap" }}>
                  Now playing · Lounge Vibes
                </b>
                <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 11.5, lineHeight: 1.2, color: "var(--ll-on-ink-3)" }}>
                  Zone 1 — Main floor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 64px !important; }
          .hero-visual { max-width: 440px; margin: 0 auto; }
          .hero-copy { text-align: center; }
        }
        .ll-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -8px rgba(78,205,196,.7) !important; }
        .ll-btn-primary::after {
          content: ""; position: absolute; top: 0; left: -130%;
          width: 55%; height: 100%; transform: skewX(-18deg);
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.38), transparent);
          pointer-events: none;
        }
        .ll-btn-primary:hover::after { animation: ll-btn-shine .85s var(--ll-ease); }
        .ll-btn-ghost:hover { border-color: var(--ll-accent) !important; color: var(--ll-accent) !important; transform: translateY(-2px); }
      `}</style>
    </section>
  );
};
