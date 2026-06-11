export interface Track {
  id: string;
  name: string;
  image: string;
  audioUrl?: string; // Optional for now as some mocks might not have it
  category?: string;
}

export interface Channel {
  id: string;
  name: string;
  image: string;
  color?: string; // Optional for mood channels
  audioUrl?: string;
  category?: string;
}

export interface User {
  name: string;
  email: string;
  plan: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | Channel | null;
  volume: number;
  queue: Track[];
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Track | Channel) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}
