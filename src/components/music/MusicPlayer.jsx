import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import Api from "../../Api";
import { useStore } from "../../zustand/store";

function MusicPlayer() {
  const {
    musicId,
    isPlaying,
    setIsPlaying,
    setCurrentSong,
    toggleFullScreen,
    setDuration,
    setPlayedSeconds,
    currentSong,
  } = useStore();

  const playerRef = useRef(null);

  useEffect(() => {
    async function loadSong() {
      if (!musicId) return;

      try {
        const res = await Api(`/api/songs/${musicId}`);
        const songData = res.data.data[0];

        if (!songData?.downloadUrl?.[4]?.url) {
          return console.error("No playable URL found.");
        }

        setCurrentSong(songData);
        setTimeout(() => setIsPlaying(true), 200);
      } catch (err) {
        console.error("Failed to fetch song:", err);
      }
    }

    loadSong();
  }, [musicId]);

  return (
    <>
      {/* Floating mini spinning player */}
      {currentSong?.image?.[1]?.url && (
        <button
          onClick={toggleFullScreen}
          className={`fixed bottom-6 right-6 h-16 w-16 rounded-full z-50 shadow-md ${
          isPlaying ? "animate-slowspin" : ""
          }`}
        >
          <img
            src={currentSong.image[1]?.url}
            alt={currentSong.name}
            className="w-full h-full object-cover rounded-full"
          />
        </button>
      )}

      {currentSong?.downloadUrl?.[4]?.url && (
        <ReactPlayer
          ref={playerRef}
          url={currentSong.downloadUrl[4].url}
          playing={isPlaying}
          onProgress={({ playedSeconds }) =>
            setPlayedSeconds(playedSeconds)
          }
          onDuration={(d) => setDuration(d)}
          width="0"
          height="0"
        />
      )}
    </>
  );
}

export default MusicPlayer;