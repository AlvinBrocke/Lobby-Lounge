"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Calendar, ChevronDown, Pause, PencilLine, Play, PlayCircle, Plus, Trash2 } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { AnnouncementComposer } from "@/components/announcements/AnnouncementComposer";
import { ConfirmDialog } from "@/components/playlists/ConfirmDialog";
import { useNow } from "@/hooks/useNow";
import { formatNextPlay, formatTiming, isLiveToday } from "@/lib/announcements";
import { todayKey } from "@/lib/schedule";
import { cn } from "@/lib/utils";

type Announcement = Doc<"announcements"> & { audioUrl: string | null };
type Filter = "live" | "scheduled" | "draft";

/** Which tab an announcement sits under: playing today, later in the week, or not scheduled. */
function group(a: Announcement, now: Date): Filter {
  if (a.status === "draft") return "draft";
  return isLiveToday(a, now) ? "live" : "scheduled";
}

// Status colours from the design: teal = live, amber = scheduled, slate = draft.
const ACCENT: Record<Filter, { text: string; bg: string; border: string; dot: string }> = {
  live: { text: "text-primary", bg: "bg-primary/[0.12]", border: "border-l-primary", dot: "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" },
  scheduled: { text: "text-warning-500", bg: "bg-warning-500/[0.12]", border: "border-l-warning-500", dot: "bg-warning-500" },
  draft: { text: "text-faint", bg: "bg-muted-foreground/[0.08]", border: "border-l-faint", dot: "bg-faint" },
};

const FILTERS = [
  { id: "live", label: "Live", icon: PlayCircle, colour: "text-primary" },
  { id: "scheduled", label: "Scheduled", icon: Calendar, colour: "text-warning-500" },
  { id: "draft", label: "Drafts", icon: PencilLine, colour: "text-muted-foreground" },
] as const;

const EMPTY: Record<Filter, string> = {
  live: "Nothing plays today. Scheduled announcements show here on the days they play.",
  scheduled: "No announcements scheduled for later in the week.",
  draft: "No drafts. Save a message as a draft to finish it later.",
};

const iconButton =
  "px-[7px] py-[5px] rounded-md border leading-none transition-colors bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] hover:text-foreground";

