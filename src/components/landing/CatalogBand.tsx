"use client";

import React from "react";
import Image from "next/image";

const tiles = [
  { src: "/images/montage-tile-0.jpg", label: "Day-Time", sub: "Morning & midday" },
  { src: "/images/montage-tile-1.jpg", label: "Happy Hour", sub: "Early evening" },
  { src: "/images/montage-tile-2.jpg", label: "Evening Rush", sub: "Dinner service" },
  { src: "/images/montage-tile-3.jpg", label: "Late-Night", sub: "After hours" },
  { src: "/images/montage-tile-4.jpg", label: "Weekly Rotation", sub: "AI curated" },
];

export const CatalogBand = () => {
  return (
    <section
      style={{
        background: "var(--ll-ink-0)",
        color: "#fff",
        padding: "110px 0 0",
        overflow: "hidden",
        position: "relative",
      }}
      className="ll-catalog"
    >
      {/* Head */}
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 30, flexWrap: "wrap", marginBottom: 56 }}>
        <div data-ll-reveal style={{ maxWidth: 680 }}>
          <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".2em", color: "var(--ll-accent)", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
            The catalog
          </span>
          <h2 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px,5vw,60px)", fontWeight: 700, lineHeight: 1.02, margin: "18px 0 0", letterSpacing: "-.02em" }}>
            Sound great, all day
          </h2>
          <p style={{ marginTop: 18, maxWidth: 560, fontFamily: "var(--ll-font-body)", fontSize: "clamp(17px,2vw,20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
            Choose from hundreds of soundtracks updated weekly, or let our AI curate the perfect rotation for every part of the day.
          </p>
        </div>
        <a
          href="#"
          data-ll-reveal
          data-ll-delay="1"
          style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 15,
            padding: "16px 28px", borderRadius: 999,
            background: "transparent", color: "#fff",
            border: "1.5px solid rgba(255,255,255,.28)",
            transition: "transform .25s, border-color .25s, color .25s",
            whiteSpace: "nowrap" as const,
          }}
          className="ll-btn-ghost"
        >
          View all genres
        </a>
      </div>

      {/* Marquee band */}
      <div style={{ position: "relative" }}>
        {/* Fade edges */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 120, zIndex: 3, pointerEvents: "none", background: "linear-gradient(to right, var(--ll-ink-0), transparent)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 120, zIndex: 3, pointerEvents: "none", background: "linear-gradient(to left, var(--ll-ink-0), transparent)" }} />

        <div
          style={{ display: "flex", gap: 22, width: "max-content", animation: "ll-marquee 42s linear infinite", padding: "8px 0 70px" }}
          className="ll-track"
        >
          {/* Set A + Set B for seamless loop */}
          {[...tiles, ...tiles].map((tile, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: 270,
                flexShrink: 0,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.08)",
                boxShadow: "0 28px 50px -26px rgba(0,0,0,.7)",
                aspectRatio: "1/1",
                transition: "transform .4s, box-shadow .4s",
              }}
              className="ll-tile"
            >
              <Image
                src={tile.src}
                alt={i < tiles.length ? tile.label : ""}
                width={270}
                height={270}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s var(--ll-ease)", display: "block" }}
                className="ll-tile-img"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,12,16,.92) 8%, transparent 55%)" }} />
              {i < tiles.length && (
                <div style={{ position: "absolute", left: 18, right: 18, bottom: 16 }}>
                  <b style={{ display: "block", fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 19, lineHeight: 1.2, letterSpacing: "-.01em" }}>{tile.label}</b>
                  <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 12.5, lineHeight: 1, color: "rgba(255,255,255,.6)" }}>{tile.sub}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ll-tile:hover { transform: translateY(-10px) scale(1.015); box-shadow: 0 40px 64px -22px rgba(0,0,0,.85); }
        .ll-tile:hover .ll-tile-img { transform: scale(1.06); }
      `}</style>
    </section>
  );
};
