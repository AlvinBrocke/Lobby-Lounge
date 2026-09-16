"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// Every link here resolves to a real page. Product links were dropped — the
// top nav already anchors to those sections — and social icons will come
// back once the accounts exist.
const footerCols = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help centre", href: "/help" },
      { label: "Licensing", href: "/licensing" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export const Footer = () => {
  return (
    <footer style={{ background: "var(--ll-ink-0)", color: "var(--ll-on-ink-2)", padding: "80px 0 36px", borderTop: "1px solid var(--ll-ink-line)" }}>
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, paddingBottom: 56, borderBottom: "1px solid var(--ll-ink-line)" }} className="foot-top">

          {/* Brand col */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Image
                src="/images/L&L White Logo.png"
                alt="Lobby & Lounge"
                width={140}
                height={26}
                style={{ height: 26, width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p style={{ margin: "18px 0 0", maxWidth: 300, fontFamily: "var(--ll-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--ll-on-ink-3)" }}>
              Fully licensed background music for hospitality, in your browser. Set the right atmosphere for every part of the day.
            </p>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".14em", color: "var(--ll-on-ink-3)", marginBottom: 20 }}>
                {col.title}
              </h4>
              {col.links.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{ display: "block", fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 14.5, color: "var(--ll-on-ink-2)", marginBottom: 14, transition: "color .2s, padding-left .2s" }}
                  className="ll-foot-link"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap", paddingTop: 28, fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 13, color: "var(--ll-on-ink-3)" }}>
          <span>© 2026 Lobby &amp; Lounge. All rights reserved.</span>
          <span style={{ display: "flex", gap: 22 }}>
            {legalLinks.map(({ label, href }) => (
              <Link key={label} href={href} style={{ color: "var(--ll-on-ink-3)", transition: "color .2s" }} className="ll-foot-bot-link">
                {label}
              </Link>
            ))}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) { .foot-top { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .foot-top { grid-template-columns: 1fr !important; gap: 32px !important; } }
        .ll-foot-link:hover { color: var(--ll-accent) !important; padding-left: 5px !important; }
        .ll-foot-bot-link:hover { color: var(--ll-on-ink-2) !important; }
      `}</style>
    </footer>
  );
};
