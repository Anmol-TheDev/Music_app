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
        setQueue(res.data.data.topSongs);

        // Generate colors from the artist image
        getImageColors(res.data.data.image[2].url).then(
          ({ averageColor, dominantColor }) => {
            setBgColor({ bg1: averageColor, bg2: dominantColor });
          }
        );
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
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[100dvh]">
      <div className="min-h-screen pb-32">
        {/* Hero Section */}
        <div
          className="relative w-full"
          style={{
            background: bgColor
              ? `linear-gradient(180deg, ${bgColor.bg1} 0%, ${bgColor.bg2} 50%, transparent 100%)`
              : "linear-gradient(180deg, hsl(var(--muted)) 0%, transparent 100%)",
          }}
        >
          <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              {/* Artist Image */}
              <div className="relative mx-auto lg:mx-0 flex-shrink-0">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-300 ${
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
                  <div className="absolute inset-0 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl bg-muted animate-pulse"></div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Artist
                  </p>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    {data.name}
                  </h1>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg min-h-[44px]"
                  >
                    {!isPlaying ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Pause className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 min-h-[44px]"
                  >
                    <Shuffle className="w-5 h-5" />
                    <span className="hidden xs:inline">Shuffle</span>
                  </button>
                  <button className="flex items-center gap-2 bg-background/20 backdrop-blur-sm hover:bg-background/30 text-foreground px-4 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 border border-border/50 min-h-[44px]">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Songs Section */}
        <div className="container mx-auto px-3 sm:px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl lg:text-3xl font-bold">Popular</h2>
            </div>

            {/* Songs List - Improved Mobile Layout */}
            <div className="space-y-1">
              {data.topSongs.map((song, index) => (
                <div
                  key={song.id || index}
                  className={`group rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                    song.id === musicId ? "bg-muted" : ""
                  } cursor-pointer`}
                  onClick={() => handleSongClick(song)}
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-center gap-3 p-3 min-h-[60px]">
                      {/* Track Number / Play Button */}
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
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
                          className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                            song.id === musicId
                              ? "block"
                              : "hidden group-hover:block"
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
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={song.image[1].url}
                          alt={song.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Song Info - More space on mobile */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3
                          className={`font-medium text-sm leading-5 ${
                            song.id === musicId
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-word",
                          }}
                        >
                          {song.name}
                        </h3>
                      </div>

                      {/* Like Button - Mobile */}
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <Like songId={song.id} />
                      </div>

                      {/* Menu Button - Always visible on mobile for better UX */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                        >
                          <Menu song={song} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/Tablet Layout */}
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-4 p-3 lg:p-4">
                      {/* Track Number / Play Button */}
                      <div className="w-6 flex items-center justify-center flex-shrink-0">
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
                          className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${
                            song.id === musicId
                              ? "block"
                              : "hidden group-hover:block"
                          }`}
                        >
                          {isPlaying && song.id === musicId ? (
                            <Pause
                              className="w-4 h-4 text-primary cursor-pointer hover:scale-110 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsPlaying(false);
                              }}
                            />
                          ) : (
                            <Play className="w-4 h-4 text-primary cursor-pointer hover:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>

                      {/* Song Image */}
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={song.image[1].url}
                          alt={song.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium truncate ${
                            song.id === musicId
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {song.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {data.name}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="text-sm text-muted-foreground font-mono">
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, "0")}
                      </div>

                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <Like songId={song.id} />
                      </div>

                      {/* Menu Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Menu song={song} />
                        </button>
                      </div>
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
