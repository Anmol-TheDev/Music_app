import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { Music, Play } from "lucide-react";
import { Button } from "./ui/button";
import { useFetch } from "../zustand/store";
import Albums from "./Album/Albums";
import RandomArtists from "./Artist/artists";

export default function LandingPage() {
  const navigate = useNavigate();
  const { fetchSongs, fetchAlbums, albums, fetchArtists, artists } = useFetch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      setIsLoading(true);
      // Load trending/popular content for the landing page
      await Promise.all([
        fetchSongs("trending"),
        fetchAlbums("top albums"),
        fetchArtists("popular artists"),
      ]);
      setIsLoading(false);
    };

    loadFeaturedContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExploreMusic = () => {
    // Always start with fresh "top hits" search when exploring from landing page
    const defaultSearch = "top hits";
    localStorage.setItem("search", defaultSearch); // Update localStorage
    navigate(`/search?searchTxt=${encodeURIComponent(defaultSearch)}`);
  };

  if (isLoading) {
    return (
      <ScrollArea className="h-[90vh] w-full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Music size={64} className="mx-auto text-primary" />
            </div>
            <p className="text-lg text-muted-foreground">Loading amazing music...</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[90vh] w-full">
      <div className="flex flex-col w-full">
        <div className="max-w-7xl mx-auto p-6 space-y-16">
          {/* Hero Section - Simple and Clean */}
          <section className="text-center space-y-6 py-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Music size={40} className="text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">Sangeet</h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Discover and stream your favorite music
            </p>
            <div className="pt-6">
              <Button size="lg" onClick={handleExploreMusic} className="gap-2 text-lg px-10 py-6">
                <Play size={20} />
                Start Listening
              </Button>
            </div>
          </section>

          {/* Featured Albums Section */}
          {albums && albums.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Featured Albums</h2>
              <Albums albums={albums.slice(0, 6)} />
            </section>
          )}

          {/* Popular Artists Section */}
          {artists && artists.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Popular Artists</h2>
              <RandomArtists artists={artists.slice(0, 6)} />
            </section>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
