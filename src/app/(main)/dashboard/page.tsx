"use client";

import React, { useState, useEffect } from "react";
import { Play, Music2, Users, Radio, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Card as UICard,
  CardContent as UICardContent,
} from "@/components/ui/card";
import usePlayerStore from "@/store/usePlayerStore";

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good day");
  const { setCurrentTrack } = usePlayerStore();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const quickStart = [
    { id: "1", title: "Lounge Signature", color: "bg-indigo-900/40" },
    { id: "2", title: "Deep Focus", color: "bg-emerald-900/40" },
    { id: "3", title: "Retail Energy", color: "bg-rose-900/40" },
    { id: "4", title: "Jazz for Business", color: "bg-amber-900/40" },
    { id: "5", title: "Global Beats", color: "bg-blue-900/40" },
    { id: "6", title: "Classical Morning", color: "bg-teal-900/40" },
  ];

  const categories = [
    {
      title: "Recommended for your venue",
      items: [
        {
          id: "r1",
          name: "Smooth Jazz",
          desc: "Perfect for morning vibes",
          img: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
        },
        {
          id: "r2",
          name: "Upbeat Pop",
          desc: "Energy for peak hours",
          img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        },
        {
          id: "r3",
          name: "Ambient Chill",
          desc: "Reduce noise, increase focus",
          img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
        },
        {
          id: "r4",
          name: "Modern Indie",
          desc: "Trendsetting background music",
          img: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting & Quick Access */}
      <section>
        <h1 className="text-3xl font-bold mb-6 tracking-tight">{greeting}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickStart.map((item) => (
            <div
              key={item.id}
              className={`group relative flex items-center ${item.color} rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300 cursor-pointer pr-4 border border-white/5 hover:border-white/10 hover:translate-x-1`}
            >
              <div className="w-20 h-20 bg-black/20 flex items-center justify-center shadow-2xl">
                <Music2 className="text-white w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="flex-1 px-4 font-bold truncate text-lg">
                {item.title}
              </span>
              <Button
                size="icon"
                className="opacity-0 group-hover:opacity-100 bg-[#27e0c5] hover:bg-[#27e0c5] text-black rounded-full shadow-2xl transition-all duration-300 scale-90 group-hover:scale-100 hover:scale-110"
              >
                <Play className="fill-current w-5 h-5 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics Section (B2B Focus) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UICard className="bg-[#181818]/60 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-[#181818]/80 transition-colors shadow-xl">
          <UICardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-indigo-500/10 rounded-2xl">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Total Players
              </p>
              <p className="text-2xl font-bold text-white">12 Active</p>
            </div>
          </UICardContent>
        </UICard>
        <UICard className="bg-[#181818]/60 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-[#181818]/80 transition-colors shadow-xl">
          <UICardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-emerald-500/10 rounded-2xl">
              <Radio className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Current Stream
              </p>
              <p className="text-2xl font-bold text-white">HQ 320kbps</p>
            </div>
          </UICardContent>
        </UICard>
        <UICard className="bg-[#181818]/60 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-[#181818]/80 transition-colors shadow-xl">
          <UICardContent className="p-6 flex items-center space-x-4">
            <div className="p-4 bg-amber-500/10 rounded-2xl">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Next Update
              </p>
              <p className="text-2xl font-bold text-white">18:00 (Dinner)</p>
            </div>
          </UICardContent>
        </UICard>
      </section>

      {/* Recommended Grids */}
      {categories.map((cat) => (
        <section key={cat.title}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer tracking-tight">
              {cat.title}
            </h2>
            <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {cat.items.map((item) => (
              <div
                key={item.id}
                className="bg-[#181818]/40 hover:bg-[#282828] p-4 rounded-xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/5 shadow-lg hover:shadow-2xl"
              >
                <div className="relative mb-4 aspect-square rounded-lg overflow-hidden shadow-lg border border-white/5">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-300">
                    <Button
                      size="icon"
                      className="bg-[#27e0c5] hover:bg-[#27e0c5] hover:scale-110 text-black rounded-full shadow-2xl w-12 h-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTrack({
                          id: item.id,
                          name: item.name,
                          image: item.img,
                          audioUrl: "",
                        });
                      }}
                    >
                      <Play className="fill-current w-6 h-6 ml-1" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold mb-1 truncate text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-[#b3b3b3] line-clamp-2">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
