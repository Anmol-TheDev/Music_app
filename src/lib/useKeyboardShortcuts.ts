import { useEffect } from "react";

type Shortcuts = {
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  increaseVolume: () => void;
  decreaseVolume: () => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
};

export default function useKeyboardShortcuts(actions: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      switch (event.code) {
        case "ArrowRight":
          event.preventDefault();
          actions.nextTrack();
          break;
        case "ArrowLeft":
          event.preventDefault();
          actions.prevTrack();
          break;
        case "ArrowUp":
          event.preventDefault();
          actions.increaseVolume();
          break;
        case "ArrowDown":
          event.preventDefault();
          actions.decreaseVolume();
          break;
        default:
          if (event.ctrlKey) {
            switch (event.code) {
              case "Space":
                event.preventDefault();
                actions.togglePlayPause();
                break;
              case "KeyM":
                event.preventDefault();
                actions.toggleMute();
                break;
              case "KeyH":
                event.preventDefault();
                actions.toggleShuffle();
                break;
              default:
                break;
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions]);
}
