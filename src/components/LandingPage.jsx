import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Music, TrendingUp, Play, Sparkles } from "lucide-react";
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
        <div className="max-w-7xl mx-auto p-6 space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6 py-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music size={48} className="text-primary animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Sangeet
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Discover, Stream, and Enjoy Your Favorite Music
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={handleExploreMusic} className="gap-2 text-lg px-8">
                <Play size={20} />
                Explore Music
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/search?searchTxt=top%20hits")}
                className="gap-2 text-lg px-8"
              >
                <TrendingUp size={20} />
                Top Hits
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Music size={32} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Endless Library</h3>
                <p className="text-muted-foreground">
                  Access millions of songs from your favorite artists
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Sparkles size={32} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Personalized</h3>
                <p className="text-muted-foreground">
                  Create playlists and save your favorite tracks
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <TrendingUp size={32} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Trending Now</h3>
                <p className="text-muted-foreground">
                  Stay updated with the latest and hottest tracks
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Featured Albums Section */}
          {albums && albums.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-primary" />
                  Featured Albums
                </h2>
                <Button variant="ghost" onClick={() => navigate("/search?searchTxt=albums")}>
                  View All
                </Button>
              </div>
              <Albums albums={albums.slice(0, 6)} />
            </section>
          )}

          {/* Popular Artists Section */}
          {artists && artists.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  Popular Artists
                </h2>
                <Button variant="ghost" onClick={() => navigate("/search?searchTxt=artists")}>
                  View All
                </Button>
              </div>
              <RandomArtists artists={artists.slice(0, 6)} />
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center py-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Listening?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Search for your favorite songs, create playlists, and enjoy unlimited music streaming
            </p>
            <Button size="lg" onClick={handleExploreMusic} className="gap-2 text-lg px-8 mt-4">
              <Play size={20} />
              Get Started Now
            </Button>
          </section>
        </div>
      </div>
    </ScrollArea>
  );
}
