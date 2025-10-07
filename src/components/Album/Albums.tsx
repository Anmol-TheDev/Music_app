import { useEffect } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { Label } from "../ui/label";
import { useFetch } from "../../zustand/store";
import { ScrollArea } from "../ui/scroll-area";

function Albums({ search }: { search: string }) {
  const { albums, fetchAlbums } = useFetch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlbums(search);
  }, [search]);

  const handleAlbumsClick = (Id: string) => {
    const path = {
      pathname: "/album",
      search: createSearchParams({ Id }).toString(),
    } as any;
    navigate(path);
  };

  return (
    <>
      {albums && (
        <div className="mt-6 w-[95vw] sm:w-full sm:mt-8 border p-4 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Albums</h2>
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {albums.map((album: any, index: number) => (
              <div
                onClick={() => handleAlbumsClick(album.id)}
                key={index}
                className="bg-secondary rounded-2xl p-3 sm:p-4 flex flex-col items-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={album.image?.[2]?.url}
                  alt={album.name}
                  loading="lazy"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mb-2"
                />
                <Label className="text-center w-32 sm:w-32 text-xs sm:text-sm truncate">
                  {album.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Albums;
