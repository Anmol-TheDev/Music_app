import React, { useEffect, useState } from "react";
import { useStore } from "../../zustand/store";
import { ScrollArea } from "../ui/scroll-area";
import { Play, Pause } from "lucide-react";
import Api from "../../Api";
import Like from "../ui/Like";
import Menu from "../Menu";

export default function LikedSongs() {
  const { likedSongs, setMusicId, musicId, isPlaying, setIsPlaying, isUser } = useStore();
  const [likedSongsData, setLikedSongsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchLikedSongsData = async () => {
      if (likedSongs.length === 0) {
        if (!abortController.signal.aborted) {
          setLikedSongsData([]);
          setIsLoading(false);
        }
        return;
      }

      try {
      if (!abortController.signal.aborted) {
        setLikedSongsData([]);
        setIsLoading(false);
      }
        // Join song IDs with comma for API request
        const songIds = likedSongs.join(',');
        const response = await Api(`/api/songs?ids=${songIds}`);
        
        // Check if component is still mounted before updating state
        if (!abortController.signal.aborted && response.data.success) {
          setLikedSongsData(response.data.data);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching liked songs:", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchLikedSongsData();
    
    // Cleanup function to abort request if component unmounts or dependencies change
    return () => {
      abortController.abort();
    };
  }, [likedSongs]);

  function handleSongClick(song) {
    if (song.id !== musicId) {
      setMusicId(song.id);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  if (!isUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Please log in to view your liked songs</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading liked songs...</p>
        </div>
      </div>
    );
  }

  if (likedSongs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">No liked songs yet</p>
          <p className="text-sm text-muted-foreground">Start liking songs to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100dvh]">
      <div className="min-h-screen pb-32">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold">Liked Songs</h1>
              <p className="text-muted-foreground">{likedSongs.length} songs</p>
            </div>

            <div className="space-y-1">
              {likedSongsData.map((song, index) => (
                <div
                  key={song.id || index}
                  className={`group rounded-lg transition-all duration-200 hover:bg-muted/50 cursor-pointer ${
                    song.id === musicId ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Track Number / Play Button */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <span
                        className={`text-sm text-muted-foreground group-hover:hidden ${
                          song.id === musicId ? "hidden" : ""
                        }`}
                      >
                        {index + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSongClick(song);
                        }}
                        className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                          song.id === musicId ? "block" : "hidden group-hover:block"
                        }`}
                      >
                        {isPlaying && song.id === musicId ? (
                          <Pause
                            className="w-5 h-5 text-primary cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsPlaying(false);
                            }}
                          />
                        ) : (
                          <Play className="w-5 h-5 text-primary cursor-pointer hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>

                    {/* Song Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      <img
                        src={song.image?.[1]?.url || song.image?.[0]?.url}
                        alt={song.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium truncate ${
                          song.id === musicId ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {song.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artists?.primary?.[0]?.name}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-muted-foreground font-mono">
                      {Math.floor(song.duration / 60)}:
                      {(song.duration % 60).toString().padStart(2, "0")}
                    </div>

                    {/* Like Button */}
                    <div className="flex-shrink-0">
                      <Like songId={song.id} />
                    </div>

                    {/* Menu Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Menu song={song} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
