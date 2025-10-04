import { useEffect, useState } from "react";
import { Play, Plus, Clock, Pause, Share2, Shuffle } from "lucide-react";
import { useLocation } from "react-router-dom";
import Api from "../../Api";
import { useStore } from "../../zustand/store";
import { getImageColors } from "../color/ColorGenrator";
import { ScrollArea } from "../ui/scroll-area";
import Menu from "../Menu";
import Like from "../ui/Like";
import { toast } from "sonner";

export default function Album() {
  const [albumData, setAlbumData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const url = useLocation();
  const { setMusicId, musicId, isPlaying, setIsPlaying, setQueue } = useStore();
  const albumId = url?.search.split("=")[1];
  const [songs, setSongs] = useState(null);
  const [bgColor, setBgColor] = useState();

  useEffect(() => {
    const fetching = async () => {
      try {
        setIsLoading(true);
        const res = await Api(`/api/albums?id=${albumId}`);
        setAlbumData(res.data.data);
        setSongs(res.data.data.songs);
        setQueue(res.data.data.songs);
        getImageColors(res.data.data.image[2].url).then(
          ({ averageColor, dominantColor }) => {
            setBgColor({ bg1: averageColor, bg2: dominantColor });
          }
        );
      } catch (error) {
        toast.error("Failed to load album data.");
        console.error("Album API fetch error:", error);
        setAlbumData(null); // Ensure albumData is null on error to trigger "Album not found" UI
      } finally {
        setIsLoading(false);
      }
    };
    fetching();
  }, [albumId]);

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
      if (songs?.length > 0 && musicId == null) {
        setMusicId(songs[0].id);
        setIsPlaying(true);
      } else setIsPlaying(true);
    }
  }

  function handleShuffle() {
    if (songs?.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setMusicId(songs[randomIndex].id);
      setIsPlaying(true);
    }
  }

  // Calculate total duration
  const totalDuration =
    songs?.reduce((acc, song) => acc + song.duration, 0) || 0;
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading album...</p>
        </div>
      </div>
    );
  }

  if (!albumData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Album not found</p>
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
            <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 items-start">
              {/* Album Cover */}
              <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={albumData.image[2].url}
                    alt={`${albumData.name} album cover`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
                {!imageLoaded && (
                  <div className="absolute inset-0 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl bg-muted animate-pulse"></div>
                )}
              </div>

              {/* Album Info */}
              <div className="flex-1 text-center sm:text-left space-y-4 lg:space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Album
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight break-words">
                    {albumData.name}
                  </h1>
                </div>

                {/* Album Description */}
                {albumData.description && (
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    {albumData.description}
                  </p>
                )}

                {/* Album Stats */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                  <span>{songs?.length || 0} songs</span>
                  <span>•</span>
                  <span>
                    {totalHours > 0
                      ? `${totalHours}h ${displayMinutes}m`
                      : `${totalMinutes}m`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg min-h-[44px]"
                  >
                    {!isPlaying ? (
                      <Play className="w-5 h-5" />
                    ) : (
                      <Pause className="w-5 h-5" />
                    )}
                    <span className="hidden xs:inline">Play</span>
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 min-h-[44px]"
                  >
                    <Shuffle className="w-5 h-5" />
                    <span className="hidden xs:inline">Shuffle</span>
                  </button>
                  <button className="flex items-center gap-2 bg-background/20 backdrop-blur-sm hover:bg-background/30 text-foreground px-4 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 border border-border/50 min-h-[44px]">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 bg-background/20 backdrop-blur-sm hover:bg-background/30 text-foreground px-4 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 border border-border/50 min-h-[44px]">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div className="container mx-auto px-3 sm:px-4 py-8">
          <div className="space-y-6">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[40px_1fr_80px_40px_40px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border/50">
              <div className="text-center">#</div>
              <div>Title</div>
              <div className="text-center">
                <Clock className="w-4 h-4 mx-auto" />
              </div>
              <div></div>
              <div></div>
            </div>

            {/* Songs List */}
            <div className="space-y-1">
              {songs?.map((song, index) => (
                <div
                  key={song.id || index}
                  className={`group rounded-lg transition-all duration-200 hover:bg-muted/50 cursor-pointer ${
                    song.id === musicId ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSongClick(song)}
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden">
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

                      {/* Song Info - Mobile */}
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
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground truncate flex-1 ">
                            {albumData.name}
                          </p>
                        </div>
                      </div>

                      {/* Like Button - Mobile */}
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <Like songId={song.id} />
                      </div>

                      {/* Menu Button */}
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

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-[40px_1fr_80px_40px_40px] gap-4 items-center px-4 py-3 group">
                      {/* Track Number / Play Button */}
                      <div className="flex items-center justify-center">
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

                      {/* Song Title */}
                      <div className="min-w-0">
                        <h3
                          className={`font-medium truncate ${
                            song.id === musicId
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                          title={song.name}
                        >
                          {song.name}
                        </h3>
                      </div>

                      {/* Duration */}
                      <div className="text-sm text-muted-foreground font-mono text-center">
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, "0")}
                      </div>

                      <div className="flex justify-center">
                        <Like songId={song.id} />
                      </div>

                      {/* Menu Button */}
                      <div className="flex justify-center">
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
