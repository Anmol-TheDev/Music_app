import { useCallback, useEffect, useState } from "react";
import { useStore } from "../zustand/store";

interface SongClickOptions {
  albumId?: string;
  artistId?: string;
}

interface Song {
  id: string;
  [key: string]: any;
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

/**
 * Calculate luminance from RGB color and determine appropriate text color
 */
export const getTextColor = (rgbColor: string): "dark" | "white" => {
  // Extract RGB values from rgb(r, g, b) string
  const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "white";

  const r = Number.parseInt(match[1]);
  const g = Number.parseInt(match[2]);
  const b = Number.parseInt(match[3]);

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // If luminance > 0.6, use dark text, otherwise use white text
  return luminance > 0.6 ? "dark" : "white";
};

/**
 * Hook to handle Play All functionality for albums and artists
 */
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

  const handlePlayAll = useCallback(() => {
    if (currentContextId == contextId) {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    } else {
      if (songs?.length && songs.length > 0) {
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

  return handlePlayAll;
};

/**
 * Hook to handle Shuffle functionality
 */
export const useShuffle = (
  contextId: string,
  songs: Song[] | undefined,
  contextType: "album" | "artist"
) => {
  const { setMusicId, setIsPlaying, setAlbumId, setArtistId } = useStore();
  const setContextId = contextType === "album" ? setAlbumId : setArtistId;

  const handleShuffle = useCallback(() => {
    if (songs?.length && songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setMusicId(songs[randomIndex].id);
      setIsPlaying(true);
      setContextId(contextId);
    }
  }, [songs, contextId, setMusicId, setIsPlaying, setContextId]);

  return handleShuffle;
};

/**
 * Format artist names with links
 */
export const formatArtist = (
  song: { artists: { primary: Array<{ id: string; name: string }> } },
  check: boolean = false,
  isMobile: boolean = false
): string => {
  const all = song.artists.primary;
  const x = check ? all.length : isMobile ? 1 : 3;

  const artists = all
    .slice(0, x)
    .map(
      (artist) =>
        `<a href="/artist?Id=${artist.id}" class="hover:underline">${artist.name.trim()}</a>`
    )
    .join(", ");

  return all.length > x ? `${artists} & more` : artists;
};

/**
 * Hook to detect mobile screen size
 */
export const useIsMobile = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [breakpoint]);

  return isMobile;
};
