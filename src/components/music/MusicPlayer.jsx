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
    setCurrentList,
    setVolume,
    setMuted,
    setPlayed,
    setDuration,
    setShuffle,
    playNext,
    playPrevious,
    currentSong,
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
        const songData = currentSong;
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
  }, [musicId, currentSong]);

  // Set queue when songs change
  useEffect(() => {
    if (songs) {
      setCurrentList(songs);
    }
  }, [songs, setCurrentList]);

  // Handlers
  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
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
          <DrawerContent className="h-[15dvh]">
            <DrawerTitle hidden />
            <div
              className="h-full fixed bottom-0 left-0 right-0 text-white p-4"
              style={{ background: `linear-gradient(${bgColor?.bg1} 0%, ${bgColor?.bg2} 100%)` }}
            >
              <div className="max-w-screen-lg mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {song?.image?.[2]?.url ? (
                      <img
                        src={song?.image?.[2]?.url}
                        alt=""
                        loading="lazy"
                        className="w-12 h-12 rounded-md shadow-lg object-cover"
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
                    <div>
                      <h3 className="text-sm font-semibold bg-gray-200/20 px-2 rounded-md">
                        {song?.name}
                      </h3>
                      <p className="text-xs text-gray-400">{song?.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShuffle(!shuffle)}
                      className={`${shuffle ? "text-secondary" : "text-white"}`}
                    >
                      <Shuffle className="w-5 h-5" />
                    </button>
                    <button className="focus:outline-none" onClick={playPrevious}>
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="focus:outline-none bg-white text-black rounded-full p-2"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button className="focus:outline-none" onClick={playNext}>
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs">{formatTime(duration * played)}</span>
                  <div className="flex-grow">
                    <input
                      type="range"
                      min={0}
                      max={0.999999}
                      step="any"
                      value={played}
                      onChange={handleSeekChange}
                      onMouseUp={handleSeekMouseUp}
                      onTouchEnd={handleSeekMouseUp}
                      className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #1db954 0%, #1db954 ${played * 100}%, #4B5563 ${played * 100}%, #4B5563 100%)`,
                      }}
                    />
                  </div>
                  <span className="text-xs">{formatTime(duration)}</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={handleToggleMute} className="focus:outline-none">
                      <VolumeIcon />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`,
                      }}
                    />
                  </div>
                </div>
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
          onError={(e) => console.error("ReactPlayer error", e)}
          config={{ file: { attributes: { preload: "auto" } } }}
        />
      </>
    )
  );
}

export default MusicPlayer;
