import { create } from "zustand";
import { PlayerState } from "@/types";

const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 50,
  queue: [],
  activePlaylistId: null,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  // A single hand-picked track isn't "playing a playlist" any more.
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true, activePlaylistId: null }),
  playQueue: (tracks, playlistId) => {
    const [first, ...rest] = tracks;
    if (!first) return;
    set({ currentTrack: first, queue: rest, isPlaying: true, activePlaylistId: playlistId ?? null });
  },
  setVolume: (volume) => set({ volume }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [] }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextTrack: () =>
    set((state) => {
      if (state.queue.length === 0) return { isPlaying: false, currentTrack: null };
      const [next, ...rest] = state.queue;
      return { currentTrack: next, queue: rest, isPlaying: true };
    }),

  previousTrack: () => {
    // No-op for now: restarts the current track by toggling isPlaying.
    // The audio element in PlayerBar handles seeking to 0 on track load.
  },
}));

export default usePlayerStore;
