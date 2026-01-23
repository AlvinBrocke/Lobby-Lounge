"use client";

import React from "react";
import { BarChart3, Clock, Zap } from "lucide-react";

export const StatsSection = () => {
  return (
    <section className="py-24 bg-[#E0E7FF] text-tunify-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-tunify-blue/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl text-tunify-blue">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold">
                    Weekly Productivity
                  </p>
                  <p className="text-2xl font-bold">+24%</p>
                </div>
              </div>
              {/* Abstract Graph */}
              <div className="flex items-end gap-2 h-48">
                <div className="w-1/6 bg-gray-100 rounded-t-lg h-[40%]"></div>
                <div className="w-1/6 bg-gray-100 rounded-t-lg h-[60%]"></div>
                <div className="w-1/6 bg-tunify-blue/40 rounded-t-lg h-[50%]"></div>
                <div className="w-1/6 bg-tunify-blue/60 rounded-t-lg h-[75%]"></div>
                <div className="w-1/6 bg-tunify-blue rounded-t-lg h-[90%]"></div>
                <div className="w-1/6 bg-tunify-dark rounded-t-lg h-[85%]"></div>
              </div>
            </div>

            {/* Floating Stat */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 max-w-[160px]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span className="text-xs font-bold text-gray-500">
                  Time Saved
                </span>
              </div>
              <p className="text-lg font-bold text-secondary">3h / week</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Save time
            </h2>
            <p className="text-xl mb-8">
              Stop manually curating playlists. Our automation tools allow you
              to set the perfect schedule for the entire year in minutes.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 font-medium">
                <Zap className="h-5 w-5 text-tunify-blue" />
                <span>AI-powered music selection</span>
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Zap className="h-5 w-5 text-tunify-blue" />
                <span>Multi-location sync</span>
              </li>
              <li className="flex items-center gap-3 font-medium">
                <Zap className="h-5 w-5 text-tunify-blue" />
                <span>Remote management</span>
              </li>
            </ul>
            <button className="bg-tunify-dark text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-black transition-colors">
              See how it works
            </button>
          </div>
        </div>

        <div className="mt-32 text-center">
          <h3 className="font-display text-7xl lg:text-9xl font-bold text-tunify-dark tracking-tighter mb-4">
            71%
          </h3>
          <p className="text-xl lg:text-2xl font-medium max-w-2xl mx-auto">
            of businesses find that music helps employees start conversations
            with customers.
          </p>
          <p className="text-sm text-gray-500 mt-4 uppercase tracking-widest font-bold">
            Lobby & Lounge Research 2025
          </p>
        </div>
      </div>
    </section>
  );
};
