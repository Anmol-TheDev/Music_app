import PropTypes from "prop-types";
import { Play, Pause, Share2, Shuffle, Plus } from "lucide-react";
import { useStore } from "../../zustand/store";
import { usePlayAll, useShuffle, formatArtist, useIsMobile } from "@/hooks/SongCustomHooks";
import { decodeHtml } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export default function AlbumHero({ albumData, songs, albumId, onAddToPlaylist }) {
  const isPlaying = useStore((state) => state.isPlaying);
  const currentAlbumId = useStore((state) => state.currentAlbumId);
  const handlePlayAll = usePlayAll(albumId, songs, "album");
  const handleShuffle = useShuffle(albumId, songs, "album");
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = albumData.image?.[2]?.url || albumData.image?.[1]?.url;
  const albumName = decodeHtml(albumData.name);

  const totalDuration = songs?.reduce((acc, song) => acc + song.duration, 0) || 0;
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  const year = albumData.year;
  const artists = formatArtist(albumData, true, isMobile);

  const handleCopyLink = async () => {
    const link = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Link copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy link");
      console.error("Copy link error:", e);
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/6] max-h-[70vh] overflow-hidden">
      {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
      <img
        src={imageUrl}
        alt={albumName}
        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-40% to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-3">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Album
          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-foreground drop-shadow-lg leading-tight">
            {albumName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {year && <span>{year}</span>}
            {year && <span>•</span>}
            <span dangerouslySetInnerHTML={{ __html: artists }} />
            <span>•</span>
            <span>{songs?.length || 0} songs</span>
            <span>•</span>
            <span>{totalHours > 0 ? `${totalHours}h ${displayMinutes}m` : `${totalMinutes}m`}</span>
          </div>

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
              {!isPlaying || currentAlbumId != albumId ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
              <span>Play</span>
            </button>
            <button
              onClick={onAddToPlaylist}
              className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary/80 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border border-border/30"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary/80 backdrop-blur-sm text-foreground px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border border-border/30"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

AlbumHero.propTypes = {
  albumData: PropTypes.object.isRequired,
  songs: PropTypes.array,
  albumId: PropTypes.string.isRequired,
  onAddToPlaylist: PropTypes.func.isRequired,
};
