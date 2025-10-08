import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { PlayCircle, Play, Eye, Pause } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useLocation } from "react-router-dom";
import RandomArtists from "../Artist/artists";
import { useFetch, useStore } from "../../zustand/store";
import Menu from "../Menu";
import Like from "../ui/Like";
import Albums from "../Album/Albums";

export default function SearchComponent() {
  const { fetchSongs, songs, fetchAlbums, Topresult } = useFetch();
  const setMusicId = useStore((state) => state.setMusicId);
  const musicId = useStore((state) => state.musicId);
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const currentSong = useStore((state) => state.currentSong);
  const url = useLocation();
  const search = url.search.split("=")[1];

  useEffect(() => {
    fetchAlbums(search);
    fetchSongs(search, setMusicId);
  }, [url, search]);

  function handleSongClick(song) {
    if (song.id !== musicId) {
      setMusicId(song.id);
    } else {
      setIsPlaying(true);
    }
  }

  const formatViews = (views) => {
    if (views == null) return;
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const mql = window.matchMedia("(max-width: 768px)");
      const onChange = () => setIsMobile(mql.matches);
      onChange();
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else mql.addListener(onChange);
      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", onChange);
        else mql.removeListener(onChange);
      };
    }, []);
    return isMobile;
  }

  const isMobile = useIsMobile();

  return (
    <ScrollArea className="h-[90vh] w-[dvw] flex">
      <div className="flex flex-col w-full">
        <div className="max-w-7xl mx-auto sm:p-6 flex-grow">
          <div className="flex flex-col items-center lg:flex-row gap-4  lg:gap-8">
            {currentSong ? (
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
                        alt={currentSong?.name}
                        loading="lazy"
                        className="object-contain w-full  mx-auto mb-4 rounded border-red-500 brder-2"
                      />
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-center mb-2">
                          {currentSong?.name}
                        </h3>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                              {currentSong?.artists?.primary?.[0]?.name || currentSong?.label}
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
                        onClick={() => {
                          setIsPlaying(!isPlaying);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
                      >
                        <Pause size={24} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsPlaying(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
                      >
                        <Play size={24} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              songs && (
                <div className="w-[90vw] sm:w-full md:w-1/3 lg:w-1/3">
                  <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isMobile ? "mt-4" : ""}`}>
                    Top Result
                  </h2>
                  <div className="relative group">
                    <Card>
                      <CardContent className="p-4 sm:p-6 shadow-lg">
                        <img
                          src={Topresult?.image[2].url}
                          alt={Topresult?.name}
                          loading="lazy"
                          className="object-contain w-full  mx-auto mb-4 rounded border-red-500 brder-2"
                        />
                        <div className="space-y-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-center mb-2">
                            {Topresult?.name}
                          </h3>
                          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                                {Topresult?.label}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye size={16} />
                              <span>{formatViews(Topresult.playCount)} views</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="absolute bottom-10 right-4 sm:bottom-4 lg:opacity-0 lg:translate-y-8 lg:scale-75 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:scale-100 transition-all duration-300 ease-out">
                      <button
                        onClick={() => {
                          musicId != Topresult?.id ? setMusicId(Topresult?.id) : setIsPlaying(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
                      >
                        <Play size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
            {songs && (
              <div className="w-[95vw] sm:w-full lg:w-2/3 border rounded-xl p-4 shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Songs</h2>
                <ScrollArea className="h-[40vh]   sm:h-[50vh]">
                  <ul className="space-y-2 ">
                    {songs.map((song, index) => (
                      <li
                        key={index}
                        className={` ${
                          song.id === musicId ? "bg-secondary" : "bg-background"
                        } flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all hover:bg-secondary hover:scale-[1.03] duration-200 `}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span className="w-4 sm:w-6 text-center text-sm sm:text-base">
                            {index + 1}
                          </span>
                          <img
                            src={song.image ? song.image[0].url : "/api/placeholder/40/40"}
                            alt={song.name}
                            loading="lazy"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded "
                          />
                          <div>
                            <p className="font-medium text-sm sm:text-base truncate w-24">
                              {song.name ? song.name : "Iss Duniya ka Papa"}
                            </p>
                            <p className="text-xs sm:text-sm">{song.artists?.primary[0]?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span className="text-xs sm:text-sm">
                            {Math.floor(song.duration / 60)}:
                            {(song.duration % 60).toString().padStart(2, "0")}
                          </span>
                          <Like songId={song.id} />
                          {isPlaying && song.id === musicId ? (
                            <Pause
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              onClick={() => setIsPlaying(false)}
                            />
                          ) : (
                            <PlayCircle
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              onClick={() => handleSongClick(song)}
                            />
                          )}

                          <Menu song={song} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
          <Albums search={search} />
          <RandomArtists search={search} />
        </div>
      </div>
    </ScrollArea>
  );
}
