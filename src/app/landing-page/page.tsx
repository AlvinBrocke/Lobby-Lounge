"use client";

import React, { useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Navigation } from "@/components/landing/Navigation";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TrustSection } from "@/components/landing/TrustSection";
import { ControlSection } from "@/components/landing/ControlSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";
import { CatalogBand } from "@/components/landing/CatalogBand";
import { PricingSection } from "@/components/landing/PricingSection";

export default function LandingPage() {
  // Mark <html> so reveal CSS activates, and run scroll-reveal + progress bar
  useEffect(() => {
    document.documentElement.classList.add("ll-js");

    const progEl = document.getElementById("ll-prog");

    const onScroll = () => {
      // Scroll progress bar
      if (progEl) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progEl.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
      }

      // Scroll-reveal
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-ll-reveal]:not(.ll-visible), .ll-bars:not(.ll-visible)").forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.9) {
          el.classList.add("ll-visible");
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Failsafe: ensure nothing stays hidden after 2.5s
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-ll-reveal], .ll-bars").forEach((el) => {
        el.classList.add("ll-visible");
      });
    }, 2500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t);
      document.documentElement.classList.remove("ll-js");
    };
  }, []);

  return (
    <div style={{ fontFamily: "var(--ll-font-body)", background: "var(--ll-ink-1)", color: "#fff", overflowX: "hidden" }}>
      {/* Scroll progress bar */}
      <div
        id="ll-prog"
        style={{
          position: "fixed", top: 0, left: 0, height: 2, width: 0, zIndex: 101,
          background: "linear-gradient(120deg, #4ECDC4 0%, #44A08D 100%)",
          boxShadow: "0 0 12px rgba(78,205,196,.8)",
          transition: "width .12s linear",
          pointerEvents: "none",
        }}
      />

      <Navigation />

      <main>
        <Hero />
        <TrustSection />
        <FeatureGrid />
        <CatalogBand />
        <ControlSection />
        <StatsSection />
        <PricingSection />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
