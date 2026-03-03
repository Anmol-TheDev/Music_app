import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Api from "../../Api";
import { ScrollArea } from "../ui/scroll-area";
import { useStore } from "../../zustand/store";
import { toast } from "sonner";
import ArtistHero from "./ArtistHero";
import ArtistSongs from "./ArtistSongs";

function Artist() {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const url = useLocation();
  const setCurrentList = useStore((state) => state.setCurrentList);
  const artistId = new URLSearchParams(url.search).get("Id");

  useEffect(() => {
    const fetching = async () => {
      try {
        setIsLoading(true);
        const res = await Api(`/api/artists/${artistId}`);
        setData(res.data.data);
        setCurrentList(res.data.data.topSongs);
      } catch (error) {
        toast.error("Failed to load artist data.");
        console.error("Error fetching artist data:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (artistId) {
      fetching();
    }
  }, [artistId, setCurrentList]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading artist...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Artist not found</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100dvh]">
      <div className="min-h-screen pb-32">
        <ArtistHero data={data} artistId={artistId} />
        <ArtistSongs songs={data.topSongs} artistId={artistId} />
      </div>
    </ScrollArea>
  );
}

export default Artist;
