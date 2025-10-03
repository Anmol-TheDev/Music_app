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
    toggleFullScreen,
    playedSeconds,
    duration,
    handleSeek,
    nextSongHandler,
    prevSongHandler,
    volume,
    setVolume,
  } = useStore();

  const VolumeIcon =
    volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  if (!currentSong) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between text-white px-4 py-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,10,10,1) 0%, rgba(0,0,0,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-2xl mb-6">
        <button onClick={toggleFullScreen}>
          <ChevronDown size={28} />
        </button>
        <div className="text-center flex-1">
          <p className="text-sm">Now Playing</p>
          <p className="text-sm text-muted">From {currentSong?.album?.name || "Album"}</p>
        </div>
        <MoreHorizontal size={24} />
      </div>

      {/* Album Art */}
      <img
        src={currentSong?.image?.[2]?.url}
        alt={currentSong.name}
        className="rounded-xl shadow-lg w-[280px] md:w-[300px]"
      />

      {/* Song Info */}
      <div className="text-center mt-6">
        <h1 className="text-2xl font-bold">{currentSong.name}</h1>
        <p className="text-gray-400">{currentSong.artist}</p>
        <p className="text-sm text-gray-500 mt-1">
          {currentSong.album?.name || "Album"} · {new Date().getFullYear()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mt-4">
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

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button>
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
        <button>
          <Repeat />
        </button>
      </div>

      {/* Bottom Bar */}
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
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="w-6"></div>
      </div>
    </div>
  );
}