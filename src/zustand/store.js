import { create } from "zustand";
import Api from "../Api";

// Constants
const INITIAL_SONGS_LIMIT = 5;
const SUGGESTIONS_LIMIT = 30;
export const useFetch = create((set) => ({
  songs: null,
  albums: null,
  artists: null,
  Topresult: null,
  setTopresult: (props) => set({ Topresult: props }),
  fetchSongs: async (search) => {
    try {
      const res = await Api(`/api/search/songs?query=${search}`);

      if (res.data.data.results[0]) {
        const topResult = res.data.data.results[0];
        const initialSongs = res.data.data.results.slice(0, INITIAL_SONGS_LIMIT);

        const suggestionsRes = await fetch(
          `https://jiosaavan-api-2-harsh-patel.vercel.app/api/songs/${topResult.id}/suggestions?limit=${SUGGESTIONS_LIMIT}`
        );
        const suggestionsData = await suggestionsRes.json();

        const allSongs = [...initialSongs, ...suggestionsData.data];
        const uniqueSongsMap = new Map();

        allSongs.forEach((song) => {
          if (!uniqueSongsMap.has(song.id)) {
            uniqueSongsMap.set(song.id, song);
          }
        });

        const uniqueSongs = Array.from(uniqueSongsMap.values());

        set({
          Topresult: topResult,
          songs: uniqueSongs,
        });
      } else {
        set({
          songs: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
  },

  fetchAlbums: async (search) => {
    try {
      const res = await Api(`/api/search/albums?query=${search}`);
      if (res.data.data.results[0]) {
        set({ albums: res.data.data.results });
      } else set({ albums: false });
    } catch (error) {
      console.error(error);
    }
  },
  fetchArtists: async (search) => {
    try {
      const res = await Api(`/api/search/artists?query=${search || "top artists"} `);
      if (res.data.data.results[0]) {
        set({ artists: res?.data?.data?.results });
      } else set({ artists: false });
    } catch (error) {
      console.error(error);
    }
  },
}));

export const useStore = create((set, get) => ({
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
        : Number.parseFloat(localStorage.getItem("volume"))
      : 0.5,
  muted: false,
  shuffle: false,
  repeat: "none",
  played: 0,
  duration: 0,
  shuffleHistory: [],
  shuffleHistoryIndex: -1,
  shuffledQueue: [],

  setPlaylist: (prop) =>
    set((state) => ({
      playlist: [...state.playlist, prop],
    })),
  emptyPlaylist: () => set({ playlist: [] }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),

  setMusicId: (id) => {
    const { queue, shuffle, shuffleHistory, shuffleHistoryIndex } = get();
    const newIndex = queue.findIndex((song) => song.id === id);
    const currentSong = queue.find((song) => song.id === id);

    if (!currentSong) {
      console.warn(`Song with id ${id} not found in queue`);
      return;
    }

    if (shuffle) {
      let newShuffleHistory = [...shuffleHistory];
      let newShuffleHistoryIndex = shuffleHistoryIndex;

      newShuffleHistory = [...shuffleHistory, currentSong];
      newShuffleHistoryIndex = newShuffleHistory.length - 1;

      set({
        musicId: id,
        currentAlbumId: null,
        currentArtistId: null,
        currentSong: currentSong,
        currentIndex: newIndex >= 0 ? newIndex : 0,
        played: 0,
        isPlaying: false,
        shuffleHistory: newShuffleHistory,
        shuffleHistoryIndex: newShuffleHistoryIndex,
      });
    } else {
      set({
        musicId: id,
        currentAlbumId: null,
        currentArtistId: null,
        currentSong: currentSong,
        currentIndex: newIndex >= 0 ? newIndex : 0,
        played: 0,
        isPlaying: false,
      });
    }
  },

  setAlbumId: (id) => set({ currentAlbumId: id }),
  setArtistId: (id) => set({ currentArtistId: id }),
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (prop) => set({ isPlaying: prop }),
  setQueue: (prop) => {
    const { shuffle, currentSong } = get();
    const shuffledQueue = [...prop].sort(() => Math.random() - 0.5);

    const filteredShuffledQueue =
      shuffle && currentSong
        ? shuffledQueue.filter((song) => song.id !== currentSong.id)
        : shuffledQueue;

    const preservedHistory = shuffle && currentSong ? [currentSong] : [];
    const preservedIndex = shuffle && currentSong ? 0 : -1;

    set({
      queue: prop,
      currentIndex: 0,
      shuffledQueue: filteredShuffledQueue,
      shuffleHistory: preservedHistory,
      shuffleHistoryIndex: preservedIndex,
    });
  },
  setLikedSongs: (songs) => set({ likedSongs: songs }),
  addLikedSong: (songId) =>
    set((state) => ({
      likedSongs: [...state.likedSongs, songId],
    })),
  removeLikedSong: (songId) =>
    set((state) => ({
      likedSongs: state.likedSongs.filter((id) => id !== songId),
    })),
  isLiked: (songId) => get().likedSongs.includes(songId),

  setVolume: (volume) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume.toString());
    }
    set({ volume, muted: false });
  },
  setMuted: (muted) => set({ muted }),
  setShuffle: (shuffle) => {
    const { queue, currentSong } = get();
    if (shuffle) {
      const shuffledQueue = [...queue].sort(() => Math.random() - 0.5);

      const filteredShuffledQueue = currentSong
        ? shuffledQueue.filter((song) => song.id !== currentSong.id)
        : shuffledQueue;

      let shuffleHistory = [];
      let shuffleHistoryIndex = -1;

      if (currentSong) {
        shuffleHistory = [currentSong];
        shuffleHistoryIndex = 0;
      }

      set({
        shuffle: true,
        shuffledQueue: filteredShuffledQueue,
        shuffleHistory: shuffleHistory,
        shuffleHistoryIndex: shuffleHistoryIndex,
      });
    } else {
      set({
        shuffle: false,
        shuffledQueue: [],
        shuffleHistory: [],
        shuffleHistoryIndex: -1,
      });
    }
  },
  setRepeat: (repeat) => set({ repeat }),
  setPlayed: (played) => set({ played }),
  setDuration: (duration) => set({ duration }),

  addToQueue: (song) =>
    set((state) => ({
      queue: [...state.queue, song],
    })),

  addToQueueNext: (song) =>
    set((state) => {
      const insertPos = Math.min(state.currentIndex + 1, state.queue.length);
      const newQueue = [...state.queue];
      newQueue.splice(insertPos, 0, song);

      // Update shuffled queue if shuffle is active
      let newShuffledQueue = state.shuffledQueue;
      if (state.shuffle) {
        newShuffledQueue = [...state.shuffledQueue, song].sort(() => Math.random() - 0.5);
      }

      return {
        queue: newQueue,
        shuffledQueue: newShuffledQueue,
      };
    }),

  playNext: () => {
    const {
      queue,
      currentIndex,
      shuffle,
      repeat,
      shuffleHistory,
      shuffleHistoryIndex,
      shuffledQueue,
    } = get();
    if (queue.length === 0) return;

    if (repeat === "one") {
      set({ played: 0 });
      return;
    }

    if (shuffle) {
      const nextHistoryIndex = shuffleHistoryIndex + 1;

      if (nextHistoryIndex < shuffleHistory.length) {
        const nextSong = shuffleHistory[nextHistoryIndex];
        set({
          shuffleHistoryIndex: nextHistoryIndex,
          musicId: nextSong.id,
          currentSong: nextSong,
          played: 0,
          isPlaying: false,
        });
      } else {
        if (shuffledQueue.length === 0) {
          if (repeat === "all") {
            const newShuffledQueue = [...queue].sort(() => Math.random() - 0.5);
            const firstSong = newShuffledQueue[0];
            const remainingQueue = newShuffledQueue.slice(1);

            set({
              shuffledQueue: remainingQueue,
              shuffleHistory: [firstSong],
              shuffleHistoryIndex: 0,
              musicId: firstSong.id,
              currentSong: firstSong,
              played: 0,
              isPlaying: false,
            });
          }
          return;
        }

        const randomIndex = Math.floor(Math.random() * shuffledQueue.length);
        const nextSong = shuffledQueue[randomIndex];

        const newShuffleHistory = [...shuffleHistory, nextSong];
        const newShuffledQueue = shuffledQueue.filter((_, index) => index !== randomIndex);

        set({
          shuffleHistory: newShuffleHistory,
          shuffleHistoryIndex: newShuffleHistory.length - 1,
          shuffledQueue: newShuffledQueue,
          musicId: nextSong.id,
          currentSong: nextSong,
          played: 0,
          isPlaying: false,
        });
      }
    } else {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") nextIndex = 0;
        else return;
      }
      set({
        currentIndex: nextIndex,
        musicId: queue[nextIndex]?.id,
        currentSong: queue[nextIndex],
        played: 0,
        isPlaying: false,
      });
    }
  },

  playPrevious: () => {
    const { queue, currentIndex, shuffle, shuffleHistory, shuffleHistoryIndex } = get();
    if (queue.length === 0) return;

    if (shuffle) {
      if (shuffleHistoryIndex > 0) {
        const prevSong = shuffleHistory[shuffleHistoryIndex - 1];
        set({
          shuffleHistoryIndex: shuffleHistoryIndex - 1,
          musicId: prevSong.id,
          currentSong: prevSong,
          played: 0,
          isPlaying: false,
        });
      } else if (shuffleHistoryIndex === 0) {
        const firstSong = shuffleHistory[0];
        set({
          musicId: firstSong.id,
          currentSong: firstSong,
          played: 0,
          isPlaying: false,
        });
      }
    } else {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = queue.length - 1;
      set({
        currentIndex: prevIndex,
        musicId: queue[prevIndex]?.id,
        currentSong: queue[prevIndex],
        played: 0,
        isPlaying: false,
      });
    }
  },

  handleSongEnd: () => {
    const { repeat, playNext } = get();
    if (repeat === "one") set({ played: 0 });
    else playNext();
  },
}));
