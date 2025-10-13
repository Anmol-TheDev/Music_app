import { indexedDBUtils, PlaybackData } from "../lib/IndexedDBUtils";

const STORE_NAME = "playback";
const STATE_KEY = "state";

export async function persistMusicState(currentSong: any | null): Promise<void> {
  const data: PlaybackData = {
    id: STATE_KEY,
    currentSong,
  };

  try {
    await indexedDBUtils.save<PlaybackData>(STORE_NAME, data);
  } catch (err) {
    console.error("Failed to persist music state:", err);
  }
}

export async function restoreMusicState(): Promise<PlaybackData | null> {
  try {
    return await indexedDBUtils.get<PlaybackData>(STORE_NAME, STATE_KEY);
  } catch (err) {
    console.error("Failed to restore music state:", err);
    return null;
  }
}

export async function clearMusicState(): Promise<void> {
  try {
    await indexedDBUtils.clear(STORE_NAME);
  } catch (err) {
    console.error("Failed to clear music state:", err);
  }
}
