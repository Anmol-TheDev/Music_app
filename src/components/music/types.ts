import type { Song } from "../../types";

export type RepeatMode = "none" | "one" | "all";

export type QueueItem = Song;

export interface PlayerState {
  musicId: string | null;
  currentSong: Song | null;
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  played: number;
  duration: number;
}
