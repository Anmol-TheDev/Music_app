import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Api from "../../Api";
import { getImageColors } from "../color/ColorGenrator";
import { ScrollArea } from "../ui/scroll-area";
import { useStore } from "../../zustand/store";
import { Play, Pause, Share2, Shuffle } from "lucide-react";
import Menu from "../Menu";
import Like from "../ui/Like";
import { toast } from "sonner";

function Artist() {
  const [data, setData] = useState();
  const [bgColor, setBgColor] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  let url = useLocation();
  const { setMusicId, musicId, isPlaying, setIsPlaying, setQueue } = useStore();
  const artistId = url.search.split("=")[1];

  useEffect(() => {
    const fetching = async () => {
      try {
        setIsLoading(true);
        const res = await Api(`/api/artists/${artistId}`);
        setData(res.data.data);
        console.log(res.data);
        setQueue(res.data.data.topSongs);

        // Generate colors from the artist image
        getImageColors(res.data.data.image[2].url).then(({ averageColor, dominantColor }) => {
          setBgColor({ bg1: averageColor, bg2: dominantColor });
        });
      } catch (error) {
        toast.error("Failed to load artist data.");
        console.error("Error fetching artist data:", error);
        setData(null); // Ensure data is null on error to trigger "Artist not found" UI
      } finally {
        setIsLoading(false);
      }
    };
    fetching();
  }, [artistId]);

  function handleSongClick(song) {
    if (song.id !== musicId) {
      setMusicId(song.id);
    } else {
      setIsPlaying(true);
    }
  }

  function handlePlayAll() {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (data?.topSongs?.length > 0 && musicId == null) {
        setMusicId(data.topSongs[0].id);
        setIsPlaying(true);
      } else setIsPlaying(true);
    }
  }

  function handleShuffle() {
    if (data?.topSongs?.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.topSongs.length);
      setMusicId(data.topSongs[randomIndex].id);
      setIsPlaying(true);
    }
  }

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
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100dvh]">
      <div className="min-h-screen pb-32">
        {/* Hero Section */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            background: bgColor
              ? `linear-gradient(180deg, ${bgColor.bg1} 0%, ${bgColor.bg2} 60%, transparent 100%)`
              : "linear-gradient(180deg, hsl(var(--muted)) 0%, transparent 100%)",
          }}
        >
          {/* Soft Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none"></div>

          <div className="container mx-auto px-4 py-12 lg:py-20 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start">
              {/* Artist Image */}
              <div className="relative mx-auto lg:mx-0 flex-shrink-0 group">
                <div
                  className={`w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.25)] 
          transition-all duration-700 transform group-hover:scale-[1.03] group-hover:-translate-y-1 ${
            imageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
                >
                  <img
                    src={data.image[2].url}
                    alt={data.name}
                    loading="lazy"
                    className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
                {!imageLoaded && (
                  <div className="absolute inset-0 rounded-3xl bg-muted animate-pulse"></div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="space-y-3">
                  <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground/150">
                    Artist
                  </p>
                  <div className="overflow-visible">
                    <h1
                      className="text-3xl sm:text-6xl lg:text-6xl font-extrabold leading-[1.15] bg-clip-text text-transparent 
                        bg-gradient-to-r from-primary via-pink-500 to-purple-600 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] pb-2"
                    >
                      {data.name}
                    </h1>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 
            rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                    {!isPlaying ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    <span>Play All</span>
                  </button>

                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 
            rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                  >
                    <Shuffle className="w-5 h-5" />
                    <span>Shuffle</span>
                  </button>

                  <button
                    className="flex items-center gap-2 bg-background/10 backdrop-blur-md hover:bg-background/20 
            text-foreground border border-border/20 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Songs Section */}
        <div className="container mx-auto px-3 sm:px-4 py-10">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
                Popular
              </h2>
            </div>

            {/* Songs List */}
            <div className="space-y-2 sm:space-y-3">
              {data.topSongs.map((song, index) => (
                <div
                  key={song.id || index}
                  className={`group rounded-xl border border-transparent transition-all duration-300 hover:border-muted-foreground/20 hover:shadow-md hover:bg-muted/40 backdrop-blur-sm ${
                    song.id === musicId ? "bg-muted border-muted-foreground/30" : ""
                  } cursor-pointer`}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="flex items-center justify-between gap-4 p-3 lg:p-4">
                    {/* Left Section: Number + Image + Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Number / Play Button */}
                      <div className="w-6 sm:w-8 flex items-center justify-center flex-shrink-0">
                        <span
                          className={`text-sm text-muted-foreground group-hover:hidden ${
                            song.id === musicId ? "hidden" : ""
                          }`}
                        >
                          {index + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSongClick(song);
                          }}
                          className={`transition-all duration-200 ${
                            song.id === musicId ? "block" : "hidden group-hover:block"
                          }`}
                        >
                          {isPlaying && song.id === musicId ? (
                            <Pause
                              className="w-5 h-5 text-primary cursor-pointer hover:scale-110 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsPlaying(false);
                              }}
                            />
                          ) : (
                            <Play className="w-5 h-5 text-primary cursor-pointer hover:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>

                      {/* Song Image */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={song.image[1].url}
                          alt={song.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Subtle overlay on hover */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-sm sm:text-base truncate ${
                            song.id === musicId
                              ? "text-primary"
                              : "text-foreground group-hover:text-primary transition-colors"
                          }`}
                        >
                          {
                            // Clean up unwanted text like (From "...") or HTML entities like &quot;
                            song.name
                              ?.replace(/ *\([^)]*\)/g, "")
                              ?.replace(/&quot;/g, '"')
                              ?.trim()
                          }
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {data.name}
                        </p>
                      </div>
                    </div>

                    {/* Right Section: Duration + Like + Menu */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, "0")}
                      </span>

                      <Like songId={song.id} />

                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Menu song={song} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default Artist;
