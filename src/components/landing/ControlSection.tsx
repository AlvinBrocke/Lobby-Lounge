"use client";

import React from "react";
import Image from "next/image";

export const ControlSection = () => {
  return (
    <section className="py-24 bg-tunify-dark text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
          Take control
        </h2>
        <p className="text-xl max-w-2xl mb-12 text-gray-300">
          Schedule your music, plan announcements, and control every zone from a
          single dashboard. Use our web portal or dedicated tablet app.
        </p>

        <div className="relative w-full aspect-[16/9] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
          <Image
            src="/images/Playlist On Tablet mockup(1).jpg"
            alt="Control Dashboard on Tablet"
            fill
            className="object-cover opacity-90"
          />

          {/* Overlay UI Badge example */}
          <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white text-sm font-medium">
            Running v2.4.0
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="bg-primary text-tunify-dark px-6 py-2 rounded-full text-sm font-bold hover:bg-white transition-colors">
            Explore features
          </button>
        </div>
      </div>
    </section>
  );
};
