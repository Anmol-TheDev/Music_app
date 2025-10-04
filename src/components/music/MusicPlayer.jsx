import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import Api from "../../Api";
import { useStore } from "../../zustand/store";

export default function MusicPlayer() {
  const {
    musicId,
    setMusicId,
    isPlaying,
    setIsPlaying,
    currentSong,
    setCurrentSong,
    setDuration,
    setPlayedSeconds,
    volume,
    nextSongHandler,
    queue,
    shuffle,
    isLoop,
    toggleFullScreen,
  } = useStore();

  const playerRef = useRef(null);

  useEffect(() => {
    async function loadSong() {
      if (!musicId) return;

      try {
        const res = await Api(`/api/songs/${musicId}`);
        const songData = res.data.data?.[0];

        if (!songData?.downloadUrl?.[4]?.url) {
          console.warn("❌ No downloadable URL for musicId:", musicId);
          return;
        }

        setCurrentSong(songData);
        setTimeout(() => setIsPlaying(true), 200);
      } catch (err) {
        console.error("Song fetch failed:", err);
      }
    }

    loadSong();
  }, [musicId]);

  const handleSongEnd = () => {
    if (isLoop && playerRef.current) {
      playerRef.current.seekTo(0);
      setIsPlaying(true);
    } else if (shuffle && queue.length > 0) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setMusicId(queue[randomIndex].id);
    } else {
      nextSongHandler();
    }
  };

  return (
    <>
      {/* Mini player floating button */}
      {currentSong?.image?.[1]?.url && (
        <button
          onClick={toggleFullScreen}
          className={`fixed bottom-6 right-6 h-16 w-16 rounded-full z-50 shadow-md ${
            isPlaying ? "animate-slowspin" : ""
          }`}
        >
          <img
            src={currentSong.image[1].url}
            alt={currentSong.name}
            className="w-full h-full object-cover rounded-full"
          />
        </button>
      )}

      {/* Audio invisible player */}
      {currentSong?.downloadUrl?.[4]?.url && (
        <ReactPlayer
          ref={playerRef}
          url={currentSong.downloadUrl[4].url}
          playing={isPlaying}
          volume={volume}
          onProgress={({ playedSeconds }) => setPlayedSeconds(playedSeconds)}
          onDuration={(d) => setDuration(d)}
          onEnded={handleSongEnd}
          width={0}
          height={0}
        />
      )}
    </>
  );
}