export interface Track {
  id: string;
  name: string;
  artist?: string;
  image: string;
  /** Seconds, when the catalogue knows it. */
  duration?: number;
  audioUrl?: string; // Optional for now as some mocks might not have it
  category?: string;
}

export interface User {
  name: string;
  email: string;
  plan: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  queue: Track[];
  /** The playlist the current queue came from, so its row can show as playing. */
  activePlaylistId: string | null;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Track) => void;
  /** Plays the first track now and queues the rest. */
  playQueue: (tracks: Track[], playlistId?: string) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  /** Moves the queued track at `from` to position `to` (drag-and-drop in "Up Next"). */
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}
