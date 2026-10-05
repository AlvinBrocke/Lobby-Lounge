import React from "react";
import { Metadata } from "next";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // Resolves relative Open Graph image paths (blog covers) to absolute URLs.
  metadataBase: new URL(SITE_URL),
  title: { template: "%s · Lobby & Lounge", default: "Lobby & Lounge" },
};

/*
 * Public shell for /blog and /help — same as the (legal) group: landing-page
 * Navigation (fixed, 76px tall) and Footer around a dark page body. Neither
 * route is listed in src/proxy.ts, so they're readable signed out.
 */
export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--ll-font-body)", background: "var(--ll-ink-1)", color: "#fff", minHeight: "100vh" }}>
      <Navigation />
      <main style={{ paddingTop: 76 }}>{children}</main>
      <Footer />
    </div>
  );
}
