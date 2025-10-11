import { useEffect } from "react";
import { useFetch, useStore } from "../../zustand/store";
import { Card, CardContent } from "../ui/card";
import { Play } from "lucide-react";
import RecommendationSection from "./RecommendationSection";
import { useNavigate } from "react-router-dom";

export default function NewReleases() {
  const { fetchNewReleases, newReleases } = useFetch();
  const setAlbumId = useStore((state) => state.setAlbumId);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewReleases();
  }, []);

  const handleAlbumClick = (albumId) => {
    setAlbumId(albumId);
    navigate(`/album/${albumId}`);
  };

  if (!newReleases || newReleases.length === 0) return null;

  return (
    <RecommendationSection title="New Releases" emoji="🆕">
      {newReleases.map((album) => (
        <Card
          key={album.id}
          className="min-w-[280px] group cursor-pointer hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
          onClick={() => handleAlbumClick(album.id)}
        >
          <CardContent className="p-4 relative">
            <div className="relative mb-3">
              <img
                src={album.image?.[2]?.url || album.image?.[1]?.url || album.image?.[0]?.url}
                alt={album.name}
                loading="lazy"
                className="w-full aspect-square object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-200 transform hover:scale-110">
                  <Play size={28} />
                </button>
              </div>
              {album.year && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {album.year}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base truncate">{album.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {album.artists?.primary?.[0]?.name || album.artist || "Various Artists"}
              </p>
              {album.songCount && (
                <p className="text-xs text-muted-foreground">{album.songCount} songs</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </RecommendationSection>
  );
}
