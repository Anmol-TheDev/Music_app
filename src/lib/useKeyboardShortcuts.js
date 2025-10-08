import { useEffect } from "react";

export default function useKeyboardShortcuts(actions) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      // Ignore shortcuts if the user is typing in an input field.
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Handle Space bar for play/pause (without Ctrl key)
      if (event.code === "Space") {
        event.preventDefault(); // This is the key fix to prevent re-clicking focused buttons
        actions.togglePlayPause();
        return; // Stop further execution
      }

      // Handle other shortcuts that require the Ctrl key
      if (event.ctrlKey) {
        switch (event.code) {
          case "ArrowRight": // Next track
            event.preventDefault();
            actions.nextTrack();
            break;
          case "ArrowLeft": // Previous track
            event.preventDefault();
            actions.prevTrack();
            break;
          case "ArrowUp": // Volume up
            event.preventDefault();
            actions.increaseVolume();
            break;
          case "ArrowDown": // Volume down
            event.preventDefault();
            actions.decreaseVolume();
            break;
          case "KeyM": // Ctrl + M → Mute toggle
            event.preventDefault();
            actions.toggleMute();
            break;
          case "KeyH": // Ctrl + H → Shuffle toggle
            event.preventDefault();
            actions.toggleShuffle();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions]);
}
