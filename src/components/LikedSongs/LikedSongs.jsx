import { useEffect, useState } from "react";
import { useStore } from "../../zustand/store";
import { ScrollArea } from "../ui/scroll-area";
import Api from "../../Api";
import SongCard from "../common/SongCard";

export default function LikedSongs() {
  const { likedSongs, isUser } = useStore();
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
        const songIds = likedSongs.join(",");
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
                <SongCard key={song.id || index} song={song} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
