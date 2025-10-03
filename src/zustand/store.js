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

export const useStore = create((set, get) => ({
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
  currentSong: null,

  // Fullscreen
  isFullScreen: false,
  setIsFullScreen: (value) => set({ isFullScreen: value }),
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

  // Playlist
  setPlaylist: (prope) => set((state) => ({ playlist: [...state.playlist, prope] })),
  emptyPlaylist: () => set({ playlist: [] }),

  // Main song logic
  setMusicId: async (id) => {
    set({ musicId: id });

    try {
      const res = await Api(`/api/songs/${id}`);
      const songData = res.data.data[0];
      if (!songData) return;

      set({ currentSong: songData });

      // SAFELY extract the lyrics ID from the perma_url
      let songLyricsId = songData.id;

      // Try to extract from song.perma_url if needed
      if (!songLyricsId || typeof songLyricsId !== "string") {
        const extracted = songData.perma_url?.split("/")?.pop()?.replace(".html", "");
        if (extracted) songLyricsId = extracted;
      }

      console.log("🎵 Lyrics ID used:", songLyricsId);

      const lyricsRes = await fetch(`https://saavn.dev/songs/${songLyricsId}/lyrics`);
      const lyricsJson = await lyricsRes.json();
      console.log("📝 Lyrics API response:", lyricsJson);

      const lyricText =
        lyricsJson?.data?.lyrics?.replace(/<[^>]+>/g, "").trim() ||
        "Lyrics not available.";
      set({ lyrics: lyricText });
    } catch (err) {
      console.error("❌ Failed to fetch song/lyrics", err);
      set({ lyrics: "Lyrics not available." });
    }
  },

  // Controls
  setCurrentSong: (data) => set({ currentSong: data }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),
  setIsPlaying: (prop) => set({ isPlaying: prop }),
  setQueue: (prop) => set({ queue: prop }),
  setPlayedSeconds: (seconds) => set({ playedSeconds: seconds }),
  setDuration: (dur) => set({ duration: dur }),
  setLyrics: (lyrics) => set({ lyrics }),
  setPlayerRef: (ref) => set({ playerRef: ref }),

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

  // Navigation
  queueIndex: 0,
  setQueueIndex: (i) => set({ queueIndex: i }),

  // Skip controls
  nextSongHandler: () => {
    const state = get();
    const idx = state.queue.findIndex((s) => s.id === state.musicId);
    if (idx !== -1 && idx + 1 < state.queue.length) {
      get().setMusicId(state.queue[idx + 1].id);
    }
  },
  prevSongHandler: () => {
    const state = get();
    const idx = state.queue.findIndex((s) => s.id === state.musicId);
    if (idx > 0) {
      get().setMusicId(state.queue[idx - 1].id);
    }
  },
}));