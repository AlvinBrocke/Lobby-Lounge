"use client";

import React from "react";
import Image from "next/image";

// Each montage tile is a 511×689 slice with the label baked in. The card inside
// sits at a different x-offset per slice, so `crop` records where it is
// (source px) and the tile is scaled/offset to show just the card.
const TILE = 270;
const tiles = [
  { src: "/images/montage-tile-0.jpg", label: "Day-Time", sub: "Morning & midday", crop: { left: 18, top: 91, size: 462 } },
  { src: "/images/montage-tile-1.jpg", label: "Happy Hour", sub: "Early evening", crop: { left: 55, top: 92, size: 455 } },
  { src: "/images/montage-tile-2.jpg", label: "Evening Rush", sub: "Dinner service", crop: { left: 22, top: 91, size: 459 } },
  { src: "/images/montage-tile-3.jpg", label: "Late-Night", sub: "After hours", crop: { left: 0, top: 93, size: 458 } },
  { src: "/images/montage-tile-4.jpg", label: "Weekly Rotation", sub: "Fresh every week", crop: { left: 0, top: 95, size: 454 } },
];
const SRC_W = 511;
const SRC_H = 689;

export const CatalogBand = () => {
  return (
    <section
      style={{
        background: "var(--ll-ink-0)",
        color: "#fff",
        padding: "96px 0 0",
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
            A fully licensed catalogue of 1,000+ tracks, refreshed every week and built for every part of the day.
          </p>
        </div>
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
                width: TILE,
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
                alt={i < tiles.length ? `${tile.label} — ${tile.sub}` : ""}
                width={SRC_W}
                height={SRC_H}
                style={{
                  position: "absolute",
                  width: SRC_W * (TILE / tile.crop.size),
                  height: SRC_H * (TILE / tile.crop.size),
                  left: -tile.crop.left * (TILE / tile.crop.size),
                  top: -tile.crop.top * (TILE / tile.crop.size),
                  maxWidth: "none",
                  transition: "transform .6s var(--ll-ease)",
                  display: "block",
                }}
                className="ll-tile-img"
              />
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
