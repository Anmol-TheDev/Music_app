import { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useFetch } from "../../zustand/store";
import { useIsMobile } from "@/hooks/SongCustomHooks";

function RandomArtists({ search }) {
  const navigate = useNavigate();
  const { artists, fetchArtists } = useFetch();

  useEffect(() => {
    fetchArtists(search);
  }, [search, fetchArtists]); // ✅ Added fetchArtists dependency

  function handleClick(Id) {
    const path = {
      pathname: "/artist",
      search: createSearchParams({ Id }).toString(),
    };
    navigate(path);
  }

  const isMobile = useIsMobile();

  return (
    <>
      {artists && (
        <div
          className={`mt-6 w-[95vw] sm:w-full sm:mt-8 border p-4 rounded-xl shadow-lg ${
            isMobile ? "mb-24" : ""
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Artists</h2>
          <div className="flex space-x-4 overflow-x-scroll">
            {artists?.map((artist, i) => (
              <div
                key={i}
                className="bg-secondary rounded-2xl p-3 sm:p-4 flex flex-col items-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleClick(artist.id)}
              >
                {artist?.image?.[2] ? (
                  <img
                    src={artist?.image[2].url}
                    alt={artist?.name}
                    loading="lazy"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                    <span>No Image</span>
                  </div>
                )}
                <h3 className="text-center w-32 sm:w-32 text-xs sm:text-sm truncate">
                  {artist?.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

RandomArtists.propTypes = {
  search: PropTypes.string.isRequired,
};

export default RandomArtists;
