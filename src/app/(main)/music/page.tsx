"use client";

import React from "react";
import { Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const genreCards = [
  { name: "Jazz", color: "bg-[#e8115b]" },
  { name: "Lounge", color: "bg-[#8d67ab]" },
  { name: "Focus", color: "bg-[#1e3264]" },
  { name: "Retail", color: "bg-[#006450]" },
  { name: "Hip-Hop", color: "bg-[#bc5906]" },
  { name: "Pop", color: "bg-[#056952]" },
  { name: "Classical", color: "bg-[#608108]" },
  { name: "Indie", color: "bg-[#e91429]" },
  { name: "Electronic", color: "bg-[#777777]" },
  { name: "R&B", color: "bg-[#dc5ebd]" },
  { name: "Reggae", color: "bg-[#27856a]" },
  { name: "Blues", color: "bg-[#1e3264]" },
];

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 py-4 bg-gradient-to-b from-[#121212] to-transparent">
        <div className="relative max-w-md group/search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within/search:text-white transition-colors" />
          <Input
            placeholder="Search for music, mood, or genre..."
            className="pl-12 bg-white/5 border-white/5 hover:bg-white/10 rounded-2xl h-14 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-white/20 transition-all duration-300 shadow-xl"
          />
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">Browse all</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {genreCards.map((genre) => (
            <div
              key={genre.name}
              className={`${genre.color} aspect-square rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border border-white/5`}
            >
              <h3 className="text-2xl font-bold text-white break-words w-2/3 tracking-tight">
                {genre.name}
              </h3>
              {/* Angle image effect like Spotify */}
              <div className="absolute -bottom-4 -right-6 w-24 h-24 bg-white/20 rotate-[25deg] group-hover:rotate-[20deg] group-hover:scale-125 transition-transform duration-500 shadow-2xl" />
            </div>
          ))}
        </div>
      </section>

      <section className="pt-8">
        <h2 className="text-2xl font-bold mb-4">Business Curations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#181818]/60 backdrop-blur-sm border border-white/5 group cursor-pointer hover:bg-[#282828]/80 transition-all duration-300 rounded-2xl shadow-xl hover:translate-y-[-2px]">
            <CardContent className="p-6 flex space-x-6">
              <div className="w-28 h-28 shrink-0 bg-primary-900 rounded-xl rounded-tr-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <Play className="text-white fill-current w-10 h-10 drop-shadow-lg" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-2">
                <h4 className="font-bold text-xl text-white tracking-tight">
                  Sunday Brunch Mix
                </h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Light, airy, and sophisticated beats for your morning crowd.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#181818]/60 backdrop-blur-sm border border-white/5 group cursor-pointer hover:bg-[#282828]/80 transition-all duration-300 rounded-2xl shadow-xl hover:translate-y-[-2px]">
            <CardContent className="p-6 flex space-x-6">
              <div className="w-28 h-28 shrink-0 bg-emerald-900 rounded-xl rounded-tr-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <Play className="text-white fill-current w-10 h-10 drop-shadow-lg" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-2">
                <h4 className="font-bold text-xl text-white tracking-tight">
                  Afternoon Productivity
                </h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Keep the energy high with consistent, non-distracting tracks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
