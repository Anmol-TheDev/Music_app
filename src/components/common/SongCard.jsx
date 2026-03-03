import PropTypes from "prop-types";
import { Play, Pause } from "lucide-react";
import { useStore } from "../../zustand/store";
import Menu from "../Menu";
import Like from "../ui/Like";
import { useSongHandlers } from "@/hooks/SongCustomHooks";
import { decodeHtml } from "../../lib/utils";
import { formatViews } from "../search/utils";

export default function SongCard({ song, index, context, onMenuOpenChange }) {
  const musicId = useStore((state) => state.musicId);
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const { handleSongClick } = useSongHandlers();

  if (!song) return null;

  const isCurrentSong = song.id === musicId;
  const isCurrentlyPlaying = isPlaying && isCurrentSong;
  const songName = song.name ? decodeHtml(song.name) : "Unknown Song";
  const artistName = decodeHtml(song.artists?.primary?.[0]?.name) || "Unknown Artist";
  const imageUrl = song.image?.[1]?.url || song.image?.[0]?.url || "/api/placeholder/80/80";

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      setIsPlaying(false);
    } else if (isCurrentSong) {
      setIsPlaying(true);
    } else {
      handleSongClick(song, context);
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-3 p-2 rounded-xl transition-all duration-300 cursor-pointer ${
        isCurrentSong ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-secondary/80"
      }`}
      onClick={handlePlayPause}
    >
      {/* Index number */}
      {typeof index === "number" && (
        <span className="w-5 text-center text-xs text-muted-foreground font-medium tabular-nums shrink-0">
          {index + 1}
        </span>
      )}

      {/* Thumbnail with play/pause overlay */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-sm overflow-hidden shrink-0">
        <img
          src={imageUrl}
          alt={songName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 "
        />

        {/* Dark overlay — visible on hover or when currently playing */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            isCurrentlyPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-gray-300 text-gray-300 drop-shadow-lg" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-gray-300 text-gray-300 drop-shadow-lg ml-0.5" />
          )}
        </div>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm sm:text-base font-semibold truncate ${
            isCurrentSong ? "text-primary" : ""
          }`}
        >
          {songName}
        </p>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
          {artistName && <p>{artistName}</p>}
          {song.playCount && (
            <>
              <div className="w-1 h-1 rounded-full bg-muted-foreground shrink-0"></div>
              <p>{formatViews(song.playCount)}</p>
            </>
          )}
          {song.label && (
            <>
              <div className="w-1 h-1 rounded-full bg-muted-foreground shrink-0"></div>
              <p>{song.label}</p>
            </>
          )}
        </div>
      </div>

      {/* Action buttons — like & menu, shown on hover or when active */}
      <div
        className={`flex items-center gap-1 shrink-0 transition-opacity duration-300 ${
          isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Like songId={song.id} />
        <Menu song={song} onOpenChange={onMenuOpenChange} />
      </div>
    </div>
  );
}

SongCard.propTypes = {
  song: PropTypes.object.isRequired,
  index: PropTypes.number,
  context: PropTypes.object,
  onMenuOpenChange: PropTypes.func,
};
