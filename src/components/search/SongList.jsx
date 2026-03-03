import PropTypes from "prop-types";
import { ScrollArea } from "../ui/scroll-area";
import SongCard from "../common/SongCard";

export default function SongList({ songs }) {
  if (!songs) return null;

  return (
    <div className="w-[95vw] sm:w-full lg:w-2/3 border rounded-xl p-4 shadow-lg md:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Songs</h2>
      <ScrollArea className="h-[35vh]">
        <div className="space-y-1">
          {songs.map((song, index) => (
            <SongCard key={song.id || index} song={song} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

SongList.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.object),
};
