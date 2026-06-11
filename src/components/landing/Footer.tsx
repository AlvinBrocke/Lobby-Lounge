"use client";

import React from "react";
import Image from "next/image";

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}>
    <path d="M22 5.8a8.3 8.3 0 0 1-2.36.65A4.13 4.13 0 0 0 21.45 4a8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.64 11.64 0 0 1 3.4 4.5a4.1 4.1 0 0 0 1.27 5.48A4 4 0 0 1 2.8 9.5v.05a4.1 4.1 0 0 0 3.3 4 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.1a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.67-6.25 11.67-11.67v-.53A8.3 8.3 0 0 0 22 5.8z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 17, height: 17 }}>
    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 17, height: 17 }}>
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3 0-2.95-1.8-2.95s-2.08 1.4-2.08 2.85V21h-4z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
  </svg>
);

const footerCols = [
  {
    title: "Product",
    links: [
      { label: "Music catalog", href: "#music" },
      { label: "Control", href: "#control" },
      { label: "Pricing", href: "#pricing" },
      { label: "Hardware", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Research", href: "#results" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Licensing", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer style={{ background: "var(--ll-ink-0)", color: "var(--ll-on-ink-2)", padding: "80px 0 36px", borderTop: "1px solid var(--ll-ink-line)" }}>
      <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(3, 1fr)", gap: 40, paddingBottom: 56, borderBottom: "1px solid var(--ll-ink-line)" }} className="foot-top">

          {/* Brand col */}
          <div>
            <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Image
                src="/images/L&L White Logo.png"
                alt="Lobby & Lounge"
                width={140}
                height={26}
                style={{ height: 26, width: "auto", objectFit: "contain" }}
              />
            </a>
            <p style={{ margin: "18px 0 22px", maxWidth: 280, fontFamily: "var(--ll-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--ll-on-ink-3)" }}>
              Fully licensed, expertly curated background music for hospitality. Set the perfect atmosphere across every space.
            </p>
            <div style={{ display: "flex", gap: 11 }}>
              {[
                { label: "Twitter", icon: <TwitterIcon /> },
                { label: "Instagram", icon: <InstagramIcon /> },
                { label: "LinkedIn", icon: <LinkedInIcon /> },
                { label: "Email", icon: <MailIcon /> },
              ].map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    display: "grid", placeItems: "center",
                    border: "1px solid var(--ll-ink-line)",
                    color: "var(--ll-on-ink-2)",
                    transition: "all .25s",
                  }}
                  className="ll-social-link"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" as const, letterSpacing: ".14em", color: "var(--ll-on-ink-3)", marginBottom: 20 }}>
                {col.title}
              </h4>
              {col.links.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  style={{ display: "block", fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 14.5, color: "var(--ll-on-ink-2)", marginBottom: 14, transition: "color .2s, padding-left .2s" }}
                  className="ll-foot-link"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap", paddingTop: 28, fontFamily: "var(--ll-font-body)", fontWeight: 500, fontSize: 13, color: "var(--ll-on-ink-3)" }}>
          <span>© 2026 Lobby &amp; Lounge. All rights reserved.</span>
          <span style={{ display: "flex", gap: 22 }}>
            <a href="#" style={{ color: "var(--ll-on-ink-3)", transition: "color .2s" }} className="ll-foot-bot-link">Privacy</a>
            <a href="#" style={{ color: "var(--ll-on-ink-3)", transition: "color .2s" }} className="ll-foot-bot-link">Terms</a>
            <a href="#" style={{ color: "var(--ll-on-ink-3)", transition: "color .2s" }} className="ll-foot-bot-link">Cookies</a>
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) { .foot-top { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .foot-top { grid-template-columns: 1fr !important; gap: 32px !important; } }
        .ll-social-link:hover { color: var(--ll-accent-ink) !important; background: var(--ll-accent); border-color: var(--ll-accent) !important; transform: translateY(-3px); }
        .ll-foot-link:hover { color: var(--ll-accent) !important; padding-left: 5px !important; }
        .ll-foot-bot-link:hover { color: var(--ll-on-ink-2) !important; }
      `}</style>
    </footer>
  );
};
