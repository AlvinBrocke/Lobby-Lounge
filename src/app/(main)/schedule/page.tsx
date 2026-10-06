"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CalendarClock, Plus } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import {
  ScheduleBlockModal,
  type ScheduleBlockValues,
} from "@/components/schedule/ScheduleBlockModal";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import {
  DAYS,
  activeBlock,
  formatHour,
  formatRange,
  todayKey,
  type Day,
} from "@/lib/schedule";

const ROW_HEIGHT = 64; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SCROLL_TO_HOUR = 7; // most venues open in the morning

// Colour is picked from the playlist's category so the same kind of music
// always looks the same across the week.
// Hex rather than Tailwind classes: blocks use the colour in a gradient.
const PALETTE = ["#805BE8", "#2764E7", "#E88E9A", "#26866E", "#D96B37", "#6A235E", "#0B9E53", "#C53364"];

function colourFor(key: string): string {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type ModalState =
  | { mode: "create"; day: Day; startHour: number }
  | { mode: "edit"; block: Doc<"scheduleBlocks"> }
  | null;

export default function SchedulePage() {
  const { isAuthenticated } = useConvexAuth();
  const now = useNow(60_000);
  const today = todayKey(now);

  // "skip" until Clerk's token reaches Convex — otherwise `requireUser` throws.
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const curated = useQuery(api.playlists.listCurated, isAuthenticated ? {} : "skip");
  const mine = useQuery(api.playlists.listByUser, isAuthenticated ? {} : "skip");
  const createBlock = useMutation(api.scheduleBlocks.create);
  const updateBlock = useMutation(api.scheduleBlocks.update);
  const removeBlock = useMutation(api.scheduleBlocks.remove);

  const [modal, setModal] = useState<ModalState>(null);

  const playlistById = useMemo(
    () => new Map([...(curated ?? []), ...(mine ?? [])].map((p) => [p._id, p])),
    [curated, mine],
  );
  const current = blocks ? activeBlock(blocks, now) : null;

  // Start the grid scrolled to the morning instead of midnight.
  // Runs again once data arrives, because the loading state can be shorter.
  const scrollRef = useRef<HTMLDivElement>(null);
  const loading = blocks === undefined || curated === undefined || mine === undefined;
  useEffect(() => {
    // Small offset so the first hour's label isn't tucked under the sticky header.
    if (scrollRef.current) scrollRef.current.scrollTop = SCROLL_TO_HOUR * ROW_HEIGHT - 12;
  }, [loading]);

  function blockLabel(block: Doc<"scheduleBlocks">) {
    return block.title ?? playlistById.get(block.playlistId)?.name ?? "Untitled";
  }

  /** First free hour today from now on, so "New Block" opens on a usable slot. */
  function openNewBlock() {
    const taken = new Set(
      (blocks ?? [])
        .filter((b) => b.day === today)
        .flatMap((b) => Array.from({ length: b.duration }, (_, i) => b.startHour + i)),
    );
    const free = HOURS.find((h) => h >= now.getHours() && !taken.has(h));
    setModal({ mode: "create", day: today, startHour: free ?? 9 });
  }

  async function handleSubmit(values: ScheduleBlockValues) {
    if (modal?.mode === "edit") {
      // An empty title is sent as "" (not omitted) so the server clears it.
      await updateBlock({ id: modal.block._id, ...values });
    } else {
      await createBlock({ ...values, title: values.title || undefined });
    }
    setModal(null);
  }

  async function handleDelete(id: Id<"scheduleBlocks">) {
    await removeBlock({ id });
    setModal(null);
  }

  return (
    <PageWrapper
      title="Schedule"
      description="Set a playlist for every hour of the week — it repeats automatically."
      action={
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
            {current ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                On now:{" "}
                <span className="font-semibold text-foreground">{blockLabel(current)}</span>
              </>
            ) : (
              <>
                <CalendarClock className="w-3.5 h-3.5" />
                Nothing scheduled right now
              </>
            )}
          </div>
          <button
            onClick={openNewBlock}
            disabled={loading}
            className="flex items-center gap-1 px-[15px] py-[9px] bg-primary text-primary-foreground rounded-lg text-[11px] font-extrabold shadow-[0_6px_22px_hsl(var(--primary)/0.18)] hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Plus className="w-3 h-3" strokeWidth={3} />
            Add playlist
          </button>
        </div>
      }
    >
      <div className="bg-[#0A101C] border border-white/[0.07] rounded-[14px] p-[13px] shadow-[0_18px_50px_rgba(0,0,0,0.32)] overflow-hidden">
          <div ref={scrollRef} className="max-h-[calc(100vh-290px)] min-h-[400px] overflow-y-auto scrollbar-hide">
            {/* Day headers */}
            <div className="grid grid-cols-[56px_1fr] sticky top-0 bg-[#0A101C] z-30 pb-[7px]">
              <div />
              <div className="grid grid-cols-7 gap-[7px]">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "py-[7px] rounded-[7px] text-center text-[11px] font-bold",
                      day === today ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Hour rows — empty cells open the create modal */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[56px_1fr]"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className="text-[10px] text-faint pr-2.5 font-semibold flex items-start justify-end -mt-1.5 uppercase">
                    {hour > 0 && formatHour(hour)}
                  </div>
                  <div className="grid grid-cols-7 gap-[7px] border-t border-white/[0.04]">
                    {DAYS.map((day) => (
                      <button
                        key={`${day}-${hour}`}
                        type="button"
                        disabled={loading}
                        aria-label={`Add block on ${day} at ${formatHour(hour)}`}
                        onClick={() => setModal({ mode: "create", day, startHour: hour })}
                        className={cn(
                          "hover:bg-white/[0.04] transition-colors group/cell relative",
                          day === today ? "bg-primary/[0.045]" : "bg-white/[0.025]",
                        )}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-muted-foreground/50" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Blocks, absolutely positioned over the grid */}
              <div className="absolute top-0 left-[56px] right-0 bottom-0 pointer-events-none">
                <div className="grid grid-cols-7 gap-[7px] h-full">
                  {DAYS.map((day) => (
                    <div key={`blocks-${day}`} className="relative h-full">
                      {day === today && (
                        <div
                          className="absolute left-0 right-0 h-px bg-destructive z-20 shadow-[0_0_7px_hsl(var(--destructive)/0.5)]"
                          style={{ top: (now.getHours() + now.getMinutes() / 60) * ROW_HEIGHT }}
                        >
                          <span className="absolute -left-1 -top-[3px] w-[7px] h-[7px] rounded-full bg-destructive" />
                        </div>
                      )}
                      {(blocks ?? [])
                        .filter((b) => b.day === day)
                        .map((block) => {
                          const playlist = playlistById.get(block.playlistId);
                          const isNow = current?._id === block._id;
                          const compact = block.duration === 1;
                          const colour = colourFor(playlist?.category ?? playlist?.name ?? "");
                          return (
                            <button
                              key={block._id}
                              type="button"
                              onClick={() => setModal({ mode: "edit", block })}
                              className={cn(
                                "absolute left-1 right-1 rounded-lg border pointer-events-auto text-left text-white overflow-hidden hover:scale-[1.02] transition-transform duration-150 z-10",
                                compact ? "px-2 py-1" : "px-2 py-[9px]",
                                isNow
                                  ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.15),0_8px_22px_rgba(0,0,0,0.3)]"
                                  : "border-white/10 shadow-[0_5px_14px_rgba(0,0,0,0.22)]",
                              )}
                              style={{
                                top: block.startHour * ROW_HEIGHT + 2,
                                height: block.duration * ROW_HEIGHT - 4,
                                // Per-playlist colour, so it can't be a static Tailwind class.
                                background: `linear-gradient(155deg, ${colour}, ${colour}B8)`,
                              }}
                            >
                              <span className={cn("block truncate text-[11px] font-extrabold leading-tight tracking-tight", !compact && "pr-8")}>
                                {blockLabel(block)}
                              </span>
                              <span className="block mt-1 text-[9px] text-white/70 truncate">
                                {formatRange(block.startHour, block.duration)}
                                {!compact && block.title && playlist ? ` · ${playlist.name}` : ""}
                              </span>
                              {!compact && (
                                <PlaylistCover
                                  src={playlist?.coverImage}
                                  alt=""
                                  className="absolute top-[7px] right-[7px] w-[27px] h-[27px] rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                                  iconClassName="w-3 h-3"
                                />
                              )}
                              {isNow && (
                                <span className="absolute right-[7px] bottom-[7px] px-[5px] py-0.5 rounded-full bg-background text-primary text-[7px] font-extrabold uppercase tracking-[0.08em]">
                                  Live
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>

      {blocks?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          No blocks yet — click any hour in the grid to schedule a playlist. It will repeat every
          week.
        </p>
      )}

      {modal && curated && mine && blocks && (
        <ScheduleBlockModal
          mode={modal.mode}
          initial={
            modal.mode === "edit"
              ? {
                  playlistId: modal.block.playlistId,
                  day: modal.block.day as Day,
                  startHour: modal.block.startHour,
                  duration: modal.block.duration,
                  title: modal.block.title,
                }
              : { day: modal.day, startHour: modal.startHour }
          }
          editingId={modal.mode === "edit" ? modal.block._id : undefined}
          curated={curated}
          mine={mine}
          blocks={blocks}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          onDelete={modal.mode === "edit" ? () => handleDelete(modal.block._id) : undefined}
        />
      )}
    </PageWrapper>
  );
}
