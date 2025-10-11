import { useEffect } from "react";
import { useFetch, useStore } from "../../zustand/store";
import { Card, CardContent } from "../ui/card";
import { Play, Pause } from "lucide-react";
import RecommendationSection from "./RecommendationSection";
import { useSongHandlers } from "@/hooks/SongCustomHooks";

export default function TrendingTracks() {
  const { fetchTrendingTracks, trendingTracks } = useFetch();
  const musicId = useStore((state) => state.musicId);
  const isPlaying = useStore((state) => state.isPlaying);
  const { handleSongClick } = useSongHandlers();

  useEffect(() => {
    fetchTrendingTracks();
  }, []);

  if (!trendingTracks || trendingTracks.length === 0) return null;

  return (
    <RecommendationSection title="Top Trending Tracks" emoji="🎵">
      {trendingTracks.map((song) => (
        <Card
          key={song.id}
          className="min-w-[280px] group cursor-pointer hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
        >
          <CardContent className="p-4 relative">
            <div className="relative mb-3">
              <img
                src={song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url}
                alt={song.name}
                loading="lazy"
                className="w-full aspect-square object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                {isPlaying && song.id === musicId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useStore.getState().setIsPlaying(false);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-200 transform hover:scale-110"
                  >
                    <Pause size={28} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSongClick(song);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-200 transform hover:scale-110"
                  >
                    <Play size={28} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base truncate">{song.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {song.artists?.primary?.[0]?.name || song.label || "Unknown Artist"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </RecommendationSection>
  );
}
