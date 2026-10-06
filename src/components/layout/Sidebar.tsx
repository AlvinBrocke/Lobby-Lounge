"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Calendar, List, ListMusic, Settings } from "lucide-react";
import { EqBars } from "@/components/player/EqBars";
import { cn, formatDuration } from "@/lib/utils";
import usePlayerStore from "@/store/usePlayerStore";

const navItems = [
  { name: "Library", href: "/library", icon: Book },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Playlists", href: "/playlists", icon: List },
  { name: "Settings", href: "/settings", icon: Settings },
];

/** Shared look for the two stacked panels (nav + queue). */
const panel =
  "rounded-[10px] border border-white/5 bg-card shadow-[0_2px_12px_rgba(0,0,0,0.35)]";

function Cover({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={cn("overflow-hidden shrink-0 bg-secondary", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ListMusic className="w-3.5 h-3.5 text-primary/70" />
        </div>
      )}
    </div>
  );
}

function UpNext() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queue = usePlayerStore((s) => s.queue);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  // Index of the row being dragged. HTML5 drag-and-drop gives us the drop
  // target; we remember the source ourselves rather than parsing dataTransfer.
  const [dragged, setDragged] = useState<number | null>(null);

  return (
    <div className={cn(panel, "flex-1 min-h-0 flex flex-col px-2.5 py-3")}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-faint">Up Next</span>
        <ListMusic className="w-[15px] h-[15px] text-primary" />
      </div>

      {currentTrack ? (
        <div className="flex items-center gap-2 mb-2.5 px-2 py-[7px] rounded-[7px] bg-primary/10 border border-primary/[0.12]">
          <div className="relative">
            <Cover src={currentTrack.image} alt="" className="w-[34px] h-[34px] rounded" />
            {isPlaying && (
              <div className="absolute inset-0 rounded bg-black/50 flex items-center justify-center">
                <EqBars />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-primary truncate">{currentTrack.name}</div>
            {currentTrack.artist && (
              <div className="text-[10px] text-muted-foreground truncate">{currentTrack.artist}</div>
            )}
          </div>
          <span className="text-[8px] font-bold text-primary bg-primary/[0.12] rounded-[3px] px-[5px] py-px shrink-0">
            NOW
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
          Nothing playing. Pick a playlist and its tracks will line up here.
        </p>
      )}

      <ol className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-0.5">
        {queue.map((track, i) => (
          <li
            key={`${track.id}-${i}`}
            draggable
            onDragStart={(e) => {
              setDragged(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragged !== null) reorderQueue(dragged, i);
              setDragged(null);
            }}
            onDragEnd={() => setDragged(null)}
            className={cn(
              "flex items-center gap-[7px] px-1.5 py-[5px] mb-[3px] rounded-md border-t border-transparent hover:bg-white/5 transition-colors",
              dragged === i ? "opacity-40 cursor-grabbing" : "cursor-grab",
              dragged !== null && dragged !== i && "border-primary/20",
            )}
          >
            <span aria-hidden className="w-2 text-[10px] leading-[0.65] text-faint shrink-0">
              ⠿
            </span>
            <Cover src={track.image} alt="" className="w-7 h-7 rounded-[3px]" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-foreground truncate">{track.name}</div>
              {track.artist && (
                <div className="text-[10px] text-faint truncate">{track.artist}</div>
              )}
            </div>
            {track.duration ? (
              <span className="text-[9px] font-mono text-faint shrink-0">
                {formatDuration(track.duration)}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[228px] shrink-0 z-[2] flex flex-col gap-2.5 px-2.5 py-3 bg-shell shadow-[4px_0_24px_rgba(0,0,0,0.45)] overflow-y-auto">
      <Link href="/playlists" className="h-[42px] shrink-0 flex items-center px-1">
        <Image
          src="/images/ll-logo-white.png"
          alt="Lobby & Lounge"
          width={81}
          height={34}
          priority
          className="object-contain"
        />
      </Link>

      <nav className={cn(panel, "shrink-0 flex flex-col gap-0.5 px-1.5 py-2")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          // Prefix match so /playlists/[id] keeps "Playlists" highlighted.
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[9px] rounded-md border-l-2 text-[13px] transition-colors",
                active
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:bg-primary/5",
              )}
            >
              <Icon
                className={cn("w-[18px] h-[18px]", active ? "text-primary" : "text-faint")}
                strokeWidth={1.6}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <UpNext />
    </aside>
  );
}
