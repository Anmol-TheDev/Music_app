import PropTypes from "prop-types";
import SongCard from "../common/SongCard";

export default function ArtistSongs({ songs, artistId }) {
  if (!songs || songs.length === 0) return null;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8">
      <div className="space-y-4">
        <div className="px-1">
          <h2 className="text-2xl lg:text-3xl font-bold">Popular</h2>
        </div>

        <div className="space-y-1">
          {songs.map((song, index) => (
            <SongCard key={song.id || index} song={song} index={index} context={{ artistId }} />
          ))}
        </div>
      </div>
    </div>
  );
}

ArtistSongs.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.object).isRequired,
  artistId: PropTypes.string.isRequired,
};
