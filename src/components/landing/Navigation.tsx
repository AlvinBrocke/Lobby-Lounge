"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const Navigation = () => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: 100,
        transition: "background .3s, border-color .3s, backdrop-filter .3s",
        borderBottom: stuck ? "1px solid #232c36" : "1px solid transparent",
        background: stuck
          ? "color-mix(in oklab, #0A0E12 78%, transparent)"
          : "transparent",
        backdropFilter: stuck ? "blur(16px) saturate(1.2)" : "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 76,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, transition: "transform .3s", flexShrink: 0 }}>
          <Image
            src="/images/L&L White Logo.png"
            alt="Lobby & Lounge"
            width={160}
            height={30}
            style={{ height: 30, width: "auto", objectFit: "contain", display: "block" }}
            priority
          />
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 36 }} className="hidden md:flex">
          {["#music", "#control", "#results", "#pricing"].map((href, i) => {
            const labels = ["Music", "Control", "Results", "Pricing"];
            return (
              <a
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--ll-font-body)",
                  fontWeight: 600,
                  fontSize: 14.5,
                  color: "rgba(255,255,255,.82)",
                  position: "relative",
                  paddingBottom: 7,
                  transition: "color .2s",
                }}
                className="ll-nav-link"
              >
                {labels[i]}
              </a>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link
            href="/signin"
            style={{
              fontFamily: "var(--ll-font-body)",
              fontWeight: 600,
              fontSize: 14.5,
              color: "rgba(255,255,255,.9)",
              whiteSpace: "nowrap",
            }}
            className="hidden sm:block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--ll-font-body)",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 20px",
              borderRadius: 999,
              background: "var(--ll-accent)",
              color: "var(--ll-accent-ink)",
              boxShadow: "0 12px 30px -8px rgba(78,205,196,.6)",
              transition: "transform .25s, box-shadow .25s",
              whiteSpace: "nowrap",
            }}
          >
            Try it free
          </Link>
        </div>
      </div>

      <style>{`
        .ll-nav-link::after {
          content: "";
          position: absolute;
          left: 0; right: 100%; bottom: 0;
          height: 2px; border-radius: 2px;
          background: var(--ll-accent);
          transition: right .3s var(--ll-ease);
        }
        .ll-nav-link:hover::after { right: 0; }
        .ll-nav-link:hover { color: #fff !important; }
      `}</style>
    </header>
  );
};
