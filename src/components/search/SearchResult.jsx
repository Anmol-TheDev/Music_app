import { useEffect } from "react";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { PlayCircle, Play, Eye, Pause } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate, createSearchParams, useLocation } from "react-router-dom";
import RandomArtists from "../Artist/artists";
import { useFetch, useStore } from "../../zustand/store";
import Menu from "../Menu";

export default function SearchComponent() {
  const { fetchSongs, songs, fetchAlbums, albums, Topresult } = useFetch();
  const {
    setMusicId,
    musicId,
    isPlaying,
    setIsPlaying,
    setQueue,
  } = useStore();

  const url = useLocation();
  const search = url.search.split("=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbums(search);
    fetchSongs(search);
  }, [search, url.search]);

  // Sync fetched songs to global queue
  useEffect(() => {
    if (songs && songs.length > 0) {
      setQueue(songs);
    }
  }, [songs]);

  const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return views.toString();
  };

  const handleSongClick = (song) => {
    if (song.id === musicId) {
      setIsPlaying(true);
    } else {
      setMusicId(song.id);
    }
  };

  const handlePlayPauseTop = () => {
    if (Topresult?.id === musicId) {
      setIsPlaying((prev) => !prev);
    } else {
      setMusicId(Topresult?.id);
    }
  };

  const handleAlbumsClick = (Id) => {
    navigate({
      pathname: "/album",
      search: createSearchParams({ Id }).toString(),
    });
  };

  return (
    <ScrollArea className="h-[90vh] w-full">
      <div className="flex flex-col w-full">
        <div className="max-w-7xl mx-auto sm:p-6 flex-grow">

          <div className="flex flex-col items-center lg:flex-row gap-4 lg:gap-8">

            {/* Top Result / Current Song */}
            {Topresult && (
              <div className="w-[90vw] sm:w-full md:w-1/3 lg:w-1/3">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  Current Song
                </h2>

                <div className="relative group">
                  <Card>
                    <CardContent className="p-4 sm:p-6 shadow-lg">
                      <img
                        src={Topresult?.image?.[2]?.url}
                        alt={Topresult?.name}
                        loading="lazy"
                        className="object-contain w-full mx-auto mb-4 rounded"
                      />
                      <div className="space-y-2 text-center">
                        <h3 className="text-lg font-semibold">
                          {Topresult?.name}
                        </h3>
                        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                            {Topresult?.label}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Eye size={16} />
                            <span>{formatViews(Topresult?.playCount)} views</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Play/Pause Floating */}
                  <div className="absolute bottom-10 right-6 sm:bottom-4 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={handlePlayPauseTop}
                      className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
                    >
                      {(isPlaying && musicId === Topresult?.id) ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Songs List */}
            {songs && (
              <div className="w-full lg:w-2/3 border rounded-xl p-2 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-left">Songs</h2>
                <ScrollArea className="h-[50vh]">
                  <ul className="space-y-2">
                    {songs.map((song, index) => (
                      <li
                        key={song.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all hover:bg-secondary ${
                          song.id === musicId ? "bg-secondary text-white" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="w-6 text-center text-sm">{index + 1}</span>
                          <img
                            src={song.image?.[0]?.url}
                            alt={song.name}
                            className="w-10 h-10 rounded"
                          />
                          <div>
                            <p className="font-medium text-sm truncate w-32 md:w-40">
                              {song.name || "Unknown Title"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {song.artists?.primary?.[0]?.name || "Artist"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-200">
                            {Math.floor(song.duration / 60)}:
                            {(song.duration % 60).toString().padStart(2, "0")}
                          </span>

                          {song.id === musicId && isPlaying ? (
                            <Pause
                              size={20}
                              onClick={() => setIsPlaying(false)}
                              className="cursor-pointer"
                            />
                          ) : (
                            <PlayCircle
                              size={20}
                              onClick={() => handleSongClick(song)}
                              className="cursor-pointer"
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

          {/* Albums List */}
          {albums && (
            <div className="mt-8 p-4 rounded-xl shadow-lg border">
              <h2 className="text-xl font-bold mb-4">Albums</h2>
              <ScrollArea>
                <div className="flex gap-4 pb-4 overflow-x-auto">
                  {albums.map((album, index) => (
                    <div
                      key={index}
                      onClick={() => handleAlbumsClick(album.id)}
                      className="bg-secondary rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:scale-105 transition-all"
                    >
                      <img
                        src={album.image?.[2]?.url}
                        alt={album.name}
                        className="w-24 h-24 object-cover rounded-lg mb-2"
                      />
                      <Label className="w-24 text-center text-sm truncate">
                        {album.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <RandomArtists search={search} />
        </div>
      </div>
    </ScrollArea>
  );
}