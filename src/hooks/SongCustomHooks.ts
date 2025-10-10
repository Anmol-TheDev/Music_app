import { useCallback } from "react";
import { useStore } from "../zustand/store";

interface SongClickOptions {
  albumId?: string;
  artistId?: string;
}

export const useSongHandlers = () => {
  // state
  const musicId = useStore((state) => state.musicId);

  // actions
  const setMusicId = useStore((state) => state.setMusicId);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const setAlbumId = useStore((state) => state.setAlbumId);
  const setArtistId = useStore((state) => state.setArtistId);

  const handleSongClick = useCallback(
    (song: { id: string }, options?: SongClickOptions) => {
      if (song.id !== musicId) {
        setMusicId(song.id);
        if (options?.albumId) setAlbumId(options.albumId);
        if (options?.artistId) setArtistId(options.artistId);
      }
      setIsPlaying(true);
    },
    [musicId, setMusicId, setIsPlaying, setAlbumId, setArtistId]
  );

  return {
    handleSongClick,
  };
};
