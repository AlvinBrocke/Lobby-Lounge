"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { api } from "@convex/_generated/api";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { PlaylistCarousel } from "@/components/playlists/PlaylistCarousel";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { artistFromParam } from "@/lib/artists";
import { toPlayerQueue } from "@/lib/playlists";
import { cn, formatDuration } from "@/lib/utils";
import usePlayerStore from "@/store/usePlayerStore";

export default function ArtistPage() {
  const { name: param } = useParams<{ name: string }>();
  const name = artistFromParam(param);
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(api.artists.get, isAuthenticated ? { name } : "skip");
  const related = useQuery(api.artists.related, isAuthenticated ? { name } : "skip");
  const playQueue = usePlayerStore((s) => s.playQueue);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);

  if (data === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-bold text-foreground mb-2">Artist not found</p>
        <p className="text-sm text-muted-foreground mb-6">They may have left the catalogue.</p>
        <Link href="/playlists" className="text-sm font-semibold text-primary hover:underline">
          Back to Playlists
        </Link>
      </div>
    );
  }

  const { artist, tracks } = data;
  const queue = toPlayerQueue(tracks);

  /** Plays from `index` on, skipping tracks without audio like the playlist page does. */
  function playFrom(index?: number) {
    if (index === undefined) return playQueue(queue);
    const skipped = tracks.slice(0, index).filter((t) => !t.audioUrl).length;
    playQueue(queue, undefined, index - skipped);
  }

  return (
    <div className="flex flex-col w-full pb-8">
      <div className="flex flex-wrap items-center gap-4 pb-5 mb-2 border-b border-primary/[0.08]">
        <Link
          href="/playlists"
          className="flex items-center gap-1.5 h-[31px] px-2.5 rounded-md border border-primary/20 text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <ArrowLeft className="w-[13px] h-[13px]" />
          Back
        </Link>
        <PlaylistCover src={artist.coverImage} alt="" className="w-20 h-20 rounded-full shrink-0" iconClassName="w-6 h-6" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">Artist spotlight</div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground truncate">{artist.name}</h1>
          <p className="text-[11px] text-muted-foreground truncate">
            {[...artist.categories, `${artist.trackCount} ${artist.trackCount === 1 ? "track" : "tracks"}`].join(" · ")}
          </p>
        </div>
        <button
          onClick={() => playFrom()}
          disabled={queue.length === 0}
          title={queue.length === 0 ? "Your free trial has ended — subscribe to keep the music playing." : undefined}
          className="flex items-center gap-1.5 h-[31px] px-3.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-3 h-3 fill-current" />
          Play artist
        </button>
      </div>

      <section className="mb-7">
        <h2 className="text-sm font-bold tracking-tight text-foreground py-2.5">Songs on rotation</h2>
        <div className="flex flex-col">
          {tracks.map((track, i) => {
            const isCurrent = currentTrackId === track._id;
            return (
              <button
                key={track._id}
                onClick={() => playFrom(i)}
                disabled={!track.audioUrl}
                className={cn(
                  "grid grid-cols-[28px_minmax(0,1fr)_52px] items-center gap-3 px-2 py-[9px] text-left rounded-md transition-colors disabled:cursor-not-allowed",
                  isCurrent ? "bg-primary/10" : "can-hover:hover:bg-foreground/[0.03]",
                )}
              >
                <span className={cn("text-[11px] font-mono text-center", isCurrent ? "text-primary" : "text-faint")}>
                  {isCurrent ? "▶" : i + 1}
                </span>
                <span className="flex items-center gap-[9px] min-w-0">
                  <PlaylistCover src={track.coverImage} alt="" className="w-[30px] h-[30px] rounded-[3px] shrink-0" iconClassName="w-3 h-3" />
                  <span className={cn("text-xs font-semibold truncate", isCurrent ? "text-primary" : "text-foreground")}>
                    {track.name}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-faint">{formatDuration(track.duration)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {related && related.length > 0 && (
        <PlaylistCarousel title="Related artists" blurb="More voices for your space">
          {related.map((a) => (
            <ArtistCard key={a.name} artist={a} />
          ))}
        </PlaylistCarousel>
      )}
    </div>
  );
}
