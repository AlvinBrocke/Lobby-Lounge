"use client";

import React from "react";

export const FeatureGrid = () => {
  return (
    <section className="py-24 bg-surface text-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          <h2 className="font-display text-5xl lg:text-7xl font-bold mb-12 tracking-tight text-white leading-tight">
            Excellent <br />
            music for every <br />
            company
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div></div> {/* Spacer */}
            <div className="space-y-8">
              <p className="text-xl font-medium leading-relaxed text-gray-300">
                Lobby & Lounge gives you the power to control the atmosphere.
                With legal music for business, we help you create the perfect
                vibe for your customers and staff. Stop worrying about licensing
                and start building your brand sound.
              </p>

              <div className="flex gap-4">
                <button className="bg-white text-tunify-dark px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-colors">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats / Divider Strip */}
        <div className="mt-24 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              FDA
            </p>
            <div className="h-0.5 w-8 bg-white/20"></div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Licensed
            </p>
            <div className="h-0.5 w-8 bg-white/20"></div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Curated
            </p>
            <div className="h-0.5 w-8 bg-white/20"></div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              Global
            </p>
            <div className="h-0.5 w-8 bg-white/20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
