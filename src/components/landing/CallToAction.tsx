"use client";

import React from "react";
import Image from "next/image";

export const CallToAction = () => {
  return (
    <section className="py-24 bg-[#E0E7FF] text-tunify-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl lg:text-5xl font-bold mb-12 text-center">
          Start playing
        </h2>

        {/* Hardware / Devices placeholder - styling to look like the reference minimal hardware shot */}
        <div className="relative w-full max-w-5xl mx-auto h-[300px] mb-12 rounded-3xl bg-white shadow-xl flex items-center justify-center overflow-hidden border border-white">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100" />

          <div className="relative z-10 flex gap-8 items-end">
            {/* Mockup generic devices */}
            <div className="w-24 h-24 bg-[#1A1F26] rounded-xl shadow-2xl skew-x-3 transform translate-y-4"></div>
            <div className="w-40 h-32 bg-[#2d343f] rounded-lg shadow-2xl -skew-x-2 z-20"></div>
            <div className="w-16 h-40 bg-[#1A1F26] rounded-2xl shadow-2xl skew-x-1"></div>
          </div>
          <p className="absolute bottom-4 text-gray-400 text-xs tracking-widest uppercase">
            Hardware Compatible
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xl mb-8 text-center max-w-xl text-gray-600">
            Compatible with Sonos, Axis, and all major professional audio
            hardware. Or just use our simple app.
          </p>
          <a
            href="/account/signup"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-[#EB3349] rounded-full hover:bg-[#D62839] transition-all transform hover:scale-105 shadow-xl shadow-red-500/20"
          >
            Sign up now
          </a>
          <p className="mt-4 text-sm text-gray-500">
            14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
