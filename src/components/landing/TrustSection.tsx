"use client";

import React from "react";
import Image from "next/image";

export const TrustSection = () => {
  return (
    <section className="py-24 bg-[#E0E7FF] text-tunify-dark overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 text-tunify-dark">
          Sound great
        </h2>
        <p className="text-xl max-w-2xl">
          Choose from hundreds of soundtracks updated weekly, or let our AI
          curate the perfect mix for your brand.
        </p>
      </div>

      <div className="relative w-full h-[60vh] md:h-[80vh] w-full">
        <div className="absolute inset-0 w-[120%] -ml-[10%]">
          <Image
            src="/images/Playlists montage 1.3(1).png"
            alt="Music Categories"
            fill
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex justify-start">
        <button className="bg-tunify-dark text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-black transition-colors">
          View all genres
        </button>
      </div>
    </section>
  );
};
