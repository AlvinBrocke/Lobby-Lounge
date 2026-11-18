export interface Track {
  id: string;
  name: string;
  artist?: string;
  image: string;
  /** Seconds, when the catalogue knows it. */
  duration?: number;
  audioUrl?: string; // Optional for now as some mocks might not have it
  category?: string;
  /** 'low' | 'mid' | 'high'; AutoLobby leans on it. */
  energy?: string;
}

export interface User {
  name: string;
  email: string;
  plan: string;
}

/** One play of an announcement, as handed to the player. */
export interface AnnouncementCue {
  /** Announcement id + play slot, unique per play. */
  key: string;
  title: string;
  /** Spoken with text-to-speech when there's no `audioUrl`. */
  message?: string;
  audioUrl?: string;
  voiceName?: string;
  pitch: number;
  speed: number;
  volumeBoost: number;
  interruptMusic: boolean;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  queue: Track[];
  /** The playlist the current queue came from, so its row can show as playing. */
  activePlaylistId: string | null;
  /** The whole active playlist, reshuffled into the queue whenever the queue runs out. */
  playlistTracks: Track[];
  /** Tracks the venue blocked; never queued, skipped if reached. Synced from Convex. */
  blockedIds: string[];
  setBlockedIds: (ids: string[]) => void;
  /** On: a playlist loops forever (reshuffled each pass). Off: it plays through once and stops. */
  repeat: boolean;
  toggleRepeat: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Track) => void;
  /**
   * Plays a playlist: shuffled, or from `startIndex` onward in order. With a
   * `playlistId` it loops (while `repeat` is on), reshuffling when the queue empties.
   */
  playQueue: (tracks: Track[], playlistId?: string, startIndex?: number, auto?: boolean) => void;
  /**
   * When staff last picked music by hand (`setCurrentTrack`, or `playQueue`
   * without `auto`). AutoLobby stands back for a while after it. Epoch ms.
   */
  manualAt: number | null;
  /** AutoLobby's current lean: which energy `nextTrack` prefers, and how far ahead it looks. Null when off or paused. */
  autoLobby: { level: "quiet" | "steady" | "busy" | "peak"; lookahead: number } | null;
  setAutoLobby: (autoLobby: PlayerState["autoLobby"]) => void;
  /** A playlist to switch to when the current track ends (AutoLobby's peak playlist and back). */
  pendingSwitch: { tracks: Track[]; playlistId: string } | null;
  queueSwitch: (tracks: Track[], playlistId: string) => void;
  cancelSwitch: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  /** Moves the queued track at `from` to position `to` (drag-and-drop in "Up Next"). */
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  /** Announcements waiting for their turn (the current song to end, unless they interrupt). */
  pendingAnnouncements: AnnouncementCue[];
  /** The announcement playing now; music is paused until it finishes. */
  announcing: { cue: AnnouncementCue; advanceAfter: boolean } | null;
  queueAnnouncement: (cue: AnnouncementCue) => void;
  /** Plays the first pending announcement. `advanceAfter` moves to the next song when it ends. */
  startAnnouncement: (advanceAfter: boolean) => void;
  finishAnnouncement: () => void;
}
