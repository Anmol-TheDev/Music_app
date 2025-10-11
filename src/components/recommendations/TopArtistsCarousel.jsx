import { useEffect } from "react";
import { useFetch, useStore } from "../../zustand/store";
import { Card, CardContent } from "../ui/card";
import RecommendationSection from "./RecommendationSection";
import { useNavigate, createSearchParams } from "react-router-dom";

export default function TopArtistsCarousel() {
  const { fetchTopArtistsCarousel, topArtistsCarousel } = useFetch();
  const setArtistId = useStore((state) => state.setArtistId);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopArtistsCarousel();
  }, []);

  const handleArtistClick = (artistId) => {
    setArtistId(artistId);
    // Match your existing Artist navigation pattern
    const path = {
      pathname: "/artist",
      search: createSearchParams({ Id: artistId }).toString(),
    };
    navigate(path);
  };

  if (!topArtistsCarousel || topArtistsCarousel.length === 0) return null;

  return (
    <RecommendationSection title="Top Artists" emoji="🌟">
      {topArtistsCarousel.map((artist) => (
        <Card
          key={artist.id}
          className="min-w-[200px] group cursor-pointer hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
          onClick={() => handleArtistClick(artist.id)}
        >
          <CardContent className="p-4 relative">
            <div className="relative mb-3">
              <img
                src={artist.image?.[2]?.url || artist.image?.[1]?.url || artist.image?.[0]?.url}
                alt={artist.name}
                loading="lazy"
                className="w-full aspect-square object-cover rounded-full shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-base truncate">{artist.name}</h3>
              <p className="text-xs text-muted-foreground">Artist</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </RecommendationSection>
  );
}
