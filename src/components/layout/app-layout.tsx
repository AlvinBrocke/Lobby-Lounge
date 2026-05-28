"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerBar } from "./player-bar";
import { Sidebar } from "./sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Flush left */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background relative z-0">
          <ScrollArea className="flex-1 h-full w-full">
            <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full pb-32">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Fixed Player Bar (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 h-[88px] z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 shadow-2xl">
        <PlayerBar />
      </div>
    </div>
  );
}
