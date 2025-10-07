import { create } from "zustand";
import Api from "../Api";

type Song = any;

type FetchState = {
  songs: Song[] | null | false;
  albums: any[] | null | false;
  artists: any[] | null | false;
  Topresult: any | null;
  setTopresult: (props: any) => void;
  fetchSongs: (search: string, setMusicId?: (id: string) => void) => Promise<void>;
  fetchAlbums: (search: string) => Promise<void>;
  fetchArtists: (search?: string) => Promise<void>;
};

export const useFetch = create<FetchState>((set) => ({
  songs: null,
  albums: null,
  artists: null,
  Topresult: null,
  setTopresult: (props) => set({ Topresult: props }),
  fetchSongs: async (search) => {
    try {
      const res = await Api(`/api/search/songs?query=${search}`);
      if ((res as any).data.data.results[0]) {
        const topResult = (res as any).data.data.results[0];
        const initialSongs = (res as any).data.data.results.slice(0, 5);
        const suggestionsRes = await fetch(
          `https://jiosaavan-api-2-harsh-patel.vercel.app/api/songs/${topResult.id}/suggestions?limit=30`
        );
        const suggestionsData = await suggestionsRes.json();
        const allSongs = [...initialSongs, ...suggestionsData.data];
        const uniqueSongsMap = new Map<string, any>();
        allSongs.forEach((song: any) => {
          if (!uniqueSongsMap.has(song.id)) {
            uniqueSongsMap.set(song.id, song);
          }
        });
        const uniqueSongs = Array.from(uniqueSongsMap.values());
        set({ Topresult: topResult, songs: uniqueSongs });
      } else {
        set({ songs: false });
      }
    } catch (error) {
      console.error(error);
    }
  },
  fetchAlbums: async (search) => {
    try {
      const res = await Api(`/api/search/albums?query=${search}`);
      if ((res as any).data.data.results[0]) {
        set({ albums: (res as any).data.data.results });
      } else set({ albums: false });
    } catch (error) {
      console.log(error);
    }
  },
  fetchArtists: async (search) => {
    try {
      const res = await Api(`/api/search/artists?query=${search || "top artists"} `);
      if ((res as any).data.data.results[0]) {
        set({ artists: (res as any)?.data?.data?.results });
      } else set({ artists: false });
    } catch (error) {
      console.log(error);
    }
  },
}));

type RepeatMode = "none" | "one" | "all";

type StoreState = {
  playlist: any[];
  isUser: boolean;
  dialogOpen: boolean;
  musicId: string | null;
  currentAlbumId: string | null;
  currentArtistId: string | null;
  currentSong: any | null;
  isPlaying: boolean;
  queue: any[];
  likedSongs: string[];
  currentIndex: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  played: number;
  duration: number;
  setPlaylist: (prope: any) => void;
  emptyPlaylist: () => void;
  setIsUser: (prop: boolean) => void;
  setDialogOpen: (prop: boolean) => void;
  setMusicId: (id: string) => void;
  setAlbumId: (id: string | null) => void;
  setArtistId: (id: string | null) => void;
  setCurrentSong: (song: any) => void;
  setIsPlaying: (prop: boolean) => void;
  setQueue: (prop: any[]) => void;
  setLikedSongs: (songs: string[]) => void;
  addLikedSong: (songId: string) => void;
  removeLikedSong: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: RepeatMode) => void;
  setPlayed: (played: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (song: any) => void;
  addToQueueNext: (song: any) => void;
  playNext: () => void;
  playPrevious: () => void;
  handleSongEnd: () => void;
};

export const useStore = create<StoreState>((set, get) => ({
  playlist: [],
  isUser: false,
  dialogOpen: false,
  musicId: null,
  currentAlbumId: null,
  currentArtistId: null,
  currentSong: null,
  isPlaying: false,
  queue: [],
  likedSongs: [],
  currentIndex: 0,
  volume:
    typeof window !== "undefined"
      ? localStorage.getItem("volume") === null
        ? 0.5
        : Number.parseFloat(localStorage.getItem("volume") || "0.5")
      : 0.5,
  muted: false,
  shuffle: false,
  repeat: "none",
  played: 0,
  duration: 0,

  setPlaylist: (prope) => set((state) => ({ playlist: [...state.playlist, prope] })),
  emptyPlaylist: () => set({ playlist: [] }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),

  setMusicId: (id) => {
    const { queue } = get();
    const newIndex = queue.findIndex((song: any) => song.id === id);
    const currentSong = queue.find((song: any) => song.id === id);
    set({
      musicId: id,
      currentAlbumId: null,
      currentArtistId: null,
      currentSong: currentSong || null,
      currentIndex: newIndex >= 0 ? newIndex : 0,
      played: 0,
      isPlaying: false,
    });
  },

  setAlbumId: (id) => set({ currentAlbumId: id }),
  setArtistId: (id) => set({ currentArtistId: id }),
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (prop) => set({ isPlaying: prop }),
  setQueue: (prop) => set({ queue: prop, currentIndex: 0 }),
  setLikedSongs: (songs) => set({ likedSongs: songs }),
  addLikedSong: (songId) => set((state) => ({ likedSongs: [...state.likedSongs, songId] })),
  removeLikedSong: (songId) =>
    set((state) => ({ likedSongs: state.likedSongs.filter((id) => id !== songId) })),
  isLiked: (songId) => get().likedSongs.includes(songId),

  setVolume: (volume) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume.toString());
    }
    set({ volume, muted: false });
  },
  setMuted: (muted) => set({ muted }),
  setShuffle: (shuffle) => set({ shuffle }),
  setRepeat: (repeat) => set({ repeat }),
  setPlayed: (played) => set({ played }),
  setDuration: (duration) => set({ duration }),

  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

  addToQueueNext: (song) =>
    set((state) => {
      const insertPos = Math.min(state.currentIndex + 1, state.queue.length);
      const newQueue = [...state.queue];
      newQueue.splice(insertPos, 0, song);
      return { queue: newQueue };
    }),

  playNext: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;
    if (repeat === "one") {
      set({ played: 0 });
      return;
    }
    let nextIndex: number;
    if (shuffle) nextIndex = Math.floor(Math.random() * queue.length);
    else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") nextIndex = 0;
        else return;
      }
    }
    set({ currentIndex: nextIndex, musicId: queue[nextIndex]?.id, played: 0, isPlaying: false });
  },

  playPrevious: () => {
    const { queue, currentIndex, shuffle } = get();
    if (queue.length === 0) return;
    let prevIndex: number;
    if (shuffle) prevIndex = Math.floor(Math.random() * queue.length);
    else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = queue.length - 1;
    }
    set({ currentIndex: prevIndex, musicId: queue[prevIndex]?.id, played: 0, isPlaying: false });
  },

  handleSongEnd: () => {
    const { repeat, playNext } = get();
    if (repeat === "one") set({ played: 0 });
    else playNext();
  },
}));
