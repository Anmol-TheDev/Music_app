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
      console.error("❌ fetchSongs error:", error);
    }
  },

  fetchAlbums: async (search) => {
    try {
      const res = await Api(`/api/search/albums?query=${search}`);
      set({ albums: res.data.data.results || false });
    } catch (error) {
      console.error("❌ fetchAlbums error:", error);
    }
  },

  fetchArtists: async (search) => {
    try {
      const res = await Api(`/api/search/artists?query=${search || "top artists"}`);
      set({ artists: res.data.data.results || false });
    } catch (error) {
      console.error("❌ fetchArtists error:", error);
    }
  },
}));

export const useStore = create((set, get) => ({
  // Global State
  playlist: [],
  musicId: null,
  isPlaying: false,
  queue: [],
  isUser: false,
  dialogOpen: false,
  playedSeconds: 0,
  duration: 0,
  currentSong: null,
  lyrics: "",
  isFullScreen: false,
  volume: Number(localStorage.getItem("volume") ?? 0.5), // ✅ survive mute

  // Fullscreen Controls
  setIsFullScreen: (value) => set({ isFullScreen: value }),
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

  // Playback Controls
  setCurrentSong: (data) => set({ currentSong: data }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),
  setIsPlaying: (prop) => set({ isPlaying: prop }),
  setQueue: (prop) => set({ queue: prop }),
  setPlayedSeconds: (seconds) => set({ playedSeconds: seconds }),
  setDuration: (dur) => set({ duration: dur }),
  setLyrics: (lyrics) => set({ lyrics }),
  setPlayerRef: (ref) => set({ playerRef: ref }),

  // Song Logic
  setPlaylist: (prope) => set((state) => ({ playlist: [...state.playlist, prope] })),
  emptyPlaylist: () => set({ playlist: [] }),

  // Async: Set Music ID → Fetch Audio + Lyrics
  setMusicId: async (id) => {
    set({ musicId: id });

    try {
      const res = await Api(`/api/songs/${id}`);
      const songData = res.data.data?.[0];

      if (!songData || !songData.downloadUrl?.[4]?.url) {
        console.warn("⚠️ Invalid song data:", songData);
        return;
      }

      set({ currentSong: songData });

      // Extract lyrics ID
      let lyricsId =
        songData.perma_url?.split("/").pop()?.replace(".html", "") || songData.id;

      console.log("🎵 Fetching lyrics for:", lyricsId);

      const lyricsRes = await fetch(`https://saavn.dev/songs/${lyricsId}/lyrics`);
      const lyricsJson = await lyricsRes.json();
      console.log("📝 Lyrics response:", lyricsJson);

      const lyricText =
        lyricsJson?.data?.lyrics?.replace(/<[^>]+>/g, "").trim() ||
        "Lyrics not available.";
      set({ lyrics: lyricText });
    } catch (err) {
      console.error("❌ Failed to fetch song or lyrics", err);
      set({ lyrics: "Lyrics not available due to error." });
    }
  },

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

  // Shuffle & Loop Modes
  shuffle: false,
  isLoop: false,
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })),

  // Index-based Queue
  queueIndex: 0,
  setQueueIndex: (i) => set({ queueIndex: i }),

  // Playback Navigation
  nextSongHandler: () => {
    const { queue, musicId, shuffle } = get();
    const currentIndex = queue.findIndex((song) => song.id === musicId);

    if (shuffle && queue.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === currentIndex);
      get().setMusicId(queue[randomIndex].id);
    } else if (currentIndex !== -1 && currentIndex + 1 < queue.length) {
      get().setMusicId(queue[currentIndex + 1].id);
    }
  },

  prevSongHandler: () => {
    const { queue, musicId, shuffle } = get();
    const currentIndex = queue.findIndex((song) => song.id === musicId);

    if (shuffle && queue.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === currentIndex);
      get().setMusicId(queue[randomIndex].id);
    } else if (currentIndex > 0) {
      get().setMusicId(queue[currentIndex - 1].id);
    }
  },
}));