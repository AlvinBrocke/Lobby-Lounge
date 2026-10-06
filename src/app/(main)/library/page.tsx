"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Moon, Music, Sun, User } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { ENERGY_LABELS } from "@/lib/playlists";
import { formatTotalDuration } from "@/lib/utils";

type PlaylistSummary = FunctionReturnType<typeof api.playlists.listCurated>[number];
type SectionKey = "mine" | "daytime" | "evening" | "genres";

const card =
  "bg-secondary border border-white/5 rounded-xl shadow-[0_2px_14px_rgba(0,0,0,0.4)] transition-all duration-150";

function PlaylistList({ playlists }: { playlists: PlaylistSummary[] }) {
  if (playlists.length === 0) {
    return <p className="text-sm text-muted-foreground py-6">Nothing here yet.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {playlists.map((p) => (
        <Link
          key={p._id}
          href={`/playlists/${p._id}`}
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] bg-secondary border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:bg-card transition-colors"
        >
          <PlaylistCover src={p.coverImage} alt="" className="w-[52px] h-[52px] rounded-md shrink-0" iconClassName="w-5 h-5" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-foreground truncate">{p.name}</div>
            <div className="text-[11px] text-faint truncate mt-0.5">
              {[p.category, `${p.trackCount} tracks`, p.totalDuration ? formatTotalDuration(p.totalDuration) : null]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground bg-black/30 rounded px-2 py-[3px] shrink-0">
            {ENERGY_LABELS[p.energy]}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const { isAuthenticated } = useConvexAuth();
  const curated = useQuery(api.playlists.listCurated, isAuthenticated ? {} : "skip");
  const mine = useQuery(api.playlists.listByUser, isAuthenticated ? {} : "skip");
  const [section, setSection] = useState<SectionKey | null>(null);
  const [genre, setGenre] = useState<string | null>(null);

  const all = [...(curated ?? []), ...(mine ?? [])];
  const daytime = (curated ?? []).filter((p) => p.section === "daytime");
  const evening = (curated ?? []).filter((p) => p.section === "evening");
  // Genres are the categories that actually have playlists, each with a cover to show.
  const genres = Array.from(
    all.reduce((map, p) => {
      if (!p.category) return map;
      const g = map.get(p.category) ?? { name: p.category, count: 0, cover: undefined as string | undefined };
      g.count += 1;
      g.cover ??= p.coverImage;
      return map.set(p.category, g);
    }, new Map<string, { name: string; count: number; cover?: string }>()).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const loading = curated === undefined || mine === undefined;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const SECTIONS = [
    { key: "mine", label: "My Playlists", count: plural(mine?.length ?? 0, "playlist"), accent: "#FF4B6E", icon: User },
    { key: "daytime", label: "Daytime Sets", count: plural(daytime.length, "playlist"), accent: "#27E0C5", icon: Sun },
    { key: "evening", label: "Evening & Night", count: plural(evening.length, "playlist"), accent: "#4A9EFF", icon: Moon },
    { key: "genres", label: "Genres", count: plural(genres.length, "genre"), accent: "#7C3AED", icon: Music },
  ] as const;

  // ── Detail views ───────────────────────────────────────────────────────────
  if (section) {
    const sec = SECTIONS.find((s) => s.key === section)!;
    const back = () => (genre ? setGenre(null) : setSection(null));
    return (
      <div>
        <div className="flex items-center gap-3.5 mb-[18px]">
          <button
            onClick={back}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {genre ? sec.label : "Library"}
          </button>
          <span className="text-xs text-faint">/</span>
          <span className="text-sm font-bold text-foreground">{genre ?? sec.label}</span>
        </div>

        {section === "mine" && <PlaylistList playlists={mine ?? []} />}
        {section === "daytime" && <PlaylistList playlists={daytime} />}
        {section === "evening" && <PlaylistList playlists={evening} />}
        {section === "genres" &&
          (genre ? (
            <PlaylistList playlists={all.filter((p) => p.category === genre)} />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {genres.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setGenre(g.name)}
                  className="relative h-20 rounded-[10px] overflow-hidden text-left shadow-[0_2px_12px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-transform"
                >
                  <PlaylistCover src={g.cover} alt="" className="absolute inset-0 w-full h-full opacity-40" />
                  <span className="absolute inset-0 bg-gradient-to-br from-primary/30 to-background/85" />
                  <span className="relative block px-4 py-3.5">
                    <span className="block text-sm font-extrabold text-foreground">{g.name}</span>
                    <span className="block text-[10px] text-white/60 mt-0.5">{plural(g.count, "playlist")}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
      </div>
    );
  }

  // ── Home grid ──────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="text-[22px] font-bold tracking-tight text-foreground mb-6">Your Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              disabled={loading}
              className={`${card} flex items-center gap-4 px-5 py-[22px] text-left hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_6px_24px_rgba(0,0,0,0.5)] disabled:opacity-60`}
            >
              <span
                className="w-[52px] h-[52px] rounded-[10px] flex items-center justify-center shrink-0 border"
                // Each tile has its own accent, so the tint is set inline.
                style={{ background: `${s.accent}18`, borderColor: `${s.accent}33`, color: s.accent }}
              >
                <Icon className="w-7 h-7" strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">{s.label}</span>
                <span className="block text-[11px] text-faint mt-1">{loading ? "…" : s.count}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-faint ml-auto shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
