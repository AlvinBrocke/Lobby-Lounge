"use client";

import { useEffect, useRef, useState } from "react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  MANUAL_PAUSE_MS,
  STRENGTH_RULES,
  levelFor,
  stepHold,
  type HoldState,
  type Level,
} from "@convex/lib/autolobby";
import usePlayerStore from "@/store/usePlayerStore";
import { toPlayerQueue } from "@/lib/playlists";
import { useNow } from "./useNow";

export interface AutoLobbyStatus {
  /** The level the music follows now; null when AutoLobby is off or has no POS to read. */
  level: Level | null;
  /** Staff picked music by hand recently, so AutoLobby is standing back. */
  paused: boolean;
}

/**
 * AutoLobby on the player: reads the busyness meter every minute, smooths it
 * (a level must hold 10 minutes), then leans the queue towards the right
 * energy and, at Peak, lines up the venue's peak playlist. Every change
 * happens between tracks, through `nextTrack`. When Peak ends it lines up the
 * scheduled playlist (or whatever was playing before). Lives next to
 * `useScheduleAutoplay` in AppLayout so it runs on every page.
 */
export function useAutoLobby(scheduledPlaylistId: Id<"playlists"> | null): AutoLobbyStatus {
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  const settings = useQuery(api.autolobby.settings, isAuthenticated ? {} : "skip");
  const now = useNow(60_000).getTime();
  const minute = Math.floor(now / 60_000) * 60_000;
  const enabled = !!settings?.enabled;
  const reading = useQuery(api.autolobby.meter, isAuthenticated && enabled ? { now: minute } : "skip");
  const logChange = useMutation(api.autolobby.logChange);

  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const activePlaylistId = usePlayerStore((s) => s.activePlaylistId);
  const manualAt = usePlayerStore((s) => s.manualAt);
  const paused = manualAt !== null && now - manualAt < MANUAL_PAUSE_MS;

  // Smoothing state survives re-renders but not reloads (a reload starts from the current reading).
  const hold = useRef<HoldState | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  // What to go back to when Peak ends, if no schedule block is on.
  const returnTo = useRef<string | null>(null);
  const loggedLevel = useRef<Level | null>(null);

  // 1. Reading → smoothed level.
  useEffect(() => {
    if (!enabled || !settings || !reading) {
      hold.current = null;
      setLevel(null);
      return;
    }
    hold.current = stepHold(hold.current, levelFor(reading, settings), minute);
    setLevel(hold.current.effective);
  }, [enabled, settings, reading, minute]);

  // 2. Level → the queue's energy lean.
  const lookahead = settings ? STRENGTH_RULES[settings.strength].lookahead : 0;
  useEffect(() => {
    usePlayerStore.getState().setAutoLobby(level && !paused ? { level, lookahead } : null);
  }, [level, paused, lookahead]);

  // 3. Peak → the peak playlist, and back afterwards. Lined up for the next track, never cut in.
  const peakPlaylistId = settings?.peakPlaylistId ?? null;
  const peakName = settings?.peakPlaylistName ?? undefined;
  useEffect(() => {
    if (!level || paused || !isPlaying) return;
    const store = usePlayerStore.getState();
    const pendingId = store.pendingSwitch?.playlistId ?? null;
    let cancelled = false;

    const lineUp = (id: string) => {
      convex
        .query(api.playlists.getTracks, { playlistId: id as Id<"playlists"> })
        .then((tracks) => {
          if (cancelled) return;
          const queue = toPlayerQueue(tracks);
          if (queue.length > 0) usePlayerStore.getState().queueSwitch(queue, id);
        })
        .catch((err) => console.error("AutoLobby: couldn't load a playlist", err));
    };

    if (level === "peak" && peakPlaylistId) {
      if (activePlaylistId !== peakPlaylistId && pendingId !== peakPlaylistId) {
        returnTo.current = activePlaylistId;
        lineUp(peakPlaylistId);
      }
    } else if (peakPlaylistId && pendingId === peakPlaylistId && activePlaylistId !== peakPlaylistId) {
      // Peak ended before its playlist even started: just don't switch.
      store.cancelSwitch();
    } else if (peakPlaylistId && activePlaylistId === peakPlaylistId && pendingId === null) {
      const back = scheduledPlaylistId ?? returnTo.current;
      if (back && back !== peakPlaylistId) lineUp(back);
      else store.cancelSwitch();
    }
    return () => {
      cancelled = true;
    };
  }, [level, paused, isPlaying, activePlaylistId, peakPlaylistId, scheduledPlaylistId, convex]);

  // 4. Note each change in the Activity log (the first reading after load is not a change).
  useEffect(() => {
    if (!level) {
      loggedLevel.current = null;
      return;
    }
    const previous = loggedLevel.current;
    loggedLevel.current = level;
    if (previous === null || previous === level || paused || !isPlaying) return;
    const switched = level === "peak" && peakPlaylistId ? peakName : undefined;
    logChange({ level, playlistName: switched }).catch(() => {});
  }, [level, paused, isPlaying, peakPlaylistId, peakName, logChange]);

  return { level, paused };
}
