"use client";

import React from "react";
import { BarChart3, Clock, Zap } from "lucide-react";

export const StatsSection = () => {
  return (
    <section className="py-24 bg-surface text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-semibold">
                    Weekly Productivity
                  </p>
                  <p className="text-2xl font-bold text-white">+24%</p>
                </div>
              </div>
              {/* Abstract Graph */}
              <div className="flex items-end gap-2 h-48">
                <div className="w-1/6 bg-white/5 rounded-t-lg h-[40%]"></div>
                <div className="w-1/6 bg-white/5 rounded-t-lg h-[60%]"></div>
                <div className="w-1/6 bg-primary/20 rounded-t-lg h-[50%]"></div>
                <div className="w-1/6 bg-primary/40 rounded-t-lg h-[75%]"></div>
                <div className="w-1/6 bg-primary/80 rounded-t-lg h-[90%]"></div>
                <div className="w-1/6 bg-primary rounded-t-lg h-[85%]"></div>
              </div>
            </div>

            {/* Floating Stat */}
            <div className="absolute -top-6 -right-6 bg-surface p-4 rounded-2xl shadow-lg border border-white/10 max-w-[160px]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-gray-400">
                  Time Saved
                </span>
              </div>
              <p className="text-lg font-bold text-white">3h / week</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 text-white">
              Save time
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Stop manually curating playlists. Our automation tools allow you
              to set the perfect schedule for the entire year in minutes.
            </p>
            <ul className="space-y-4 mb-8 text-gray-300">
              <li className="flex items-center gap-3 font-medium">
                <Zap className="h-5 w-5 text-primary" />
                <span>AI-powered music selection</span>
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Zap className="h-5 w-5 text-primary" />
                <span>Multi-location sync</span>
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Zap className="h-5 w-5 text-primary" />
                <span>Remote management</span>
              </li>
            </ul>
            <button className="bg-white text-tunify-dark px-6 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-colors">
              See how it works
            </button>
          </div>
        </div>

        <div className="mt-32 text-center">
          <h3 className="font-display text-7xl lg:text-9xl font-bold text-white tracking-tighter mb-4">
            71%
          </h3>
          <p className="text-xl lg:text-2xl font-medium max-w-2xl mx-auto text-gray-300">
            of businesses find that music helps employees start conversations
            with customers.
          </p>
          <p className="text-sm text-primary mt-4 uppercase tracking-widest font-bold">
            Lobby & Lounge Research 2025
          </p>
        </div>
      </div>
    </section>
  );
};
