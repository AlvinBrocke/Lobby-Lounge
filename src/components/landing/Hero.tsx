"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-tunify-dark text-white pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-tunify-dark via-tunify-dark-blue to-black opacity-100 z-0" />

      {/* Background Wave Texture */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none mix-blend-overlay z-0">
        <Image
          src="/images/LL soundwave3.png"
          alt="Soundwave"
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="font-display text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.9] text-white">
              Music <br />
              for your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-primary-500">
                Business
              </span>
            </h1>

            <p className="font-sans text-xl lg:text-2xl text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The world's most complete music solution for brands. Legal,
              curated, and designed to drive sales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-tunify-dark bg-secondary rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-primary/20"
              >
                Try it free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none lg:ml-auto">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/10">
                <Image
                  src="/images/Playlist mockup 1.2.jpg"
                  alt="Lobby & Lounge Interface"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Element */}
              <div className="absolute bottom-10 -left-10 w-24 h-24 bg-primary/20 backdrop-blur-xl border border-white/10 rounded-full hidden lg:flex items-center justify-center shadow-lg animate-bounce duration-[3000ms]">
                <div className="w-4 h-4 bg-primary rounded-full box-shadow-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
