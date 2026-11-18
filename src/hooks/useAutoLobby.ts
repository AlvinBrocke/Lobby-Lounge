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
import {
  HEARTBEAT_EVERY_MS,
  STALE_AFTER_MS,
  combine,
  moodFor,
  type Mood,
  weatherLabel,
} from "@convex/lib/weather";
import usePlayerStore from "@/store/usePlayerStore";
import { toPlayerQueue } from "@/lib/playlists";
import { useNow } from "./useNow";

export interface AutoLobbyStatus {
  /** How busy the room is (from the POS); null without one, or when AutoLobby is off. */
  level: Level | null;
  /** The weather mood being followed; null when not following the weather or the reading is stale. */
  mood: Mood | null;
  /** e.g. "Rain, 8°C", alongside `mood`. */
  weather: string | null;
  /** Staff picked music by hand recently, so AutoLobby is standing back. */
  paused: boolean;
}

/** What the smoothing holds: the room level and the weather mood together, e.g. "busy|cosy". */
function inputsKey(level: Level | null, mood: Mood | null): string {
  return `${level ?? "-"}|${mood ?? "-"}`;
}
function parseInputs(key: string): { level: Level | null; mood: Mood | null } {
  const [l, m] = key.split("|");
  return { level: l === "-" ? null : (l as Level), mood: m === "-" ? null : (m as Mood) };
}

/**
 * AutoLobby on the player. Every minute it reads the room's busyness (POS
 * orders) and, when "Follow the weather" is on, the local weather mood. Both
 * are smoothed together (a change must hold 10 minutes), then `combine`
 * decides the queue's energy lean and whether the peak or rainy-day playlist
 * takes over. Every change happens between tracks, through `nextTrack`. When
 * a special playlist is no longer wanted it lines up the scheduled playlist
 * (or whatever was playing before). Lives next to `useScheduleAutoplay` in
 * AppLayout so it runs on every page.
 */
export function useAutoLobby(scheduledPlaylistId: Id<"playlists"> | null): AutoLobbyStatus {
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  const settings = useQuery(api.autolobby.settings, isAuthenticated ? {} : "skip");
  const now = useNow(60_000).getTime();
  const minute = Math.floor(now / 60_000) * 60_000;
  const enabled = !!settings?.enabled;
  const followWeather = enabled && !!settings?.followWeather;
  const meter = useQuery(api.autolobby.meter, isAuthenticated && enabled ? { now: minute } : "skip");
  const weather = useQuery(api.weather.status, isAuthenticated && followWeather ? {} : "skip");
  const logChange = useMutation(api.autolobby.logChange);
  const heartbeat = useMutation(api.weather.heartbeat);

  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const activePlaylistId = usePlayerStore((s) => s.activePlaylistId);
  const manualAt = usePlayerStore((s) => s.manualAt);
  const paused = manualAt !== null && now - manualAt < MANUAL_PAUSE_MS;

  const reading = weather?.reading ?? null;
  const fresh = reading && minute - reading.fetchedAt < STALE_AFTER_MS ? reading : null;
  const observedLevel = enabled && settings && meter ? levelFor(meter, settings) : null;
  const observedMood = followWeather && fresh ? moodFor(fresh.condition, fresh.tempC) : null;
  const observed = inputsKey(observedLevel, observedMood);
  // Still loading: don't treat "no reading yet" as a change.
  const loading = enabled && (meter === undefined || (followWeather && weather === undefined));

  // Smoothing state survives re-renders but not reloads (a reload starts from the current reading).
  const hold = useRef<HoldState<string> | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  // What to go back to when a special playlist is no longer wanted, if no schedule block is on.
  const returnTo = useRef<string | null>(null);
  const loggedKey = useRef<string | null>(null);

  // 1. Readings → smoothed inputs.
  useEffect(() => {
    if (!enabled) {
      hold.current = null;
      setHeld(null);
      return;
    }
    if (loading) return;
    hold.current = stepHold<string>(hold.current, observed, minute);
    setHeld(hold.current.effective);
  }, [enabled, loading, observed, minute]);

  const { level, mood } = held ? parseInputs(held) : { level: null, mood: null };
  const target = combine(level, mood);

  // 2. Target → the queue's energy lean.
  const lookahead = settings ? STRENGTH_RULES[settings.strength].lookahead : 0;
  const lean = target?.lean ?? null;
  useEffect(() => {
    usePlayerStore.getState().setAutoLobby(lean && !paused ? { level: lean, lookahead } : null);
  }, [lean, paused, lookahead]);

  // 3. Peak / Cosy → the peak or rainy-day playlist, and back afterwards. Lined up for the next track, never cut in.
  const peakPlaylistId = settings?.peakPlaylistId ?? null;
  const rainyPlaylistId = (followWeather && settings?.rainyPlaylistId) || null;
  const special = target?.special ?? null;
  const wanted = special === "peak" ? peakPlaylistId : special === "rainy" ? rainyPlaylistId : null;
  useEffect(() => {
    if (!enabled || paused || !isPlaying) return;
    const specials = [peakPlaylistId, rainyPlaylistId].filter(Boolean) as string[];
    if (specials.length === 0) return;
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

    if (wanted) {
      if (activePlaylistId !== wanted && pendingId !== wanted) {
        if (!activePlaylistId || !specials.includes(activePlaylistId)) returnTo.current = activePlaylistId;
        lineUp(wanted);
      }
    } else if (pendingId && specials.includes(pendingId) && activePlaylistId !== pendingId) {
      // No longer wanted before it even started: just don't switch.
      store.cancelSwitch();
    } else if (activePlaylistId && specials.includes(activePlaylistId) && pendingId === null) {
      const back = scheduledPlaylistId ?? returnTo.current;
      if (back && !specials.includes(back)) lineUp(back);
    }
    return () => {
      cancelled = true;
    };
  }, [enabled, wanted, paused, isPlaying, activePlaylistId, peakPlaylistId, rainyPlaylistId, scheduledPlaylistId, convex]);

  // 4. Tell the server this venue is playing, so its weather keeps being fetched.
  const lastBeat = useRef(0);
  useEffect(() => {
    if (!followWeather || !isPlaying) return;
    if (minute - lastBeat.current < HEARTBEAT_EVERY_MS) return;
    lastBeat.current = minute;
    heartbeat({}).catch(() => {});
  }, [followWeather, isPlaying, minute, heartbeat]);

  // 5. Note each change in the Activity log (the first reading after load is not a change).
  const weatherText = mood && fresh ? weatherLabel(fresh) : null;
  const switchedName =
    special === "peak" && peakPlaylistId
      ? (settings?.peakPlaylistName ?? undefined)
      : special === "rainy" && rainyPlaylistId
        ? (settings?.rainyPlaylistName ?? undefined)
        : undefined;
  useEffect(() => {
    if (!held || held === inputsKey(null, null)) {
      loggedKey.current = held;
      return;
    }
    const previous = loggedKey.current;
    loggedKey.current = held;
    if (previous === null || previous === held || paused || !isPlaying) return;
    logChange({
      level: level ?? undefined,
      weather: weatherText ?? undefined,
      playlistName: switchedName,
    }).catch(() => {});
    // Only a change of `held` should log; the rest is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held]);

  return { level, mood, weather: weatherText, paused };
}
