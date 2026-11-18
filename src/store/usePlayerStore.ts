import { create } from "zustand";
import { pickNextIndex } from "@convex/lib/autolobby";
import type { PlayerState, Track } from "@/types";

/** Fisher–Yates: every order equally likely, each track exactly once. */
export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A fresh shuffle of the playlist that doesn't open with the track that just played. */
function reshuffle(tracks: Track[], justPlayed: Track | null): Track[] {
  const order = shuffle(tracks);
  if (order.length > 1 && order[0].id === justPlayed?.id) {
    [order[0], order[order.length - 1]] = [order[order.length - 1], order[0]];
  }
  return order;
}

const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 50,
  queue: [],
  activePlaylistId: null,
  playlistTracks: [],
  blockedIds: [],
  repeat: true,
  manualAt: null,
  autoLobby: null,
  pendingSwitch: null,

  setBlockedIds: (blockedIds) => set({ blockedIds }),
  toggleRepeat: () => set((state) => ({ repeat: !state.repeat })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  // A single hand-picked track isn't "playing a playlist" any more.
  setCurrentTrack: (track) =>
    set({
      currentTrack: track,
      isPlaying: true,
      activePlaylistId: null,
      playlistTracks: [],
      manualAt: Date.now(),
      pendingSwitch: null,
    }),
  playQueue: (tracks, playlistId, startIndex, auto) => {
    // A picked track plays first, then the list continues in order from it;
    // otherwise the whole playlist is shuffled. Blocked tracks are left out,
    // except one the venue picked by hand.
    const blocked = new Set(get().blockedIds);
    const order = startIndex === undefined ? shuffle(tracks) : tracks.slice(startIndex);
    const [first, ...rest] = startIndex === undefined ? order.filter((t) => !blocked.has(t.id)) : order;
    const queue = rest.filter((t) => !blocked.has(t.id));
    if (!first) return;
    set({
      currentTrack: first,
      queue,
      isPlaying: true,
      activePlaylistId: playlistId ?? null,
      playlistTracks: playlistId ? tracks : [],
      // A hand-picked playlist wins over AutoLobby for a while, and over any switch it had lined up.
      ...(!auto && { manualAt: Date.now(), pendingSwitch: null }),
    });
  },
  setAutoLobby: (autoLobby) => set({ autoLobby }),
  queueSwitch: (tracks, playlistId) => set({ pendingSwitch: { tracks, playlistId } }),
  cancelSwitch: () => set({ pendingSwitch: null }),
  setVolume: (volume) => set({ volume }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  reorderQueue: (from, to) =>
    set((state) => {
      if (from === to || !state.queue[from] || !state.queue[to]) return {};
      const queue = [...state.queue];
      const [moved] = queue.splice(from, 1);
      queue.splice(to, 0, moved);
      return { queue };
    }),
  clearQueue: () => set({ queue: [] }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextTrack: () =>
    set((state) => {
      const blocked = new Set(state.blockedIds);
      // AutoLobby lined up another playlist: it starts now, between tracks.
      const pending = state.pendingSwitch;
      if (pending) {
        const [first, ...rest] = reshuffle(pending.tracks, state.currentTrack).filter((t) => !blocked.has(t.id));
        if (first) {
          return {
            currentTrack: { ...first },
            queue: rest,
            isPlaying: true,
            activePlaylistId: pending.playlistId,
            playlistTracks: pending.tracks,
            pendingSwitch: null,
          };
        }
      }
      // With repeat on, a playlist loops: when the queue runs dry, start a new shuffled pass.
      const queue = (
        state.queue.length > 0 || !state.repeat ? state.queue : reshuffle(state.playlistTracks, state.currentTrack)
      ).filter((t) => !blocked.has(t.id));
      // Repeat off and the playlist is done: stop on the last track rather than hiding the bar.
      if (queue.length === 0) return state.repeat ? { isPlaying: false, currentTrack: null } : { isPlaying: false };
      // AutoLobby leans towards tracks whose energy suits the room; otherwise the queue's order.
      const i = state.autoLobby ? pickNextIndex(queue, state.autoLobby.level, state.autoLobby.lookahead) : 0;
      const next = queue[i];
      const rest = [...queue.slice(0, i), ...queue.slice(i + 1)];
      // A copy, so a one-track playlist still counts as a new track and replays.
      return { currentTrack: { ...next }, queue: rest, isPlaying: true, pendingSwitch: null };
    }),

  previousTrack: () => {
    // No-op for now: restarts the current track by toggling isPlaying.
    // The audio element in PlayerBar handles seeking to 0 on track load.
  },

  pendingAnnouncements: [],
  announcing: null,
  queueAnnouncement: (cue) =>
    set((state) =>
      state.pendingAnnouncements.some((c) => c.key === cue.key) || state.announcing?.cue.key === cue.key
        ? {}
        : { pendingAnnouncements: [...state.pendingAnnouncements, cue] },
    ),
  startAnnouncement: (advanceAfter) =>
    set((state) => {
      const [cue, ...rest] = state.pendingAnnouncements;
      if (!cue || state.announcing) return {};
      return { announcing: { cue, advanceAfter }, pendingAnnouncements: rest };
    }),
  finishAnnouncement: () => {
    const { announcing, nextTrack } = get();
    set({ announcing: null });
    if (announcing?.advanceAfter) nextTrack();
  },
}));

export default usePlayerStore;
