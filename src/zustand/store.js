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

      if (res.data.data.results[0]) {
        const topResult = res.data.data.results[0];
        set({
          Topresult: topResult,
          songs: res.data.data.results.slice(0, 5),
        });

        // Fetch suggestions for this song
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
      if (res.data.data.results[0]) {
        set({ albums: res.data.data.results });
      } else set({ albums: false });
    } catch (error) {
      console.log(error);
    }
  },
  fetchArtists: async (search) => {
    try {
      const res = await Api(
        `/api/search/artists?query=${search || "top artists"} `
      );
      if (res.data.data.results[0]) {
        set({ artists: res?.data?.data?.results });
      } else set({ artists: false });
    } catch (error) {
      console.log(error);
    }
  },
}));

export const useStore = create((set, get) => ({
  // User and UI state
  playlist: [],
  isUser: false,
  dialogOpen: false,
  
  // Music playback state - centralized
  musicId: null,
  currentSong: null,
  isPlaying: false,
  queue: [],
  likedSongs: [],
  currentIndex: 0,
  
  // Audio controls
  volume: typeof window !== 'undefined' ? 
    (localStorage.getItem("volume") === null ? 0.5 : parseFloat(localStorage.getItem("volume"))) : 0.5,
  muted: false,
  shuffle: false,
  repeat: 'none', // 'none', 'one', 'all'
  
  // Progress tracking
  played: 0,
  duration: 0,
  
  // Basic setters
  setPlaylist: (prope) =>
    set((state) => ({
      playlist: [...state.playlist, prope],
    })),
  emptyPlaylist: () => set({ playlist: [] }),
  setIsUser: (prop) => set({ isUser: prop }),
  setDialogOpen: (prop) => set({ dialogOpen: prop }),
  
  // Music playback setters
  setMusicId: (id) => {
    const { queue } = get();
    const newIndex = queue.findIndex(song => song.id === id);
    const currentSong = queue.find(song => song.id === id);
    
    set({ 
      musicId: id, 
      currentSong: currentSong || null, // Set current song object from queue
      currentIndex: newIndex >= 0 ? newIndex : 0, // Update index if song found in queue
      played: 0, // Reset progress when switching songs
      isPlaying: false // Stop current song when switching
    });
  },
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (prop) => set({ isPlaying: prop }),
  setQueue: (prop) => set({ queue: prop, currentIndex: 0 }),
  setLikedSongs: (songs) => set({ likedSongs: songs }),
  addLikedSong: (songId) => 
    set((state) => ({
      likedSongs: [...state.likedSongs, songId]
    })),
  removeLikedSong: (songId) =>
    set((state) => ({
      likedSongs: state.likedSongs.filter(id => id !== songId)
    })),
  isLiked: (songId) => {
    const state = get();
    return state.likedSongs.includes(songId);
  },
  
  // Audio control setters with persistence
  setVolume: (volume) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("volume", volume.toString());
    }
    set({ volume, muted: false });
  },
  setMuted: (muted) => set({ muted }),
  setShuffle: (shuffle) => set({ shuffle }),
  setRepeat: (repeat) => set({ repeat }),
  
  // Progress setters
  setPlayed: (played) => set({ played }),
  setDuration: (duration) => set({ duration }),
  
  // Complex actions
  playNext: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    
    if (queue.length === 0) return;
    
    if (repeat === 'one') {
      // Replay current song
      set({ played: 0 });
      return;
    }
    
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return; // End of queue
        }
      }
    }
    
    set({ 
      currentIndex: nextIndex, 
      musicId: queue[nextIndex]?.id,
      played: 0,
      isPlaying: false // Will be set to true by the component after loading
    });
  },
  
  playPrevious: () => {
    const { queue, currentIndex, shuffle } = get();
    
    if (queue.length === 0) return;
    
    let prevIndex;
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1; // Loop to end
      }
    }
    
    set({ 
      currentIndex: prevIndex, 
      musicId: queue[prevIndex]?.id,
      played: 0,
      isPlaying: false // Will be set to true by the component after loading
    });
  },
  
  handleSongEnd: () => {
    const { repeat, playNext } = get();
    if (repeat === 'one') {
      set({ played: 0 });
    } else {
      playNext();
    }
  }
}));
