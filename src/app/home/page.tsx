"use client";

import React, { useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Navigation } from "@/components/landing/Navigation";
import { LicensingSection } from "@/components/landing/LicensingSection";
import { ControlSection } from "@/components/landing/ControlSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";
import { CatalogBand } from "@/components/landing/CatalogBand";
import { PricingSection } from "@/components/landing/PricingSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { BusinessTypes } from "@/components/landing/BusinessTypes";

export default function LandingPage() {
  // Mark <html> so reveal CSS activates, and run scroll-reveal
  useEffect(() => {
    document.documentElement.classList.add("ll-js");

    const onScroll = () => {
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
    <div className="ll-light overflow-x-hidden">
      <Navigation />

      <main>
        <Hero />
        <TrustSection />
        <LicensingSection />
        <CatalogBand />
        <BusinessTypes />
        <ControlSection />
        <StatsSection />
        <PricingSection />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
