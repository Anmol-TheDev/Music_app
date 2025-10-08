import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { Music, Play, TrendingUp, Clock, Heart, Radio } from "lucide-react";
import { Button } from "./ui/button";
import { useFetch } from "../zustand/store";
import Albums from "./Album/Albums";
import RandomArtists from "./Artist/artists";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const navigate = useNavigate();
  const { fetchSongs, fetchAlbums, albums, fetchArtists, artists } = useFetch();
  const [isLoading, setIsLoading] = useState(true);

  // Quick navigation categories inspired by YouTube Music
  const quickCategories = [
    { label: "Top Hits", icon: TrendingUp, search: "top hits" },
    { label: "Recently Played", icon: Clock, search: "trending" },
    { label: "Favorites", icon: Heart, search: "popular" },
    { label: "Radio", icon: Radio, search: "radio" },
  ];

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
        {/* Hero Section with Background Image - Melodies Style */}
        <div className="relative overflow-hidden border-b border-border">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {/* Background Image - Clear and bright */}
            <img
              src="./herosectionbgimage/bghero1.png"
              alt="Music Background"
              className="w-full h-full object-fill"
            />

            {/* Adaptive overlay - darker for light mode, lighter for dark mode */}
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/40 via-black/30 to-black/20 md:from-black/50 md:via-black/35 md:to-transparent dark:from-background/70 dark:via-background/50 dark:to-background/30 dark:md:from-background/60 dark:md:via-background/40 dark:md:to-transparent z-10"></div>
          </div>

          {/* Content over the background */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 lg:py-32 min-h-[500px] sm:min-h-[550px] md:min-h-[600px] flex items-center">
            <div className="w-full md:max-w-2xl">
              {/* Hero Content */}
              <div className="space-y-4 sm:space-y-6 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  All the{" "}
                  <span className="text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    Best Songs
                  </span>
                  <br />
                  in One Place
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl mx-auto md:mx-0 leading-relaxed px-4 md:px-0 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] font-medium">
                  On our website, you can listen to various genres - EDM, rock, pop, jazz,
                  classical, and much more. We also offer personalized playlists based on your
                  preferences.
                </p>

                {/* CTA Button */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    size="lg"
                    onClick={handleExploreMusic}
                    className="gap-2 px-8 sm:px-10 py-5 sm:py-6 text-sm sm:text-base font-semibold w-full sm:w-auto"
                  >
                    <Play size={18} className="fill-current" />
                    Explore Music
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation Chips - Modern Design */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
              {quickCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.label}
                    variant="outline"
                    onClick={() =>
                      navigate(`/search?searchTxt=${encodeURIComponent(category.search)}`)
                    }
                    className={cn(
                      "group relative gap-2.5 rounded-full px-5 sm:px-7 py-5 sm:py-6",
                      "border-2 border-border/60 bg-background/40 backdrop-blur-sm",
                      "text-sm sm:text-base font-medium",
                      "hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20",
                      "hover:scale-105 active:scale-95",
                      "transition-all duration-300 ease-out"
                    )}
                  >
                    <Icon
                      size={16}
                      className="sm:hidden group-hover:rotate-12 transition-transform duration-300"
                    />
                    <Icon
                      size={20}
                      className="hidden sm:block group-hover:rotate-12 transition-transform duration-300"
                    />
                    <span className="relative">{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Sections - Responsive */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16 py-12 sm:py-16">
          {/* Featured Albums Section */}
          {albums && albums.length > 0 && (
            <section className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between px-2 sm:px-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  Weekly Top <span className="text-primary">Songs</span>
                </h2>
                <Button
                  variant="link"
                  onClick={() => navigate("/search?searchTxt=albums")}
                  className="text-sm sm:text-base hover:text-primary"
                >
                  View All →
                </Button>
              </div>
              <Albums albums={albums.slice(0, 6)} />
            </section>
          )}

          {/* Popular Artists Section */}
          {artists && artists.length > 0 && (
            <section className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between px-2 sm:px-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  Popular <span className="text-primary">Artists</span>
                </h2>
                <Button
                  variant="link"
                  onClick={() => navigate("/search?searchTxt=artists")}
                  className="text-sm sm:text-base hover:text-primary"
                >
                  View All →
                </Button>
              </div>
              <RandomArtists artists={artists.slice(0, 6)} />
            </section>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
