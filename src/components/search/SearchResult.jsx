import { useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { useLocation } from "react-router-dom";
import RandomArtists from "../Artist/artists";
import { useFetch, useStore } from "../../zustand/store";
import Albums from "../Album/Albums";
import NowPlayingCard from "./NowPlayingCard";
import TopResultCard from "./TopResultCard";
import SongList from "./SongList";

export default function SearchComponent() {
  const { fetchSongs, songs, fetchAlbums, Topresult } = useFetch();
  const currentSong = useStore((state) => state.currentSong);
  const url = useLocation();
  const search = url.search.split("=")[1];

  useEffect(() => {
    fetchAlbums(search);
    fetchSongs(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <ScrollArea className="h-[90vh] w-[dvw] flex mt-16">
      <div className="flex flex-col w-full">
        <div className="max-w-7xl mx-auto sm:p-6 flex-grow">
          <div className="flex flex-col items-center lg:flex-row gap-4 lg:gap-8">
            {currentSong ? <NowPlayingCard /> : songs && <TopResultCard topResult={Topresult} />}
            <SongList songs={songs} />
          </div>
          <Albums search={search} />
          <RandomArtists search={search} />
        </div>
      </div>
    </ScrollArea>
  );
}
