import PropTypes from "prop-types";
import { PlayCircle, Pause } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useStore } from "../../zustand/store";
import Menu from "../Menu";
import Like from "../ui/Like";
import { useSongHandlers } from "@/hooks/SongCustomHooks";
import { decodeHtml } from "../../lib/utils";

export default function SongList({ songs }) {
  const musicId = useStore((state) => state.musicId);
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const { handleSongClick } = useSongHandlers();

  if (!songs) return null;

  return (
    <div className="w-[95vw] sm:w-full lg:w-2/3 border rounded-xl p-4 shadow-lg md:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Songs</h2>
      <ScrollArea className="h-[40vh]   sm:h-[50vh]">
        <ul className="space-y-2 ">
          {songs.map((song, index) => (
            <li
              key={index}
              className={` ${
                song.id === musicId ? "bg-secondary" : "bg-background"
              } flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all hover:bg-secondary hover:scale-[1.03] duration-200 `}
            >
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="w-4 sm:w-6 text-center text-sm sm:text-base">{index + 1}</span>
                <img
                  src={song.image ? song.image[0].url : "/api/placeholder/40/40"}
                  alt={decodeHtml(song.name)}
                  loading="lazy"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded "
                />
                <div>
                  <p className="font-medium text-sm sm:text-base truncate w-24">
                    {song.name ? decodeHtml(song.name) : "Iss Duniya ka Papa"}
                  </p>
                  <p className="text-xs sm:text-sm">{decodeHtml(song.artists?.primary[0]?.name)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-xs sm:text-sm">
                  {Math.floor(song.duration / 60)}:
                  {(song.duration % 60).toString().padStart(2, "0")}
                </span>
                <Like songId={song.id} />
                {isPlaying && song.id === musicId ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" onClick={() => setIsPlaying(false)} />
                ) : (
                  <PlayCircle
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    onClick={() => handleSongClick(song)}
                  />
                )}

                <Menu song={song} />
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}

SongList.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.object),
};