export default function AnnouncementsPage() {
  const { isAuthenticated } = useConvexAuth();
  const announcements = useQuery(api.announcements.listByUser, isAuthenticated ? {} : "skip");
  const setPaused = useMutation(api.announcements.setPaused);
  const remove = useMutation(api.announcements.remove);
  const now = useNow(30_000);

  const [filter, setFilter] = useState<Filter>("live");
  const [expanded, setExpanded] = useState<Id<"announcements"> | null>(null);
  // `null` = closed; `{}` = composing a new one; `{ editing }` = editing.
  const [composer, setComposer] = useState<{ editing?: Announcement } | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const counts: Record<Filter, number> = { live: 0, scheduled: 0, draft: 0 };
  for (const a of announcements ?? []) counts[group(a, now)]++;
  const visible = (announcements ?? []).filter((a) => group(a, now) === filter);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-[18px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[20px] font-bold tracking-tight text-foreground">Your Campaigns</h1>
            <span className="px-[7px] py-[3px] rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-extrabold tracking-[0.12em]">
              BETA
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Create short voice messages and choose when they play.</p>
        </div>
        <button
          onClick={() => setComposer({})}
          disabled={announcements === undefined}
          className="flex items-center gap-[7px] px-4 py-[9px] rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-[0_4px_16px_hsl(var(--primary)/0.3)] hover:-translate-y-px transition-transform disabled:opacity-40 disabled:hover:translate-y-0 shrink-0"
        >
          <Plus className="w-[13px] h-[13px]" strokeWidth={2.5} />
          New Message
        </button>
      </div>

      {/* Status filters */}
      <div className="grid grid-cols-3 gap-2.5 mb-[18px]">
        {FILTERS.map(({ id, label, icon: Icon, colour }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={cn(
              "text-left rounded-[10px] border px-3.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-colors",
              filter === id ? "bg-primary/10 border-primary/20" : "bg-secondary border-white/5 hover:border-white/10",
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-faint">{label}</span>
              <Icon className={cn("w-3.5 h-3.5", colour)} />
            </div>
            <div className={cn("text-[22px] font-extrabold tracking-tight", colour)}>
              {announcements === undefined ? "–" : counts[id]}
            </div>
          </button>
        ))}
      </div>

      {/* Campaign list */}
      <div className="flex flex-col gap-2.5">
        {announcements !== undefined && visible.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">{EMPTY[filter]}</p>
        )}

        {visible.map((a) => {
          const status = group(a, now);
          const accent = ACCENT[a.paused ? "draft" : status];
          const isExpanded = expanded === a._id;
          const next = status === "live" && !a.paused ? formatNextPlay(a, now) : null;
          const summary = a.source === "ai" ? a.message : `${a.source === "record" ? "Recorded" : "Uploaded"} voiceover · ${a.audioSeconds ?? "?"} seconds`;
          const toggle = () => setExpanded(isExpanded ? null : a._id);

          return (
            <div
              key={a._id}
              className={cn(
                "bg-secondary rounded-xl border border-white/5 border-l-[3px] overflow-hidden transition-shadow",
                accent.border,
                status === "live" && !a.paused
                  ? "shadow-[0_4px_20px_hsl(var(--primary)/0.08)]"
                  : "shadow-[0_2px_12px_rgba(0,0,0,0.35)]",
              )}
            >
              <div className="px-4 py-3.5 flex items-center gap-3.5">
                <span className={cn("w-2 h-2 rounded-full shrink-0", accent.dot)} />

                <button onClick={toggle} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[13px] font-bold text-foreground">{a.title}</span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-[7px] py-0.5 rounded-full uppercase tracking-[0.07em]",
                        accent.bg,
                        accent.text,
                      )}
                    >
                      {a.paused ? "Paused" : status}
                    </span>
                    {next && (
                      <span className="text-[9px] text-muted-foreground">
                        Next: <span className="text-primary font-semibold">{next}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mb-2 leading-normal truncate">{summary}</p>
                  <span className="text-[9.5px] text-faint bg-muted-foreground/[0.08] rounded px-[7px] py-0.5">
                    {formatTiming(a)}
                  </span>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {a.status !== "draft" && (
                    <button
                      onClick={() => setPaused({ id: a._id, paused: !a.paused })}
                      title={a.paused ? "Resume" : "Pause"}
                      aria-label={a.paused ? `Resume ${a.title}` : `Pause ${a.title}`}
                      className={cn(iconButton, a.paused ? "text-primary" : "text-faint")}
                    >
                      {a.paused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                    </button>
                  )}
                  <button
                    onClick={toggle}
                    title="Details"
                    aria-expanded={isExpanded}
                    aria-label={`Details for ${a.title}`}
                    className={cn(
                      iconButton,
                      isExpanded ? "bg-primary/10 border-primary/25 text-primary" : "text-faint",
                    )}
                  >
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3.5">
                    <div className="sm:col-span-2 bg-card rounded-lg px-3.5 py-3">
                      <div className="text-[9px] font-bold text-faint uppercase tracking-[0.1em] mb-1.5">
                        Message Preview
                      </div>
                      {a.source === "ai" ? (
                        <p className="text-xs text-foreground leading-[1.7]">{a.message}</p>
                      ) : a.audioUrl ? (
                        <audio controls src={a.audioUrl} className="w-full h-8" />
                      ) : (
                        <p className="text-xs text-muted-foreground">The voiceover file is missing. Edit to add it again.</p>
                      )}
                    </div>
                    <div className="bg-card rounded-lg px-3.5 py-3">
                      <div className="text-[9px] font-bold text-faint uppercase tracking-[0.1em] mb-2">Schedule</div>
                      <div className="text-xs font-semibold text-foreground mb-[3px]">{formatTiming(a)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {a.interruptMusic ? "Interrupts the music" : "Waits for the current song to end"}
                      </div>
                    </div>
                    <div className="bg-card rounded-lg px-3.5 py-3 flex items-center gap-2">
                      <button
                        onClick={() => setComposer({ editing: a })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                        {a.status === "draft" ? "Edit & schedule" : "Edit"}
                      </button>
                      <button
                        onClick={() => setDeleting(a)}
                        aria-label={`Delete ${a.title}`}
                        className="px-3 py-2 rounded-lg border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {composer && (
        <AnnouncementComposer
          editing={composer.editing}
          onClose={() => setComposer(null)}
          onSaved={(status, days) => {
            setComposer(null);
            setFilter(status === "draft" ? "draft" : days.includes(todayKey(new Date())) ? "live" : "scheduled");
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete announcement?"
          message={
            <>
              <span className="font-semibold text-foreground">{deleting.title}</span> will stop playing and be
              removed.
            </>
          }
          confirmLabel="Delete"
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await remove({ id: deleting._id });
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
