"use client";

import React from "react";
import { Hero } from "@/components/landing/Hero";
import { Navigation } from "@/components/landing/Navigation";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TrustSection } from "@/components/landing/TrustSection";
import { ControlSection } from "@/components/landing/ControlSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-tunify-dark font-sans">
      <Navigation />

      <main>
        <Hero />
        <FeatureGrid />
        <TrustSection />
        <ControlSection />
        <StatsSection />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
