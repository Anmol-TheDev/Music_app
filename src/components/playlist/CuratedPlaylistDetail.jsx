import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { PlayCircle, ArrowLeft, Play, Pause, Eye } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import Api from "../../Api";
import { useStore } from "../../zustand/store";
import { useSongHandlers } from "@/hooks/SongCustomHooks";
import Menu from "../Menu";
import Like from "../ui/Like";

export default function CuratedPlaylistDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const playlistId = searchParams.get("Id");

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const musicId = useStore((state) => state.musicId);
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const setQueue = useStore((state) => state.setQueue);
  const setMusicId = useStore((state) => state.setMusicId);
  const { handleSongClick } = useSongHandlers();

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const response = await Api(`/api/playlists?id=${playlistId}`);

      if (response.data.success && response.data.data) {
        setPlaylist(response.data.data);
        setSongs(response.data.data.songs || []);

        if (response.data.data.songs && response.data.data.songs.length > 0) {
          setQueue(response.data.data.songs);
        }
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      setQueue(songs);
      setMusicId(songs[0].id);
      setIsPlaying(true);
    }
  };

  const formatViews = (views) => {
    if (views == null) return "";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    else if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Playlist not found</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100dvh]">
      <div className="container mx-auto p-4 space-y-6 mb-[15dvh]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <Card className="overflow-hidden bg-gradient-to-b">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-64 h-64 border rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={
                    playlist.image?.[2]?.url || playlist.image?.[1]?.url || playlist.image?.[0]?.url
                  }
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
                  Curated Playlist
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 truncate">{playlist.name}</h1>
                {playlist.subtitle && (
                  <p className="text-base text-muted-foreground mb-3">{playlist.subtitle}</p>
                )}
                <div className="flex items-center gap-4 text-sm mb-4">
                  {playlist.followerCount && (
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {formatViews(playlist.followerCount)} followers
                    </span>
                  )}
                  {songs.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{songs.length} songs</span>
                    </>
                  )}
                </div>

                <button
                  onClick={handlePlayAll}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105"
                >
                  <Play size={24} fill="currentColor" />
                  Play All
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 border-t pt-4">
          <h2 className="text-2xl font-semibold">Tracks</h2>

          <ul className="space-y-2">
            {songs.map((song, index) => (
              <li
                key={song.id}
                className={`${
                  song.id === musicId ? "bg-secondary" : "bg-background"
                } rounded-lg hover:bg-secondary hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <span className="text-sm w-6">{index + 1}.</span>
                    <img
                      src={song.image?.[1]?.url || song.image?.[0]?.url}
                      alt={song.name}
                      loading="lazy"
                      className="w-12 h-12 rounded-md"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{song.name}</span>
                      <span className="text-sm text-muted-foreground truncate">
                        {song.artists?.primary?.[0]?.name || "Unknown Artist"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {Math.floor(song.duration / 60)}:
                      {(song.duration % 60).toString().padStart(2, "0")}
                    </span>
                    <Like songId={song.id} />
                    {isPlaying && song.id === musicId ? (
                      <Pause
                        className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlaying(false);
                        }}
                      />
                    ) : (
                      <PlayCircle
                        className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSongClick(song);
                        }}
                      />
                    )}
                    <Menu song={song} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScrollArea>
  );
}
