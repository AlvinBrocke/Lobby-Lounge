"use client";

import Link from "next/link";
import { ChevronRight, Loader2, Play } from "lucide-react";
import type { Energy } from "@convex/lib/energy";
import { cn } from "@/lib/utils";
import { ENERGY_LABELS } from "@/lib/playlists";
import { PlaylistCover } from "./PlaylistCover";

export interface PlaylistRowData {
  _id: string;
  name: string;
  category?: string;
  coverImage?: string;
  trackCount: number;
  energy: Energy;
}

function EqBars({ playing }: { playing: boolean }) {
  return (
    <div className={cn("flex gap-[2.5px] items-end", !playing && "eq-bars-paused")}>
      {[9, 14, 11, 17, 13, 16].map((h, i) => (
        <span key={i} className="eq-bar w-[2.5px]" style={{ height: h }} />
      ))}
    </div>
  );
}

/**
 * One playlist as a wide row: click anywhere to play it, or the chevron to
 * open its track list. Two sibling controls rather than a link inside a
 * button, which would be invalid HTML and confuse screen readers.
 */
export function PlaylistRow({
  playlist,
  active,
  playing,
  loading,
  onPlay,
}: {
  playlist: PlaylistRowData;
  /** This playlist is the one in the player. */
  active: boolean;
  /** …and the player isn't paused. */
  playing: boolean;
  loading: boolean;
  onPlay: () => void;
}) {
  const empty = playlist.trackCount === 0;
  const subtitle = [
    playlist.category,
    `${playlist.trackCount} track${playlist.trackCount !== 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "group flex items-center rounded-xl border transition-colors",
        active
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:border-primary/25 hover:bg-secondary/40",
      )}
    >
      <button
        type="button"
        onClick={onPlay}
        disabled={empty || loading}
        aria-label={active && playing ? `Pause ${playlist.name}` : `Play ${playlist.name}`}
        className="flex-1 min-w-0 flex items-center gap-4 p-2.5 text-left disabled:cursor-not-allowed"
      >
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
          <PlaylistCover
            src={playlist.coverImage}
            alt=""
            className="w-full h-full"
            iconClassName="w-6 h-6"
          />
          {(active || loading) && (
            <div className="absolute inset-0 bg-black/45 flex items-end p-1.5">
              {loading ? (
                <Loader2 className="w-4 h-4 m-auto animate-spin text-white" />
              ) : (
                <EqBars playing={playing} />
              )}
            </div>
          )}
          {!active && !loading && !empty && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-5 h-5 text-white fill-current" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-[15px] font-bold truncate",
              active ? "text-primary" : "text-foreground",
            )}
          >
            {playlist.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</div>
        </div>

        <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2.5 py-1 rounded-md shrink-0">
          {ENERGY_LABELS[playlist.energy]}
        </span>
      </button>

      <Link
        href={`/playlists/${playlist._id}`}
        aria-label={`Open ${playlist.name}`}
        className="w-10 self-stretch flex items-center justify-center shrink-0 rounded-r-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
