"use client";

import React from "react";
import Image from "next/image";

export const CallToAction = () => {
  return (
    <section className="py-24 bg-tunify-dark text-white relative overflow-hidden">
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="font-display text-4xl lg:text-5xl font-bold mb-12 text-center">
          Start playing
        </h2>

        {/* Hardware / Devices placeholder - styling to look like the reference minimal hardware shot */}
        <div className="relative w-full max-w-5xl mx-auto h-[300px] mb-12 rounded-3xl bg-surface shadow-2xl flex items-center justify-center overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-surface to-black" />

          <div className="relative z-10 flex gap-8 items-end">
            {/* Mockup generic devices */}
            <div className="w-24 h-24 bg-black/60 rounded-xl shadow-2xl skew-x-3 transform translate-y-4 border border-white/5"></div>
            <div className="w-40 h-32 bg-black/80 rounded-lg shadow-2xl -skew-x-2 z-20 border border-white/5"></div>
            <div className="w-16 h-40 bg-black/60 rounded-2xl shadow-2xl skew-x-1 border border-white/5"></div>
          </div>
          <p className="absolute bottom-4 text-gray-500 text-xs tracking-widest uppercase">
            Hardware Compatible
          </p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xl mb-8 text-center max-w-xl text-gray-400">
            Compatible with Sonos, Axis, and all major professional audio
            hardware. Or just use our simple app.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-tunify-dark bg-primary rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-primary/20"
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
