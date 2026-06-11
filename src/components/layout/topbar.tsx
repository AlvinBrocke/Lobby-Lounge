"use client";

import { useUser } from "@clerk/nextjs";
import { Bell, Calendar, Search } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar() {
  const [greeting, setGreeting] = useState("Good evening");
  const [dateline, setDateline] = useState("");
  const { user } = useUser();
  const userName = user?.firstName ?? user?.fullName ?? "there";

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    );
    setDateline(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <header className="flex items-center gap-4 px-7 py-[18px] border-b border-border bg-card shrink-0">
      <div className="shrink-0">
        <div
          className="font-bold text-base text-foreground"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {greeting}, {userName}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{dateline}</div>
      </div>

      <div className="flex-1 max-w-[340px] mx-auto relative rounded-full border border-border bg-secondary flex items-center focus-within:ring-2 focus-within:ring-primary/50 transition-shadow">
        <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          className="w-full bg-transparent border-none outline-none py-2 pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground"
          placeholder="Search channels, tracks, moods…"
        />
      </div>

      <div className="flex gap-2">
        <button className="w-9 h-9 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors">
          <Calendar className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
