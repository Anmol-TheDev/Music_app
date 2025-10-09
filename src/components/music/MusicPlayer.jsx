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
} from "lucide-react";
import ReactPlayer from "react-player";
import Api from "../../Api";
import { getImageColors } from "../color/ColorGenrator";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "../ui/drawer";
import { Button } from "../ui/button";
import { useStore, useFetch } from "../../zustand/store";
import useKeyboardShortcuts from "../../lib/useKeyboardShortcuts";

function MusicPlayer() {
  const playerRef = useRef(null);
  const [bgColor, setBgColor] = React.useState();
  const [musicPlayerDrawer, setMusicPlayerDrawer] = React.useState(false);
  const [song, setSong] = React.useState();

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
      try {
        const res = await Api(`/api/songs/${musicId}`);
        const songData = res.data?.data?.[0];
        setSong(songData);
        if (songData?.image?.[2]?.url) {
          getImageColors(songData.image[2].url).then(({ averageColor, dominantColor }) => {
            setBgColor({ bg1: averageColor, bg2: dominantColor });
          });
        }
        setIsPlaying(true);
      } catch (error) {
        console.log(error);
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
  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    if (duration * state.played >= duration) {
      playNext();
    }
  };

  const handleDuration = (newDuration) => setDuration(newDuration);

  const handleSeekChange = (e) => setPlayed(parseFloat(e.target.value));

  const handleSeekMouseUp = (e) => {
    let seekValue;
    if (e.type === "touchend") {
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.value) seekValue = parseFloat(target.value);
    } else {
      seekValue = parseFloat(e.target.value);
    }
    if (seekValue !== undefined) playerRef.current.seekTo(seekValue);
  };

  const handleToggleMute = () => setMuted(!muted);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    song && (
      <>
        <Drawer open={musicPlayerDrawer} onOpenChange={setMusicPlayerDrawer}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              aria-label="Open player"
              style={{ animationDuration: "5s" }}
              className={`absolute right-6 bottom-6 p-0 h-16 w-16 rounded-full overflow-hidden shadow-lg ring-1 ring-white/10 hover:ring-white/30 transition ${
                isPlaying && (song?.image?.[1]?.url ? "animate-spin" : "")
              }`}
            >
              {song?.image?.[1]?.url ? (
                <img
                  className="h-full w-full object-cover"
                  src={song?.image?.[1]?.url}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/image.png";
                  }}
                />
              ) : (
                <div className="h-full w-full grid place-items-center bg-black/30 text-white">
                  <Play className="h-6 w-6" />
                </div>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle hidden />
            <div
              className="fixed bottom-0 left-0 right-0 h-[80px] sm:h-20 flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-2 shadow-2xl z-50 transition-all duration-700"
              style={
                bgColor
                  ? { background: `linear-gradient(90deg, ${bgColor.bg1}, ${bgColor.bg2})` }
                  : { backgroundColor: "#1d1d1d" }
              }
            >
              <div className="flex items-center space-x-3 w-1/4 justify-end min-w-0">
                {song?.image?.[2]?.url ? (
                  <img
                    src={song.image[2].url}
                    alt={song.name}
                    loading="lazy"
                    className="sm:w-14 sm:h-14 h-10 w-10 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/image.png";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md shadow-lg grid place-items-center bg-black/30">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{song?.name}</span>
                  <span className="text-xs text-gray-400 truncate">{song?.artist}</span>
                </div>
              </div>

              <div className="flex flex-col items-center w-2/4">
                <div className="flex items-center justify-center flex-shrink-0 flex-grow space-x-2 sm:space-x-4 mb-1">
                  <button
                    onClick={() => setShuffle(!shuffle)}
                    className={`${shuffle ? "text-green-500" : "text-white"}`}
                  >
                    <Shuffle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={playPrevious}>
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="bg-white text-black rounded-full p-2"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                  <button onClick={playNext}>
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 w-full min-w-0">
                  <span className="text-xs sm:text-sm">{formatTime(duration * played)}</span>
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    onTouchEnd={handleSeekMouseUp}
                    className="flex-grow h-1 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #1db954 0%, #1db954 ${played * 100}%, #4B5563 ${played * 100}%, #4B5563 100%)`,
                    }}
                  />
                  <span className="text-xs sm:text-sm">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-1/4 justify-end min-w-0">
                <button onClick={handleToggleMute}>
                  <VolumeIcon className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`,
                  }}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <ReactPlayer
          ref={playerRef}
          key={musicId} // Force re-render on song change to prevent multiple audio instances
          url={song?.downloadUrl?.[4]?.url || ""}
          playing={isPlaying}
          volume={muted ? 0 : volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={playNext} // Use centralized next function
          width="0"
          height="0"
        />
      </>
    )
  );
}

export default MusicPlayer;
