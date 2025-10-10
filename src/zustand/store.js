import { create } from "zustand";
import Api from "../Api";

const INITIAL_SONGS_LIMIT = 1;
const SUGGESTIONS_LIMIT = 9;
const BASE_JIOSAAVAN_URL = "https://jiosaavan-api-2-harsh-patel.vercel.app";
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
          `${BASE_JIOSAAVAN_URL}/api/songs/${topResult.id}/suggestions?limit=${SUGGESTIONS_LIMIT}`
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
  songList: [],
  currentList: [],
  previous: [],
  likedSongs: [],
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
  shuffledQueue: [],
  autoPlay: false,

  setPlaylist: (prop) =>
    set((state) => ({
      playlist: [...state.playlist, prop],
    })),
  emptyPlaylist: () => set({ playlist: [] }),
  setAutoPlay: (prop) => set({ autoPlay: prop }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),

  setMusicId: (id) => {
    const { shuffle, currentList } = get();

    if (!Array.isArray(currentList) || currentList.length === 0) return;

    const currentSong = currentList.find((s) => s.id === id);
    if (!currentSong) return console.warn(`Song with id ${id} not found`);
    const newQueue = currentList.slice(currentList.indexOf(currentSong) + 1);
    const newState = {
      musicId: id,
      currentSong,
      queue: newQueue,
      songList: currentList,
      currentAlbumId: null,
      currentArtistId: null,
      played: 0,
      isPlaying: false,
      autoPlay: false,
      shuffleHistory: shuffle ? [currentSong] : [],
      shuffledQueue: shuffle ? [...newQueue].sort(() => Math.random() - 0.5) : [],
      previous: [],
    };

    set(newState);
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

    set({
      queue: prop,
      shuffledQueue: filteredShuffledQueue,
      shuffleHistory: preservedHistory,
    });
  },

  setCurrentList: (prop) => {
    set({
      currentList: prop,
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

      if (currentSong) {
        shuffleHistory = [currentSong];
      }

      set({
        shuffle: true,
        shuffledQueue: filteredShuffledQueue,
        shuffleHistory: shuffleHistory,
      });
    } else {
      set({
        shuffle: false,
        shuffledQueue: [],
        shuffleHistory: [],
      });
    }
  },
  setRepeat: (repeat) => set({ repeat }),
  setPlayed: (played) => set({ played }),
  setDuration: (duration) => set({ duration }),

  addToQueue: (song) => {
    const { autoPlay } = get();
    if (autoPlay) {
      set({
        queue: [song],
        autoPlay: false,
      });
      return;
    } else {
      set((state) => ({
        queue: [...state.queue, song],
      }));
    }
  },

  addToQueueNext: (song) =>
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.unshift(song);

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
      songList,
      shuffle,
      repeat,
      shuffleHistory,
      shuffledQueue,
      previous,
      currentSong,
    } = get();

    if (repeat === "one") {
      set({ played: 0 });
      return;
    }

    if (queue.length === 0) {
      if (repeat === "all") {
        set({
          musicId: songList[0].id,
          currentSong: songList[0],
          queue: songList.slice(1),
          played: 0,
          isPlaying: false,
          previous: [...previous, currentSong],
        });
      } else {
        const { currentSong, currentAlbumId, currentArtistId } = get();

        if (currentAlbumId === null && currentArtistId === null && currentSong?.id) {
          (async () => {
            try {
              const res = await fetch(
                `${BASE_JIOSAAVAN_URL}/api/songs/${currentSong.id}/suggestions?limit=10`
              );
              const data = await res.json();
              const suggested = data?.data || [];

              if (suggested.length > 0) {
                const [first, ...rest] = suggested;
                set({
                  queue: rest,
                  musicId: first.id,
                  currentSong: first,
                  played: 0,
                  isPlaying: true,
                  autoPlay: true,
                });
              }
            } catch (error) {
              console.error("Failed to fetch suggested songs:", error);
            }
          })();
        }
        return;
      }
    }

    if (shuffle) {
      if (shuffledQueue.length === 0) {
        if (repeat === "all") {
          const newShuffledQueue = [...songList].sort(() => Math.random() - 0.5);
          const firstSong = newShuffledQueue[0];
          const remainingQueue = newShuffledQueue.slice(1);

          set({
            shuffledQueue: remainingQueue,
            shuffleHistory: [...shuffleHistory, firstSong],
            musicId: firstSong.id,
            currentSong: firstSong,
            played: 0,
            isPlaying: false,
          });
        }
        return;
      }

      let nextSong = shuffledQueue[0];

      set({
        shuffleHistory: [...shuffleHistory, currentSong],
        shuffledQueue: shuffledQueue.slice(1),
        musicId: nextSong.id,
        currentSong: nextSong,
        played: 0,
        isPlaying: false,
      });
    } else {
      let nextSong = queue[0];
      set({
        musicId: nextSong?.id,
        currentSong: nextSong,
        played: 0,
        isPlaying: false,
        queue: queue.slice(1),
        previous: [...previous, currentSong],
      });
    }
  },

  playPrevious: () => {
    const { queue, shuffle, shuffleHistory, shuffledQueue, previous, currentSong } = get();

    if (shuffle) {
      const newHistory = [...shuffleHistory];
      const newShuffledQueue = [...shuffledQueue];
      newShuffledQueue.unshift(currentSong);
      if (shuffleHistory.length === 0) {
        set({
          shuffledQueue: newShuffledQueue,
          played: 0,
        });
        return;
      }
      const prevSong = newHistory.pop();

      set({
        musicId: prevSong?.id,
        currentSong: prevSong,
        played: 0,
        isPlaying: false,
        shuffledQueue: newShuffledQueue,
        shuffleHistory: newHistory,
      });
    } else {
      const newPrevious = [...previous];
      const newQueue = [...queue];
      if (newPrevious.length === 0) {
        set({ played: 0 });
        return;
      }
      const prevSong = newPrevious.pop();
      newQueue.unshift(currentSong);

      set({
        musicId: prevSong.id,
        currentSong: prevSong,
        played: 0,
        isPlaying: false,
        queue: newQueue,
        previous: newPrevious,
      });
    }
  },

  handleSongEnd: () => {
    const { repeat, playNext } = get();
    if (repeat === "one") set({ played: 0 });
    else playNext();
  },
}));
