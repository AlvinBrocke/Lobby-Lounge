"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { PlayerBar } from "./player-bar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-background p-4 gap-4 overflow-hidden">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#121212] to-black rounded-2xl border border-white/5 shadow-2xl relative">
          <ScrollArea className="flex-1 p-8">{children}</ScrollArea>
        </main>
      </div>

      {/* Persistent Player Bar */}
      <div className="h-24 flex-shrink-0 bg-[#181818]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <PlayerBar />
      </div>
    </div>
  );
}
