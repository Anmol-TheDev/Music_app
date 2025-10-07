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
  const [data, setData] = useState<any>();
  const [bgColor, setBgColor] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textColor, setTextColor] = useState("white");
  const url = useLocation();
  const { setMusicId, musicId, isPlaying, setIsPlaying, setQueue, currentArtistId, setArtistId } =
    useStore();
  const artistId = (url.search || "").split("=")[1];

  const getTextColor = (rgbColor: string) => {
    const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return "white";
    const r = Number.parseInt(match[1]);
    const g = Number.parseInt(match[2]);
    const b = Number.parseInt(match[3]);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "dark" : "white";
  };

  useEffect(() => {
    const fetching = async () => {
      try {
        setIsLoading(true);
        const res = await Api(`/api/artists/${artistId}`);
        setData(res.data.data);
        setQueue(res.data.data.topSongs);
        getImageColors(res.data.data.image[2].url).then(({ averageColor, dominantColor }: any) => {
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
  }, [artistId, setQueue]);

  function handleSongClick(song: any) {
    if (song.id !== musicId) {
      setMusicId(song.id);
      setArtistId(artistId);
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function handlePlayAll() {
    if (currentArtistId == artistId) {
      setIsPlaying(!isPlaying);
    } else {
      if (data.topSongs?.length > 0) {
        setQueue(data.topSongs);
        setMusicId(data.topSongs[0].id);
        setIsPlaying(true);
        setArtistId(artistId);
      }
    }
  }

  function handleShuffle() {
    if (data?.topSongs?.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.topSongs.length);
      setMusicId(data.topSongs[randomIndex].id);
      setIsPlaying(true);
      setArtistId(artistId);
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
        <div
          className="relative w-full pb-8"
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

          <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
              <div className="relative mx-auto sm:mx-0 flex-shrink-0 hover:scale-105 transition-transform">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={data.image[2].url || "/placeholder.svg"}
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

              <div className="flex-1 text-center sm:text-left space-y-4 lg:space-y-6">
                <div className="space-y-2">
                  <p
                    className={`text-sm font-medium uppercase tracking-wider drop-shadow-md opacity-90`}
                  >
                    Artist
                  </p>
                  <h1
                    className={`text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight break-words drop-shadow-lg`}
                  >
                    {data.name}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg min-h-[44px]"
                  >
                    {!isPlaying || artistId != currentArtistId ? (
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
                  <button
                    className={`flex items-center gap-2 backdrop-blur-sm px-4 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 min-h-[44px] shadow-md ${
                      textColor === "dark"
                        ? "bg-background/20 hover:bg-background/30 text-foreground border border-border/50"
                        : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    }`}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl lg:text-3xl font-bold">Popular</h2>
            </div>

            <div className="space-y-1">
              {data.topSongs.map((song: any, index: number) => (
                <div
                  key={song.id || index}
                  className={`group rounded-lg transition-all duration-200 hover:bg-muted/50 ${song.id === musicId ? "bg-muted" : ""} cursor-pointer`}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="sm:hidden">
                    <div className="flex items-center gap-3 p-3 min-h-[60px]">
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span
                          className={`text-sm text-muted-foreground group-hover:hidden ${song.id === musicId ? "hidden" : ""}`}
                        >
                          {index + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSongClick(song);
                          }}
                          className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${song.id === musicId ? "block" : "hidden group-hover:block"}`}
                        >
                          {isPlaying && song.id === musicId ? (
                            <Pause
                              className="w-5 h-5 text-primary cursor-pointer hover:scale-125 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsPlaying(false);
                              }}
                            />
                          ) : (
                            <Play className="w-8 h-5 text-primary cursor-pointer hover:scale-125 transition-transform" />
                          )}
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={song.image[1].url || "/placeholder.svg"}
                          alt={song.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <h3
                          className={`font-medium text-sm leading-5 ${song.id === musicId ? "text-primary" : "text-foreground"}`}
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

                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <Like songId={song.id} />
                      </div>

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

                  <div className="hidden sm:block">
                    <div className="flex items-center gap-4 p-3 lg:p-4">
                      <div className="w-6 flex items-center justify-center flex-shrink-0">
                        <span
                          className={`text-sm text-muted-foreground group-hover:hidden ${song.id === musicId ? "hidden" : ""}`}
                        >
                          {index + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSongClick(song);
                          }}
                          className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${song.id === musicId ? "block" : "hidden group-hover:block"}`}
                        >
                          {isPlaying && song.id === musicId ? (
                            <Pause
                              className="w-5 h-5 text-primary cursor-pointer hover:scale-125 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsPlaying(false);
                              }}
                            />
                          ) : (
                            <Play className="w-6 h-5 text-primary cursor-pointer hover:scale-125 transition-transform" />
                          )}
                        </button>
                      </div>

                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={song.image[1].url || "/placeholder.svg"}
                          alt={song.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium truncate ${song.id === musicId ? "text-primary" : "text-foreground"}`}
                        >
                          {song.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{data.name}</p>
                      </div>

                      <div className="text-sm text-muted-foreground font-mono">
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, "0")}
                      </div>

                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <Like songId={song.id} />
                      </div>

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
