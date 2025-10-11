import { useEffect } from "react";
import { useFetch } from "../../zustand/store";
import { Card, CardContent } from "../ui/card";
import { Play } from "lucide-react";
import RecommendationSection from "./RecommendationSection";

export default function PopularPlaylists() {
  const { fetchPopularPlaylists, popularPlaylists } = useFetch();

  useEffect(() => {
    fetchPopularPlaylists();
  }, []);

  if (!popularPlaylists || popularPlaylists.length === 0) return null;

  return (
    <RecommendationSection title="Popular Playlists" emoji="🎶">
      {popularPlaylists.map((playlist) => (
        <Card
          key={playlist.id}
          className="min-w-[280px] group cursor-pointer hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
        >
          <CardContent className="p-4 relative">
            <div className="relative mb-3">
              <img
                src={
                  playlist.image?.[2]?.url || playlist.image?.[1]?.url || playlist.image?.[0]?.url
                }
                alt={playlist.name}
                loading="lazy"
                className="w-full aspect-square object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-200 transform hover:scale-110">
                  <Play size={28} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base truncate">{playlist.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {playlist.artists?.primary?.[0]?.name || "Curated Playlist"}
              </p>
              {playlist.songCount && (
                <p className="text-xs text-muted-foreground">{playlist.songCount} songs</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </RecommendationSection>
  );
}
