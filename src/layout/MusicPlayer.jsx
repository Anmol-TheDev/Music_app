import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
} from "lucide-react";
import ReactPlayer from "react-player";
import Visualizer from "./audioVisualizer/Visualizer";
import Api from "../Api";
import { useMain } from "../Context";
import { getImageColors } from "./color/ColorGenrator";
import { Drawer, DrawerContent, DrawerTrigger } from "../components/ui/drawer";

import { Button } from "../components/ui/button";
function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bgColor, setBgColor] = useState();
  const playerRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [song, setSong] = useState();
  const { value } = useMain();
  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await Api(`/api/songs/${value}`);
        setSong(res.data.data[0]);
        getImageColors(res.data.data[0].image[2].url).then(
          ({ averageColor, dominantColor }) => {
            setBgColor({ bg1: averageColor, bg2: dominantColor });
          }
        );
        // setIsPlaying(true);
      } catch (error) {
        console.log(error);
      }
    }
    // async function songSuggestion() {
    //   const res = await Api(`/api/songs/${value}/suggestions`)
    //   console.log(res.data)

    // }
    // songSuggestion()
    fetchSong();
  }, [value]);
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };
  const handleToggleMute = () => {
    return setMuted(!muted);
  };
  const handleProgress = (state) => setPlayed(state.played);
  const handleDuration = (duration) => setDuration(duration);
  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseUp = (e) => {
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

    useEffect(() => {
      // Create the AudioContext and AnalyserNode once when the component mounts
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
  
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
  
      return () => {
        // Cleanup the AudioContext when the component unmounts
        if (audioCtx) {
          audioCtx.close();
        }
      };
    }, []);
  return (
    <>
      <Drawer >
        <DrawerTrigger asChild>
          <Button variant="outline" className={`absolute right-6 bottom-6 p-0 h-16 w-16 [animation-duration:5s] ${isPlaying? "animate-spin": ""} rounded-full`}>{
            <img className="rounded-full" src={song?.image[1].url} alt="Song" loading='lazy' />
            }</Button>
        </DrawerTrigger>
        <DrawerContent className="h-[30dvh]">
        <Visualizer
        audioUrl={song?.downloadUrl[4].url}
      />
          {/* <div
            className={`  fixed bottom-0 left-0 right-0  text-white p-4`}
            style={{
              background: `linear-gradient(${bgColor?.bg1} 0%,${bgColor?.bg2} 100%)`,
            }}
          >
            <div className="max-w-screen-lg mx-auto ">
              <div className="flex items-center justify-between ">
                <div className="flex items-center space-x-4">
                  <img
                    src={song?.image[2].url}
                    alt={song?.name}
                    loading='lazy'
                    className="w-12 h-12 rounded-md"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{song?.name}</h3>
                    <p className="text-xs text-gray-400">{song?.artist}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="focus:outline-none">
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <button className="focus:outline-none">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="focus:outline-none bg-white text-black rounded-full p-2"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <button className="focus:outline-none">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button className="focus:outline-none">
                    <Repeat className="w-5 h-5" />
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
                    className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${bgColor?.bg1} 0%, ${bgColor?.bg1} ${
                        played * 100
                      }%, #4B5563 ${played * 100}%, #4B5563 100%)`,
                    }}
                  />
                </div>
                <span className="text-xs">{formatTime(duration)}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleMute}
                    className="focus:outline-none"
                  >
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
                      background: `linear-gradient(to right, ${bgColor?.bg1} 0%, ${bgColor?.bg1} ${
                        volume * 100
                      }%, #4B5563 ${volume * 100}%, #4B5563 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div> */}
        </DrawerContent>
      </Drawer>
      <ReactPlayer
        ref={playerRef}
        url={song?.downloadUrl[4].url}
        playing={isPlaying}
        volume={muted ? 0 : volume}
        onProgress={handleProgress}
        onDuration={handleDuration}
        width="0"
        height="0"
      />
    </>
  );
}

export default MusicPlayer;
