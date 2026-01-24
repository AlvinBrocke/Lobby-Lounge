"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navigation = () => {
  const pathname = usePathname();

  // Helper to determine if we are on an auth page to potentially adjust styling if needed
  // For now, keeping it same as landing page transparent header

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-tunify-dark/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/L&L White Logo.png"
              alt="Lobby & Lounge Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
            >
              Case Studies
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/signin"
              className="text-sm font-bold text-white hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 text-sm font-bold text-tunify-dark bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
