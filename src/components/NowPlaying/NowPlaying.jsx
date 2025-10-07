import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../../zustand/store";
import Api from "../../Api";
import { getImageColors } from "../color/ColorGenrator";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { cn } from "@/lib/utils";
import Like from "../ui/Like";
import PropTypes from "prop-types";

export default function NowPlaying({ isOpen, onClose }) {
  const [song, setSong] = useState(null);
  const [bgColor, setBgColor] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    musicId,
    isPlaying,
    volume,
    muted,
    played,
    duration,
    shuffle,
    repeat,
    setIsPlaying,
    setVolume,
    setMuted,
    setPlayed,
    setShuffle,
    setRepeat,
    playNext,
    playPrevious,
  } = useStore();

  useEffect(() => {
    async function fetchSong() {
      if (!musicId) return;
      try {
        const res = await Api(`/api/songs/${musicId}`);
        const songData = res.data?.data?.[0];
        setSong(songData);

        if (songData?.image?.[2]?.url) {
          getImageColors(songData.image[2].url).then(({ averageColor, dominantColor }) => {
            setBgColor({ bg1: averageColor, bg2: dominantColor });
          });
        }
      } catch (error) {
        console.error("Error fetching song:", error);
      }
    }
    fetchSong();
  }, [musicId]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRepeatClick = (e) => {
    e.stopPropagation();
    const modes = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeat || "none");
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeat(modes[nextIndex]);
  };

  const handlePlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleShuffleClick = (e) => {
    e.stopPropagation();
    setShuffle(!shuffle);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    playPrevious();
  };

  const handleNext = (e) => {
    e.stopPropagation();
    playNext();
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0] / 100);
    if (muted) setMuted(false);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setMuted(!muted);
  };

  const handleSeek = (value) => {
    setPlayed(value[0] / 100);
  };

  if (!isOpen || !song) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-in slide-in-from-bottom duration-500"
      style={{
        background: bgColor
          ? `linear-gradient(180deg, ${bgColor.bg1} 0%, ${bgColor.bg2} 50%, #000 100%)`
          : "linear-gradient(180deg, hsl(var(--muted)) 0%, #000 100%)",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ background: bgColor?.bg1 || "hsl(var(--primary))" }}
        />
        <div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-30 animate-pulse [animation-delay:1.5s]"
          style={{ background: bgColor?.bg2 || "hsl(var(--primary))" }}
        />
      </div>

      <div className="relative h-full flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          <div className="text-center flex-1 mx-4">
            <p className="text-xs uppercase tracking-widest text-white/70">Now Playing</p>
            <p className="text-sm text-white/90 truncate">{song.album?.name || song.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white"
          >
            <MoreVertical className="h-6 w-6" />
          </Button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-4 sm:py-8">
          <div className="relative w-full max-w-sm sm:max-w-md aspect-square">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/50 via-primary/30 to-primary/50 rounded-3xl blur-2xl opacity-50 transition-opacity duration-500" />
            <div
              className={cn(
                "relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl",
                "ring-4 ring-white/10 transition-all duration-500",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
            >
              <img
                src={song.image[2].url}
                alt={song.name}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse rounded-2xl sm:rounded-3xl" />
            )}
          </div>
        </div>

        {/* Song Info */}
        <div className="px-6 sm:px-12 py-4 space-y-2 text-center flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white line-clamp-2">
            {song.name}
          </h1>
          <p className="text-base sm:text-lg text-white/70 line-clamp-1">
            {song.artists?.primary?.map((a) => a.name).join(", ") || "Unknown Artist"}
          </p>
          {song.year && <p className="text-sm text-white/50">{song.year}</p>}
        </div>

        {/* Progress Bar */}
        <div className="px-6 sm:px-12 py-4 space-y-2 flex-shrink-0">
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            className="cursor-pointer"
            onValueChange={handleSeek}
          />
          <div className="flex justify-between text-xs sm:text-sm text-white/70">
            <span>{formatTime(duration * played)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 sm:px-12 pb-6 sm:pb-8 space-y-6 flex-shrink-0">
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <Button
              onClick={handleShuffleClick}
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full text-white hover:text-white hover:bg-white/10",
                shuffle && "text-primary"
              )}
            >
              <Shuffle className="h-5 w-5" />
            </Button>

            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:scale-110 transition-transform hover:bg-white/10"
            >
              <SkipBack className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" />
            </Button>

            <Button
              onClick={handlePlayPause}
              size="icon"
              className={cn(
                "h-16 w-16 sm:h-20 sm:w-20 rounded-full",
                "bg-white hover:bg-white/90 text-black",
                "shadow-[0_8px_30px_rgba(255,255,255,0.3)]",
                "hover:scale-105 active:scale-95 transition-all"
              )}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 sm:h-9 sm:w-9" fill="currentColor" />
              ) : (
                <Play className="h-7 w-7 sm:h-9 sm:w-9 ml-1" fill="currentColor" />
              )}
            </Button>

            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:scale-110 transition-transform hover:bg-white/10"
            >
              <SkipForward className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" />
            </Button>

            <Button
              onClick={handleRepeatClick}
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full relative text-white hover:text-white hover:bg-white/10",
                repeat !== "none" && "text-primary"
              )}
            >
              <Repeat className="h-5 w-5" />
              {repeat === "one" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  1
                </span>
              )}
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div onClick={(e) => e.stopPropagation()}>
              <Like songId={song.id} />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={handleMuteToggle}
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Slider
                value={[muted ? 0 : volume * 100]}
                max={100}
                step={1}
                className="w-20 sm:w-32"
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

NowPlaying.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
