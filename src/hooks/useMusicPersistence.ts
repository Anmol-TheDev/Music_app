import { useStore } from "@/zustand/store";
import { useEffect } from "react";

/**
 * The Comments are added in order to make it easy for developers to debug any issues or make changes.
 */

export const useMusicPersistence = (): void => {
  const { currentSong, restoreState, persistState }: any = useStore();

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
