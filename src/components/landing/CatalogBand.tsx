import React from "react";
import Image from "next/image";

// Each montage tile is a 511×689 slice with the label baked in. The card inside
// sits at a different x-offset per slice, so `crop` records where it is
// (source px) and the tile is scaled/offset to show just the card.
const TILE = 240;
const tiles = [
  { src: "/images/montage-tile-0.jpg", label: "Day-Time", sub: "Morning & midday", crop: { left: 18, top: 91, size: 462 } },
  { src: "/images/montage-tile-1.jpg", label: "Happy Hour", sub: "Early evening", crop: { left: 55, top: 92, size: 455 } },
  { src: "/images/montage-tile-2.jpg", label: "Evening Rush", sub: "Dinner service", crop: { left: 22, top: 91, size: 459 } },
  { src: "/images/montage-tile-3.jpg", label: "Late-Night", sub: "After hours", crop: { left: 0, top: 93, size: 458 } },
  { src: "/images/montage-tile-4.jpg", label: "Weekly Rotation", sub: "Fresh every week", crop: { left: 0, top: 95, size: 454 } },
];
const SRC_W = 511;
const SRC_H = 689;

export const CatalogBand = () => (
  <section className="ll-catalog overflow-hidden border-t border-ll-line bg-ll-paper-2 pt-24 md:pt-28">
    <div data-ll-reveal className="ll-container mb-12 max-w-[1200px]">
      <p className="ll-eyebrow">The catalog</p>
      <h2 className="ll-h2 mt-3">Sound great, all day</h2>
      <p className="ll-lead mt-4">
        A fully licensed catalogue of 1,000+ tracks, refreshed every week and built for every part of the day.
      </p>
    </div>

    <div className="relative">
      {/* Fade edges */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--ll-paper-2)] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--ll-paper-2)] to-transparent" />

      {/* Set A + Set B for a seamless loop */}
      <div className="ll-track flex w-max gap-5 pb-24 md:pb-28" style={{ animation: "ll-marquee 60s linear infinite" }}>
        {[...tiles, ...tiles].map((tile, i) => (
          <div
            key={i}
            className="relative aspect-square shrink-0 overflow-hidden rounded-xl"
            style={{ width: TILE }}
            aria-hidden={i >= tiles.length}
          >
            <Image
              src={tile.src}
              alt={i < tiles.length ? `${tile.label} — ${tile.sub}` : ""}
              width={SRC_W}
              height={SRC_H}
              className="absolute block max-w-none"
              style={{
                width: SRC_W * (TILE / tile.crop.size),
                height: SRC_H * (TILE / tile.crop.size),
                left: -tile.crop.left * (TILE / tile.crop.size),
                top: -tile.crop.top * (TILE / tile.crop.size),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);
