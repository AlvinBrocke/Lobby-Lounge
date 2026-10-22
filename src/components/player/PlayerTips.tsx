"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

// Each tip describes something the app already does; keep it that way.
const TIPS = [
  { title: "Bluetooth speakers", body: "Pair the speaker in your device's Bluetooth settings. The music plays through whatever output it's set to." },
  { title: "Cast or AirPlay", body: "Use the cast icon next to this one to send the music to a speaker on your network." },
  { title: "Media keys", body: "Keyboard media keys and headphone buttons play, pause and skip." },
  { title: "Love or block a song", body: "Open the full player. Blocked songs are skipped everywhere, for your whole team." },
  { title: "Fades & schedule", body: "Settings → Preferences sets the fade between songs and whether playlists follow your schedule." },
];

/** Lightbulb in the player bar: a short list of playback tips. */
export function PlayerTips() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Tips"
        aria-label="Player tips"
        aria-expanded={open}
        className={cn(
          "px-[7px] py-1.5 touch:p-3 rounded-md border transition-colors",
          open ? "bg-primary/10 border-primary/25 text-primary" : "border-transparent text-faint hover:text-foreground",
        )}
      >
        <Lightbulb className="w-[15px] h-[15px] touch:w-5 touch:h-5" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Player tips"
          className="absolute bottom-[calc(100%+10px)] right-0 w-72 p-3 rounded-[10px] bg-secondary border border-foreground/10 shadow-[0_-8px_28px_rgba(0,0,0,0.55)] z-50"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-primary mb-2">Tips</p>
          <ul className="space-y-2.5">
            {TIPS.map((t) => (
              <li key={t.title} className="text-xs">
                <span className="block font-semibold text-foreground">{t.title}</span>
                <span className="block text-[11px] text-muted-foreground mt-0.5">{t.body}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
