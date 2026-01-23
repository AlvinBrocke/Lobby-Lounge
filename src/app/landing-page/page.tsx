"use client";

import React from "react";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { TrustSection } from "@/components/landing/TrustSection";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-tunify-dark">
      <header className="fixed top-0 left-0 right-0 z-50 bg-tunify-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-tunify-blue"></div>
              <span className="font-bold text-lg tracking-tight">
                Lobby & Lounge
              </span>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <a
                href="/account/signin"
                className="text-sm font-medium text-white hover:text-primary transition-colors"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="px-5 py-2.5 text-sm font-semibold text-tunify-dark bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <TrustSection />
        <FeatureGrid />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
