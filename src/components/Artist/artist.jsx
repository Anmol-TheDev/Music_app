import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Api, { fetchArtistBio } from "../../Api";
import { getImageColors } from "../color/ColorGenrator";
import { ScrollArea } from "../ui/scroll-area";
import { useStore } from "../../zustand/store";
import { Play, Pause, Shuffle } from "lucide-react";
import Menu from "../Menu";
import Like from "../ui/Like";
import { toast } from "sonner";
import { useSongHandlers, getTextColor, usePlayAll, useShuffle } from "@/hooks/SongCustomHooks";

function Artist() {
  const [data, setData] = useState(null);
  const [bio, setBio] = useState("");
  const [bgColor, setBgColor] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textColor, setTextColor] = useState("white");
  const url = useLocation();
  const { musicId, isPlaying, setIsPlaying, setCurrentList, currentArtistId } = useStore();
  const artistId = url.search.split("=")[1];
  const { handleSongClick } = useSongHandlers();
  const handlePlayAll = usePlayAll(artistId, data?.topSongs, "artist");
  const handleShuffle = useShuffle(artistId, data?.topSongs, "artist");

  useEffect(() => {
    const fetching = async () => {
      if (!artistId) {
        setIsLoading(false);
        setData(null);
        return;
      }
      try {
        setIsLoading(true);
        const res = await Api(`/api/artists/${artistId}`);
        setData(res.data.data);
        setCurrentList(res.data.data.topSongs);

        // Generate colors from the artist image
        getImageColors(res.data.data.image[2].url).then(({ averageColor, dominantColor }) => {
          setBgColor({ bg1: averageColor, bg2: dominantColor });
          setTextColor(getTextColor(dominantColor));
        });
      } catch (error) {
        toast.error("Failed to load artist data.");
        console.error("Error fetching artist data:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetching();
  }, [artistId, setCurrentList]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading artist...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Artist not found</p>
          <p className="text-sm text-muted-foreground">Please check the URL or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100dvh]">
      <div className="min-h-screen pb-32">
        {/* Hero Section */}
        <div
          className="relative w-full pt-24 pb-8"
          style={{
            background: bgColor
              ? `linear-gradient(180deg, ${bgColor.bg1} 0%, ${bgColor.bg2} 60%, transparent 100%)`
              : "linear-gradient(180deg, hsl(var(--muted)) 0%, transparent 100%)",
          }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-b to-transparent ${
              textColor === "dark" ? "from-white/80 via-white/60" : "from-black/60 via-black/50"
            }`}
          ></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={data.image[2].url}
                    alt={data.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
                {!imageLoaded && (
                  <div className="absolute inset-0 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-muted animate-pulse"></div>
                )}
              </div>

              <div className="flex-1 text-center lg:text-left space-y-4">
                <h1
                  className={`text-4xl sm:text-5xl lg:text-7xl font-bold break-words drop-shadow-lg`}
                  style={{ color: textColor === "dark" ? "#000" : "#FFF" }}
                >
                  {data.name}
                </h1>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold transition-transform hover:scale-105 shadow-lg"
                  >
                    {isPlaying && artistId === currentArtistId ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    <span>{isPlaying && artistId === currentArtistId ? "Pause" : "Play"}</span>
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-full font-semibold transition-transform hover:scale-105"
                  >
                    <Shuffle className="w-5 h-5" />
                    <span>Shuffle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Songs & Bio Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6">Popular</h2>
          <div className="space-y-2">
            {data.topSongs.map((song, index) => (
              <div
                key={song.id}
                className={`group grid grid-cols-[auto,1fr,auto] sm:grid-cols-[2rem,4fr,2fr,auto] items-center gap-4 p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/60 ${
                  song.id === musicId ? "bg-muted" : ""
                }`}
                onClick={() => handleSongClick(song, { artistId })}
              >
                <div className="flex items-center justify-center w-8">
                  <span className="text-muted-foreground group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block">
                    {isPlaying && song.id === musicId ? (
                      <Pause className="w-5 h-5 text-primary" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={song.image[1].url}
                    alt={song.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold truncate ${
                        song.id === musicId ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {song.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate sm:hidden">{data.name}</p>
                  </div>
                </div>

                <div className="hidden sm:block text-muted-foreground truncate">{data.name}</div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <Like songId={song.id} />
                  <span className="hidden sm:block font-mono text-sm">
                    {`${Math.floor(song.duration / 60)}:${(song.duration % 60)
                      .toString()
                      .padStart(2, "0")}`}
                  </span>
                  <Menu song={song} />
                </div>
              </div>
            ))}
          </div>
          {data && <ArtistBio artistData={data} bioText={bio} />}
        </div>
      </div>
    </ScrollArea>
  );
}

export default Artist;
