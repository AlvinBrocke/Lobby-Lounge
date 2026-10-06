"use client";

import Link from "next/link";
import { Loader2, Pause, Play } from "lucide-react";
import type { Energy } from "@convex/lib/energy";
import { EqBars } from "@/components/player/EqBars";
import { ENERGY_LABELS } from "@/lib/playlists";
import { cn, formatTotalDuration } from "@/lib/utils";
import { PlaylistCover } from "./PlaylistCover";

export interface PlaylistCardData {
  _id: string;
  name: string;
  category?: string;
  coverImage?: string;
  trackCount: number;
  totalDuration: number;
  energy: Energy;
}

const ENERGY_TONE: Record<Energy, string> = {
  low: "text-primary/80",
  mid: "text-muted-foreground",
  high: "text-destructive",
};

/**
 * A playlist in a carousel. The card opens the playlist; the round button
 * plays it. They're siblings (the button is positioned over the card) rather
 * than a button inside a link, which would be invalid HTML.
 */
export function PlaylistCard({
  playlist,
  active,
  playing,
  loading,
  onPlay,
}: {
  playlist: PlaylistCardData;
  /** This playlist is the one in the player. */
  active: boolean;
  /** …and the player isn't paused. */
  playing: boolean;
  loading: boolean;
  onPlay: () => void;
}) {
  const empty = playlist.trackCount === 0;
  const meta = [
    `${playlist.trackCount} track${playlist.trackCount !== 1 ? "s" : ""}`,
    playlist.totalDuration ? formatTotalDuration(playlist.totalDuration) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group relative w-[220px] min-w-[220px] snap-start">
      <Link
        href={`/playlists/${playlist._id}`}
        className={cn(
          "block overflow-hidden rounded-[11px] border bg-card transition-all duration-150",
          "shadow-[0_4px_14px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)]",
          active ? "border-primary/30" : "border-white/5",
        )}
      >
        <span className="relative block h-28 overflow-hidden bg-secondary">
          <PlaylistCover
            src={playlist.coverImage}
            alt=""
            className="w-full h-full opacity-90 transition-all duration-300 group-hover:opacity-70 group-hover:scale-[1.035]"
          />
          <span className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-background/80" />
          {active && (
            <span className="absolute top-[9px] left-[9px] flex items-center gap-[5px] px-[7px] py-1 rounded-full bg-primary text-primary-foreground text-[8px] font-extrabold tracking-[0.05em]">
              <EqBars playing={playing} heights={[6, 9, 7, 8, 5]} className="[&>span]:bg-primary-foreground" />
              {playing ? "PLAYING" : "PAUSED"}
            </span>
          )}
        </span>
        <span className="block px-3 pt-[11px] pb-3">
          <span className="flex items-center justify-between gap-2">
            <span className={cn("min-w-0 truncate text-xs font-bold", active ? "text-primary" : "text-foreground")}>
              {playlist.name}
            </span>
            <span className={cn("shrink-0 text-[9px] font-bold", ENERGY_TONE[playlist.energy])}>
              {ENERGY_LABELS[playlist.energy]}
            </span>
          </span>
          <span className="block text-[10px] text-muted-foreground mt-1 truncate">
            {playlist.category ?? "Your playlist"}
          </span>
          <span className="block text-[9px] text-faint mt-2.5">{meta}</span>
        </span>
      </Link>

      {!empty && (
        <button
          type="button"
          onClick={onPlay}
          disabled={loading}
          aria-label={active && playing ? `Pause ${playlist.name}` : `Play ${playlist.name}`}
          className={cn(
            "absolute right-[9px] top-[73px] w-[30px] h-[30px] rounded-full bg-primary text-primary-foreground",
            "flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-all duration-150",
            "focus-visible:opacity-100 focus-visible:translate-y-0",
            active || loading
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-[5px] group-hover:opacity-100 group-hover:translate-y-0",
          )}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : active && playing ? (
            <Pause className="w-[11px] h-[11px] fill-current" />
          ) : (
            <Play className="w-[11px] h-[11px] fill-current ml-px" />
          )}
        </button>
      )}
    </div>
  );
}
