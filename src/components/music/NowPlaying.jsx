import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  MoreHorizontal,
} from "lucide-react";

import React, { useState } from "react";
import { useStore } from "../../zustand/store";

const formatTime = (t) => {
  const min = Math.floor(t / 60);
  const sec = Math.floor(t % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

export default function NowPlaying() {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    toggleFullScreen,
    playedSeconds,
    duration,
    handleSeek,
    nextSongHandler,
    prevSongHandler,
    volume,
    setVolume,
    queue,
    musicId,
    setMusicId,
    lyrics,
    shuffle,
    isLoop,
    toggleShuffle,
    toggleLoop,
  } = useStore();

  const [tab, setTab] = useState("lyrics");

  const VolumeIcon =
    volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  if (!currentSong) return null;

  return (
    <div
      className="fixed inset-0 bg-black text-white z-50 flex flex-col justify-between items-center px-4 py-6 md:px-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,10,10,1) 0%, rgba(0,0,0,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-3xl mb-4">
        <button onClick={toggleFullScreen}>
          <ChevronDown size={28} />
        </button>
        <div className="text-center flex-1">
          <p className="text-sm font-light">Now Playing</p>
          <p className="text-sm text-gray-400">
            From {currentSong.album?.name || "Unknown Album"}
          </p>
        </div>
        <MoreHorizontal size={24} />
      </div>

      {/* Album Art */}
      <img
        src={currentSong?.image?.[2]?.url}
        alt={currentSong.name}
        className="rounded-xl shadow-lg w-[280px] md:w-[320px] object-cover"
      />

      {/* Song Info */}
      <div className="text-center mt-6">
        <h1 className="text-2xl font-bold">{currentSong.name}</h1>
        <p className="text-gray-400">{currentSong.artist}</p>
        <p className="text-sm text-gray-500 mt-1">
          {currentSong.album?.name || "Unknown"} · {new Date().getFullYear()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-lg mt-6">
        <input
          type="range"
          min={0}
          max={duration}
          value={playedSeconds}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(playedSeconds)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={toggleShuffle}
          className={shuffle ? "text-blue-400" : ""}
        >
          <Shuffle />
        </button>
        <button onClick={prevSongHandler}>
          <SkipBack size={28} />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white text-black rounded-full p-4"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button onClick={nextSongHandler}>
          <SkipForward size={28} />
        </button>
        <button
          onClick={toggleLoop}
          className={isLoop ? "text-blue-400" : ""}
        >
          <Repeat />
        </button>
      </div>

      {/* Volume + Favorite */}
      <div className="flex items-center justify-between w-full max-w-lg mt-4 px-4">
        <button>
          <Heart />
        </button>
        <div className="flex items-center gap-2 w-1/3">
          <VolumeIcon size={20} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="w-6" />
      </div>

      {/* Tab Switch */}
      <div className="flex justify-center mt-4 space-x-10 text-sm text-gray-300">
        <button
          onClick={() => setTab("lyrics")}
          className={`pb-1 ${
            tab === "lyrics"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Lyrics
        </button>
        <button
          onClick={() => setTab("queue")}
          className={`pb-1 ${
            tab === "queue"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Queue
        </button>
      </div>

      {/* Tab Preview */}
<div className="mt-2 w-full max-w-2xl h-40 px-4 overflow-y-auto text-sm text-gray-400">
  {tab === "lyrics" ? (
    lyrics ? (
      <div
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: lyrics }}
      />
    ) : (
      <p>Lyrics not available.</p>
    )
  ) : (
    <ul>
      {queue.map((track) => (
        <li
          key={track.id}
          onClick={() => setMusicId(track.id)}
          className={`py-2 border-b border-gray-700 cursor-pointer hover:text-white ${
            track.id === musicId ? "text-blue-400 font-semibold" : ""
          }`}
        >
          {track.name} - {track.artist}
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
  );
}
