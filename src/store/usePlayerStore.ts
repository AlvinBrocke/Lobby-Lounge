import { create } from "zustand";
import { PlayerState, Track } from "@/types";

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

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  // A single hand-picked track isn't "playing a playlist" any more.
  setCurrentTrack: (track) =>
    set({ currentTrack: track, isPlaying: true, activePlaylistId: null, playlistTracks: [] }),
  playQueue: (tracks, playlistId, startIndex) => {
    // A picked track plays first, then the list continues in order from it;
    // otherwise the whole playlist is shuffled.
    const order = startIndex === undefined ? shuffle(tracks) : tracks.slice(startIndex);
    const [first, ...rest] = order;
    if (!first) return;
    set({
      currentTrack: first,
      queue: rest,
      isPlaying: true,
      activePlaylistId: playlistId ?? null,
      playlistTracks: playlistId ? tracks : [],
    });
  },
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
      // A playlist loops: when the queue runs dry, start a new shuffled pass.
      const queue =
        state.queue.length > 0 ? state.queue : reshuffle(state.playlistTracks, state.currentTrack);
      if (queue.length === 0) return { isPlaying: false, currentTrack: null };
      const [next, ...rest] = queue;
      // A copy, so a one-track playlist still counts as a new track and replays.
      return { currentTrack: { ...next }, queue: rest, isPlaying: true };
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
