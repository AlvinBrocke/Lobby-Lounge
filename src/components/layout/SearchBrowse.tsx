"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CATEGORY_TAGS } from "@convex/lib/energy";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { suggestedPlaylists } from "@/lib/playlists";

const tagsFor = (category: string | undefined) => CATEGORY_TAGS[category ?? ""] ?? [];
// Every genre tag the curated catalogue is filled from, so each chip finds something.
const GENRES = Array.from(new Set(Object.values(CATEGORY_TAGS).flat())).sort();

const heading = "text-[9px] font-bold uppercase tracking-[0.08em] text-faint mb-2";
const chip =
  "px-2.5 py-1 rounded-full border border-primary/20 bg-card text-[11px] text-foreground capitalize hover:border-primary hover:text-primary transition-colors";

/**
 * The pop-up under the search bar when it's focused and empty: mood chips,
 * suggested playlists, and genre chips. Picking a chip searches for it.
 */
export function SearchBrowse({ id, onPick, onNavigate }: { id: string; onPick: (term: string) => void; onNavigate: () => void }) {
  const { isAuthenticated } = useConvexAuth();
  const curated = useQuery(api.playlists.listCurated, isAuthenticated ? {} : "skip");
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");

  const moods = Array.from(new Set((curated ?? []).map((p) => p.category).filter(Boolean))).sort();
  const suggested = curated
    ? suggestedPlaylists(curated, { genres: profile?.genres ?? [], mood: profile?.mood }, tagsFor)
    : [];

  return (
    <div
      id={id}
      aria-label="Browse suggestions"
      className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 min-w-[300px] rounded-xl border border-primary/20 bg-secondary p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-4"
    >
      <section>
        <h3 className={heading}>Browse by mood</h3>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {curated === undefined
            ? [0, 1, 2, 3].map((i) => <div key={i} className="h-6 w-16 shrink-0 rounded-full bg-muted animate-pulse" />)
            : moods.map((m) => (
                <button key={m} type="button" onClick={() => onPick(m)} className={`${chip} shrink-0`}>
                  {m}
                </button>
              ))}
        </div>
      </section>

      <section>
        <h3 className={heading}>Suggested for you</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {curated === undefined
            ? [0, 1, 2, 3].map((i) => <div key={i} className="h-11 rounded-lg bg-muted animate-pulse" />)
            : suggested.map((p) => (
                <Link
                  key={p._id}
                  href={`/playlists/${p._id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2 rounded-lg bg-card p-1.5 hover:bg-primary/10 transition-colors min-w-0"
                >
                  <PlaylistCover src={p.coverImage} alt="" className="w-8 h-8 rounded-md shrink-0" iconClassName="w-3.5 h-3.5" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-foreground truncate">{p.name}</span>
                    <span className="block text-[10px] text-faint truncate">{p.category}</span>
                  </span>
                </Link>
              ))}
        </div>
      </section>

      <section>
        <h3 className={heading}>Browse by genre</h3>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => (
            <button key={g} type="button" onClick={() => onPick(g)} className={chip}>
              {g}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
