import { Card, CardContent } from "../ui/card";
import { Play, Eye, Pause } from "lucide-react";
import { useStore } from "../../zustand/store";
import { decodeHtml } from "../../lib/utils";
import { formatViews } from "./utils";
import { useIsMobile } from "@/hooks/SongCustomHooks";

export default function NowPlayingCard() {
  const currentSong = useStore((state) => state.currentSong);
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const setMusicId = useStore((state) => state.setMusicId);
  const isMobile = useIsMobile();

  function handlePlayPause(status) {
    setMusicId(currentSong.id);
    setIsPlaying(status);
  }

  if (!currentSong) return null;

  return (
    <div className="w-[90vw] sm:w-full md:w-1/3 lg:w-1/3">
      <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isMobile ? "mt-4" : ""}`}>
        Now Playing
      </h2>
      <div className="relative group">
        <Card>
          <CardContent className="p-4 sm:p-6 shadow-lg">
            <img
              src={
                currentSong?.image?.[2]?.url ||
                currentSong?.image?.[1]?.url ||
                currentSong?.image?.[0]?.url
              }
              alt={decodeHtml(currentSong?.name)}
              loading="lazy"
              className="object-contain w-full  mx-auto mb-4 rounded border-red-500 brder-2"
            />
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-center mb-2">
                {decodeHtml(currentSong?.name)}
              </h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                    {decodeHtml(currentSong?.artists?.primary?.[0]?.name) || currentSong?.label}
                  </span>
                </div>
                {currentSong?.playCount && (
                  <div className="flex items-center space-x-1">
                    <Eye size={16} />
                    <span>{formatViews(currentSong.playCount)} views</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="absolute bottom-10 right-4 sm:bottom-4 lg:opacity-0 lg:translate-y-8 lg:scale-75 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:scale-100 transition-all duration-300 ease-out">
          {isPlaying ? (
            <button
              onClick={() => handlePlayPause(false)}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
            >
              <Pause size={24} />
            </button>
          ) : (
            <button
              onClick={() => handlePlayPause(true)}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
            >
              <Play size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
