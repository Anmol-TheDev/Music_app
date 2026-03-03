import PropTypes from "prop-types";
import { Play, Pause, Share2, Shuffle } from "lucide-react";
import { useStore } from "../../zustand/store";
import { usePlayAll, useShuffle } from "@/hooks/SongCustomHooks";
import { decodeHtml } from "@/lib/utils";
import { formatViews } from "../search/utils";
import { useState } from "react";

export default function ArtistHero({ data, artistId }) {
  const isPlaying = useStore((state) => state.isPlaying);
  const currentArtistId = useStore((state) => state.currentArtistId);
  const handlePlayAll = usePlayAll(artistId, data?.topSongs, "artist");
  const handleShuffle = useShuffle(artistId, data?.topSongs, "artist");
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = data.image?.[2]?.url || data.image?.[1]?.url;
  const artistName = decodeHtml(data.name);
  const fanCount = data.fanCount || data.followerCount;
  const bio = data.bio?.length > 0 ? decodeHtml(data.bio[0]?.text || data.bio[0]) : null;

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/6] max-h-[70vh] overflow-hidden">
      {/* Full-bleed background image */}
      {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <img
        src={imageUrl}
        alt={artistName}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Bottom inner shadow gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-40% to-transparent" />

      {/* Content overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-3">
          {/* Artist name */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-foreground drop-shadow-lg leading-tight">
            {artistName}
          </h1>

          {/* Stats */}
          {fanCount && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {formatViews(Number(fanCount))} monthly listeners
            </p>
          )}

          {/* Bio snippet */}
          {bio && (
            <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-2xl line-clamp-2">
              {bio}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border border-border/30"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {!isPlaying || artistId != currentArtistId ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
              <span>Play</span>
            </button>
            <button className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary/80 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border border-border/30">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ArtistHero.propTypes = {
  data: PropTypes.object.isRequired,
  artistId: PropTypes.string.isRequired,
};
