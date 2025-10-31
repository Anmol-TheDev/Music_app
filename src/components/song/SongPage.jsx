import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../../zustand/store";
import { getImageColors } from "../color/ColorGenrator";
import { Play, Pause } from "lucide-react";

function SongPage() {
  const { played, duration, isPlaying, setIsPlaying, musicId, setMusicId } = useStore();

  const [song, setSong] = useState(null);
  const [bgColor, setBgColor] = useState({ bg1: "#000000", bg2: "#000000" });

  const location = useLocation();

  useEffect(() => {
    if (location.state?.song) {
      setSong(location.state.song);
      if (location.state.song.image && location.state.song.image[2]) {
        getImageColors(location.state.song.image[2].url).then(({ averageColor, dominantColor }) => {
          setBgColor({ bg1: averageColor, bg2: dominantColor });
        });
      }
    }
  }, [location.state]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!song) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="min-h-screen text-white p-8 flex flex-col items-center justify-center transition-colors duration-1000"
      style={{ background: `linear-gradient(to bottom, ${bgColor.bg1}, ${bgColor.bg2})` }}
    >
      <div className="text-center">
        {song.image && song.image[2] && (
          <img
            src={song.image[2].url}
            alt={song.name}
            className="w-64 h-64 rounded-lg shadow-lg mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-4xl font-bold">{song.name}</h1>
        {song.artists && song.artists.primary && (
          <p className="text-xl text-gray-300">
            {song.artists.primary.map((artist) => artist.name).join(", ")}
          </p>
        )}
      </div>

      <div className="w-full max-w-md mt-8">
        <div className="flex items-center space-x-4">
          <span className="text-xs">{formatTime(duration * played)}</span>
          <div className="flex-grow">
            <div className="w-full h-1 bg-gray-600 rounded-full cursor-pointer">
              <div
                className="h-1 bg-green-500 rounded-full"
                style={{ width: `${played * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs">{formatTime(duration)}</span>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              if (musicId !== song.id) {
                setMusicId(song.id);
              }
              setIsPlaying(!isPlaying);
            }}
            className="bg-white text-black rounded-full p-3 shadow-lg"
          >
            {isPlaying && musicId === song.id ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SongPage;
