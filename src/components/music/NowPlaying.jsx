import React, { useState } from "react";
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
    playedSeconds,
    duration,
    handleSeek,
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
    nextSongHandler,
    prevSongHandler,
    toggleFullScreen,
  } = useStore();

  const [tab, setTab] = useState("lyrics");

  if (!currentSong) return null;

  const VolumeIcon =
    volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col md:flex-row md:items-start px-0 py-6">
      {/* LEFT SIDE */}
      <div className="flex flex-col items-center w-full md:w-4/5">
        <div className="flex justify-between items-center w-full mb-4 px-4">
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

        <img
          src={currentSong?.image?.[2]?.url}
          alt={currentSong.name}
          className="rounded-xl shadow-lg w-[280px] md:w-[320px] object-cover"
        />

        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold">{currentSong.name}</h1>
          <p className="text-gray-400">{currentSong.artist}</p>
        </div>

        <div className="w-full mt-6 px-4">
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

        <div className="flex items-center justify-center gap-8 mt-8">
          <button onClick={toggleShuffle} className={shuffle ? "text-blue-400" : ""}>
            <Shuffle size={32} />
          </button>
          <button onClick={prevSongHandler}>
            <SkipBack size={36} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white text-black rounded-full p-5"
          >
            {isPlaying ? <Pause size={36} /> : <Play size={36} />}
          </button>
          <button onClick={nextSongHandler}>
            <SkipForward size={36} />
          </button>
          <button onClick={toggleLoop} className={isLoop ? "text-blue-400" : ""}>
            <Repeat size={32} />
          </button>
        </div>

        <div className="flex items-center justify-between w-full mt-6 px-6">
          <button>
            <Heart size={22} />
          </button>
          <div className="flex items-center gap-2 w-1/3">
            <VolumeIcon size={22} />
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
      </div>

      {/* RIGHT SIDE - Lyrics & Queue */}
      <div className="flex flex-col w-full md:w-1/5 mt-6 md:mt-0">
        <div className="flex justify-center md:justify-start space-x-8 text-sm text-gray-300 px-2">
          <button
            onClick={() => setTab("lyrics")}
            className={`pb-1 ${tab === "lyrics" ? "border-b-2 border-blue-500 text-white" : "text-gray-400"}`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setTab("queue")}
            className={`pb-1 ${tab === "queue" ? "border-b-2 border-blue-500 text-white" : "text-gray-400"}`}
          >
            Queue
          </button>
        </div>

        <div className="mt-4 w-full h-[80vh] overflow-y-auto px-2 text-sm text-gray-400">
          {tab === "lyrics" ? (
            <pre className="whitespace-pre-wrap leading-relaxed text-gray-200">
              {lyrics || "Lyrics not available."}
            </pre>
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
    </div>
  );
}
