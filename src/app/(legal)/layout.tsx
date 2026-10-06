import React from "react";
import { Metadata } from "next";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: { template: "%s · Lobby & Lounge", default: "Legal · Lobby & Lounge" },
};

/*
 * Public shell for /privacy, /terms and /cookies. Reuses the landing-page
 * Navigation (fixed, 68px tall) and Footer, so the page body gets
 * the same dark background and a top offset for the fixed header.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ll-light min-h-[100dvh]">
      <Navigation />
      <main style={{ paddingTop: 68 }}>{children}</main>
      <Footer />
    </div>
  );
}
