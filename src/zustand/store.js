import { create } from "zustand";
import Api from "../Api";

export const useFetch = create((set) => ({
  songs: null,
  albums: null,
  artists: null,
  Topresult: null,

  setTopresult: (props) => set({ Topresult: props }),

  fetchSongs: async (search) => {
    try {
      const res = await Api(`/api/search/songs?query=${search}`);
      const topResult = res.data.data.results[0];

      if (topResult) {
        set({
          Topresult: topResult,
          songs: res.data.data.results.slice(0, 5),
        });

        const suggestionsRes = await fetch(
          `https://jiosaavan-api-2-harsh-patel.vercel.app/api/songs/${topResult.id}/suggestions?limit=30`
        );
        const suggestionsData = await suggestionsRes.json();

        set((state) => ({
          songs: [...state.songs, ...suggestionsData.data],
        }));
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
      set({ albums: res.data.data.results || false });
    } catch (error) {
      console.error(error);
    }
  },

  fetchArtists: async (search) => {
    try {
      const res = await Api(`/api/search/artists?query=${search || "top artists"}`);
      set({ artists: res.data.data.results || false });
    } catch (error) {
      console.error(error);
    }
  },
}));

export const useStore = create((set) => ({
  playlist: [],
  musicId: null,
  isPlaying: false,
  queue: [],
  isUser: false,
  dialogOpen: false,
  playedSeconds: 0,
  duration: 0,
  volume: Number(localStorage.getItem("volume")) || 0.5,
  lyrics: "",

  // Fullscreen
  isFullScreen: false,
  setIsFullScreen: (value) => set({ isFullScreen: value }),
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

  // Current Song
  currentSong: null,
  setCurrentSong: (data) => set({ currentSong: data, musicId: data.id }),

  // Playlist
  setPlaylist: (prope) => set((state) => ({ playlist: [...state.playlist, prope] })),
  emptyPlaylist: () => set({ playlist: [] }),

  // Player
  setPlayerRef: (ref) => set({ playerRef: ref }),
  setMusicId: (id) => set({ musicId: id }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),
  setIsPlaying: (prop) => set({ isPlaying: prop }),
  setQueue: (prop) => set({ queue: prop }),
  setPlayedSeconds: (seconds) => set({ playedSeconds: seconds }),
  setDuration: (dur) => set({ duration: dur }),
  setLyrics: (lyrics) => set({ lyrics }),

  // Seek
  handleSeek: (val) => {
    set({ playedSeconds: Number(val) });
    const video = document.querySelector("video");
    if (video) video.currentTime = Number(val);
  },

  // Volume
  setVolume: (val) => {
    localStorage.setItem("volume", val);
    set({ volume: val });
  },

  // Shuffle & Loop
  shuffle: false,
  isLoop: false,
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })),

  // Queue Index
  queueIndex: 0,
  setQueueIndex: (i) => set({ queueIndex: i }),

  // Playback
  nextSongHandler: () =>
    set((state) => {
      const idx = state.queue.findIndex((s) => s.id === state.musicId);
      if (idx !== -1 && idx + 1 < state.queue.length) {
        return { musicId: state.queue[idx + 1].id, currentSong: state.queue[idx + 1] };
      }
      return state;
    }),

  prevSongHandler: () =>
    set((state) => {
      const idx = state.queue.findIndex((s) => s.id === state.musicId);
      if (idx > 0) {
        return { musicId: state.queue[idx - 1].id, currentSong: state.queue[idx - 1] };
      }
      return state;
    }),
}));
