import { useCallback, useEffect, useState } from "react";
import { useStore } from "../zustand/store";

interface SongClickOptions {
  albumId?: string;
  artistId?: string;
}

interface Song {
  id: string;
  // FIX: Replaced 'any' with 'unknown' for a type-safe index signature
  [key: string]: unknown;
}

export const useSongHandlers = () => {
  const musicId = useStore((state) => state.musicId);
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

export const getTextColor = (color: string): "dark" | "white" => {
  if (!color) return "white";
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  let r: number, g: number, b: number;

  if (rgbMatch) {
    r = parseInt(rgbMatch[1], 10);
    g = parseInt(rgbMatch[2], 10);
    b = parseInt(rgbMatch[3], 10);
  } else {
    const hex = color.replace("#", "");
    const bigint = parseInt(hex, 16);
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "dark" : "white";
};

export const usePlayAll = (
  contextId: string,
  songs: Song[] | undefined,
  contextType: "album" | "artist"
) => {
  const {
    isPlaying,
    setIsPlaying,
    setMusicId,
    setCurrentList,
    currentAlbumId,
    currentArtistId,
    setAlbumId,
    setArtistId,
  } = useStore();

  const currentContextId = contextType === "album" ? currentAlbumId : currentArtistId;
  const setContextId = contextType === "album" ? setAlbumId : setArtistId;

  return useCallback(() => {
    if (currentContextId === contextId) {
      setIsPlaying(!isPlaying);
    } else {
      if (songs && songs.length > 0) {
        setCurrentList(songs);
        setMusicId(songs[0].id);
        setIsPlaying(true);
        setContextId(contextId);
      }
    }
  }, [
    contextId,
    songs,
    currentContextId,
    isPlaying,
    setIsPlaying,
    setMusicId,
    setCurrentList,
    setContextId,
  ]);
};

export const useShuffle = (
  contextId: string,
  songs: Song[] | undefined,
  contextType: "album" | "artist"
) => {
  const { setMusicId, setCurrentList, setIsPlaying, setAlbumId, setArtistId } = useStore();
  const setContextId = contextType === "album" ? setAlbumId : setArtistId;

  return useCallback(() => {
    if (songs && songs.length > 0) {
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      const randomSong = shuffledSongs[0];
      setCurrentList(shuffledSongs);
      setMusicId(randomSong.id);
      setIsPlaying(true);
      setContextId(contextId);
    }
  }, [songs, contextId, setCurrentList, setMusicId, setIsPlaying, setContextId]);
};

export const formatArtist = (
  song: { artists: { primary: Array<{ id: string; name: string }> } },
  check: boolean = false,
  isMobile: boolean = false
): string => {
  if (!song?.artists?.primary) return "";
  const all = song.artists.primary;
  const limit = check ? all.length : isMobile ? 1 : 3;

  const artists = all
    .slice(0, limit)
    .map(
      (artist) =>
        `<a href="/artist?Id=${artist.id}" class="hover:underline">${artist.name.trim()}</a>`
    )
    .join(", ");

  return all.length > limit ? `${artists} & more` : artists;
};

export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};
