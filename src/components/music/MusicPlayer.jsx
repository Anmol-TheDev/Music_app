import React, { useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Shuffle,
  Loader2,
} from "lucide-react";
import ReactPlayer from "react-player";
import Api from "../../Api";
import { getImageColors } from "../color/ColorGenrator";
import { useStore, useFetch } from "../../zustand/store";
import useKeyboardShortcuts from "../../lib/useKeyboardShortcuts";

function MusicPlayer() {
  const playerRef = useRef(null);
  const [bgColor, setBgColor] = React.useState({ bg1: "#1f2937", bg2: "#111827" });
  const [song, setSong] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Get state from Zustand stores
  const { songs } = useFetch();
  const {
    musicId,
    isPlaying,
    volume,
    muted,
    played,
    duration,
    shuffle,
    setIsPlaying,
    setQueue,
    setVolume,
    setMuted,
    setPlayed,
    setDuration,
    setShuffle,
    playNext,
    playPrevious,
  } = useStore();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    togglePlayPause: () => setIsPlaying(!isPlaying),
    nextTrack: () => playNext(),
    prevTrack: () => playPrevious(),
    increaseVolume: () => {
      setMuted(false);
      setVolume(Math.min(1, volume + 0.1));
    },
    decreaseVolume: () => {
      setMuted(false);
      setVolume(Math.max(0, volume - 0.1));
    },
    toggleMute: () => setMuted(!muted),
    toggleShuffle: () => setShuffle(!shuffle),
  });

  // Fetch song when musicId changes
  useEffect(() => {
    async function fetchSong() {
      if (!musicId) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await Api(`/api/songs/${musicId}`);
        const songData = res.data?.data?.[0];

        if (!songData) {
          throw new Error("Song not found");
        }

        setSong(songData);

        if (songData?.image?.[2]?.url) {
          try {
            const colors = await getImageColors(songData.image[2].url);
            setBgColor({
              bg1: colors.averageColor || "#1f2937",
              bg2: colors.dominantColor || "#111827",
            });
          } catch (colorError) {
            console.warn("Failed to extract colors:", colorError);
            setBgColor({ bg1: "#1f2937", bg2: "#111827" });
          }
        }

        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to fetch song:", error);
        setError(error.message || "Failed to load song");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSong();
  }, [musicId, setIsPlaying]);

  // Set queue when songs change
  useEffect(() => {
    if (songs) {
      setQueue(songs);
    }
  }, [songs, setQueue]);

  // Handlers
  const handlePlayPause = () => {
    if (!isLoading && !error) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setMuted(false);
  };

  const handleProgress = (state) => {
    if (!state || typeof state.played !== "number") return;

    setPlayed(state.played);
    if (duration && duration * state.played >= duration - 1) {
      playNext();
    }
  };

  const handleDuration = (newDuration) => {
    if (typeof newDuration === "number" && newDuration > 0) {
      setDuration(newDuration);
    }
  };

  const handleSeekChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setPlayed(value);
    }
  };

  const handleSeekMouseUp = (e) => {
    if (!playerRef.current) return;

    let seekValue;
    if (e.type === "touchend") {
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.value) seekValue = parseFloat(target.value);
    } else {
      seekValue = parseFloat(e.target.value);
    }

    if (!isNaN(seekValue)) {
      playerRef.current.seekTo(seekValue);
    }
  };

  const handleToggleMute = () => setMuted(!muted);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  // Don't render if no musicId
  if (!musicId) return null;

  return (
    <>
      {/* Fixed Bottom Music Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border/50">
        <div
          className="h-full w-full backdrop-blur-xl bg-background/95 shadow-lg"
          style={{
            background: song?.image?.[2]?.url
              ? `linear-gradient(90deg, ${bgColor.bg1}15 0%, ${bgColor.bg2}15 100%), rgba(var(--background), 0.95)`
              : "rgba(var(--background), 0.95)",
          }}
        >
          <div className="h-full max-w-screen-2xl mx-auto px-3 flex items-center justify-between gap-3">
            {/* Left Section - Song Info */}
            <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
              {isLoading ? (
                <div className="w-10 h-10 rounded-md bg-muted animate-pulse flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shadow-sm flex-shrink-0">
                  {song?.image?.[1]?.url ? (
                    <img
                      src={song.image[1].url}
                      alt={song?.name || "Song"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/image.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Play className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                    <div className="h-2 bg-muted rounded w-16 animate-pulse" />
                  </div>
                ) : error ? (
                  <div>
                    <p className="text-xs font-medium text-destructive truncate">Failed to load</p>
                    <p className="text-[10px] text-muted-foreground truncate">{error}</p>
                  </div>
                ) : song ? (
                  <div>
                    <p className="text-xs font-medium text-foreground truncate" title={song.name}>
                      {song.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate" title={song.artist}>
                      {song.artist}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">No song selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Player Controls */}
            <div className="flex items-center gap-1 flex-1 max-w-lg">
              {/* Control Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  disabled={isLoading || error}
                  className={`p-1.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    shuffle
                      ? "text-green-500 hover:text-green-400 bg-green-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={playPrevious}
                  disabled={isLoading || error}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={isLoading || error}
                  className="p-2 rounded-full bg-white text-black hover:scale-105 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mx-1"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  disabled={isLoading || error}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 flex-1 text-[10px] text-muted-foreground ml-3">
                <span className="w-8 text-right tabular-nums">{formatTime(duration * played)}</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    onTouchEnd={handleSeekMouseUp}
                    disabled={isLoading || error || !duration}
                    className="w-full h-0.5 bg-muted rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed progress-bar"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${played * 100}%, rgb(var(--muted)) ${played * 100}%, rgb(var(--muted)) 100%)`,
                    }}
                    aria-label="Seek"
                  />
                </div>
                <span className="w-8 tabular-nums">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Section - Volume Control */}
            <div className="flex items-center gap-1 flex-1 max-w-xs justify-end">
              <button
                onClick={handleToggleMute}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <VolumeIcon className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 w-16">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-0.5 bg-muted rounded-full appearance-none cursor-pointer volume-bar"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume * 100}%, rgb(var(--muted)) ${volume * 100}%, rgb(var(--muted)) 100%)`,
                  }}
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ReactPlayer - Hidden */}
      <ReactPlayer
        ref={playerRef}
        key={musicId}
        url={song?.downloadUrl?.[4]?.url || ""}
        playing={isPlaying}
        volume={muted ? 0 : volume}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNext}
        onError={(error) => {
          console.error("ReactPlayer error:", error);
          setError("Playback failed");
        }}
        width="0"
        height="0"
        style={{ display: "none" }}
      />
    </>
  );
}

export default MusicPlayer;
