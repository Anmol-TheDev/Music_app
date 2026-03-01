import { create } from "zustand";

const usePlayerProgressStore = create((set) => ({
  played: 0,
  duration: 0,
  setPlayed: (played) => set({ played }),
  setDuration: (duration) => set({ duration }),
}));

export default usePlayerProgressStore;
