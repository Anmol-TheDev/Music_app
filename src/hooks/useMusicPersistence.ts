import { useStore } from "@/zustand/store";
import { useEffect } from "react";

// Define a basic type for a Song object
interface Song {
  id: string;
  [key: string]: unknown;
}

// Define the shape of the state we're using from the store
interface MusicPersistenceState {
  currentSong: Song | null;
  restoreState: () => Promise<void>;
  persistState: () => Promise<void>;
}

export const useMusicPersistence = (): void => {
  // FIX: Replaced 'any' with the specific 'MusicPersistenceState' type
  const { currentSong, restoreState, persistState }: MusicPersistenceState = useStore();

  // Restore state when app loads
  useEffect(() => {
    restoreState();
  }, [restoreState]);

  // Persist only when current song changes
  useEffect(() => {
    if (currentSong) {
      persistState();
    }
  }, [currentSong, persistState]);
};
