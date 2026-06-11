"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerBar } from "./player-bar";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar />
          <ScrollArea className="flex-1 h-full w-full">
            <div className="p-6 md:p-7 max-w-[1600px] mx-auto w-full pb-8">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>

      <div className="h-[72px] shrink-0 bg-card border-t border-border z-50">
        <PlayerBar />
      </div>
    </div>
  );
}
