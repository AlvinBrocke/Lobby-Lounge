import React from "react";
import { Metadata } from "next";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: { template: "%s · Lobby & Lounge", default: "Legal · Lobby & Lounge" },
};

/*
 * Public shell for /privacy, /terms and /cookies. Reuses the landing-page
 * Navigation (fixed, 76px tall, white text) and Footer, so the page body gets
 * the same dark background and a top offset for the fixed header.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--ll-font-body)", background: "var(--ll-ink-1)", color: "#fff", minHeight: "100vh" }}>
      <Navigation />
      <main style={{ paddingTop: 76 }}>{children}</main>
      <Footer />
    </div>
  );
}
