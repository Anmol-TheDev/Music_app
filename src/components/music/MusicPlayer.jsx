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
    setDuration,
    setPlayedSeconds,
    setLyrics,
    currentSong,
    volume,
    toggleFullScreen,
    nextSongHandler,
    isLoop,
    queue,
    shuffle,
    setMusicId,
  } = useStore();

  const playerRef = useRef(null);

  // Load song details & lyrics
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

        // Fetch lyrics
        try {
          const lyricsRes = await fetch(
            `https://jiosaavan-api-2-harsh-patel.vercel.app/api/songs/${songData.id}/lyrics`
          );
          const lyricsJson = await lyricsRes.json();
          setLyrics(lyricsJson?.data?.lyrics || "Lyrics not available.");
        } catch {
          setLyrics("Lyrics not available.");
        }

        setTimeout(() => setIsPlaying(true), 400);
      } catch (err) {
        console.error("Failed to fetch song/lyrics:", err);
      }
    }

    loadSong();
  }, [musicId]);

  return (
    <>
      {/* Floating mini-player button */}
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

      {/* Audio Player */}
      {currentSong?.downloadUrl?.[4]?.url && (
        <ReactPlayer
          ref={playerRef}
          url={currentSong.downloadUrl[4].url}
          playing={isPlaying}
          volume={volume}
          onProgress={({ playedSeconds }) => setPlayedSeconds(playedSeconds)}
          onDuration={setDuration}
          onEnded={() => {
            if (isLoop) {
              playerRef.current.seekTo(0);
              setIsPlaying(true);
            } else if (shuffle && queue.length > 0) {
              const randomIndex = Math.floor(Math.random() * queue.length);
              setMusicId(queue[randomIndex].id); // ✅ reload via id
            } else {
              nextSongHandler();
            }
          }}
          width="0"
          height="0"
        />
      )}
    </>
  );
}

export default MusicPlayer;
