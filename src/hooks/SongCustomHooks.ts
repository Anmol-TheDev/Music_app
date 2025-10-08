import { useCallback } from "react";
import { useStore } from "../zustand/store";

interface SongClickOptions {
  albumId?: string;
  artistId?: string;
}

export const useSongHandlers = () => {
  // state
  const musicId = useStore((state) => state.musicId);
  const isPlaying = useStore((state) => state.isPlaying);

  // actions
  const setMusicId = useStore((state) => state.setMusicId);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const setAlbumId = useStore((state) => state.setAlbumId);
  const setArtistId = useStore((state) => state.setArtistId);

  const handleSongClick = useCallback(
    (song: { id: string }, options?: SongClickOptions) => {
      console.log("song id: ", song.id, " options: ", options);
      if (song.id !== musicId) {
        setMusicId(song.id);
        if (options?.albumId) setAlbumId(options.albumId);
        if (options?.artistId) setArtistId(options.artistId);
      }
      setIsPlaying(true);
    },
    [musicId, isPlaying, setMusicId, setIsPlaying, setAlbumId, setArtistId]
  );

  return {
    handleSongClick,
  };
};
