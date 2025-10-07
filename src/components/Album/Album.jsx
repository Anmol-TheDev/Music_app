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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { fetchFireStore, pushManyToDb, createPlaylistWithSongs } from "../../Api";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../ui/drawer";

export default function Album() {
  const [albumData, setAlbumData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textColor, setTextColor] = useState("white");
  const url = useLocation();
  const {
    setMusicId,
    musicId,
    isPlaying,
    setIsPlaying,
    setQueue,
    currentAlbumId,
    setAlbumId,
    playlist,
    setPlaylist,
    setLikedSongs,
  } = useStore();
  const searchParams = new URLSearchParams(url.search);
  const albumId = searchParams.get("Id");
  const [songs, setSongs] = useState(null);
  const [bgColor, setBgColor] = useState();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Function to calculate luminance and determine text color
  const getTextColor = (rgbColor) => {
    // Extract RGB values from rgb(r, g, b) string
    const match = rgbColor.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/);
    if (!match) return "white";

    const r = Number.parseInt(match[1]);
    const g = Number.parseInt(match[2]);
    const b = Number.parseInt(match[3]);

    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // If luminance > 0.6, use dark text, otherwise use white text
    return luminance > 0.6 ? "dark" : "white";
  };

  useEffect(() => {
    const fetching = async () => {
      try {
        setIsLoading(true);
        const res = await Api(`/api/albums?id=${albumId}`);
        setAlbumData(res.data.data);
        setSongs(res.data.data.songs);
        setQueue(res.data.data.songs);
        getImageColors(res.data.data.image[2].url).then(({ averageColor, dominantColor }) => {
          setBgColor({ bg1: averageColor, bg2: dominantColor });
          // Determine text color based on background brightness
          setTextColor(getTextColor(dominantColor));
        });
      } catch (error) {
        toast.error("Failed to load album data.");
        console.error("Album API fetch error:", error);
        setAlbumData(null); // Ensure albumData is null on error to trigger "Album not found" UI
      } finally {
        setIsLoading(false);
      }
    };
    fetching();
  }, [albumId, setQueue]);

  function handleSongClick(song) {
    if (song.id !== musicId) {
      setMusicId(song.id);
      setAlbumId(albumId);
    } else {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
  }

  function handlePlayAll() {
    if (currentAlbumId == albumId) {
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    } else {
      if (songs?.length > 0) {
        setQueue(songs);
        setMusicId(songs[0].id);
        setIsPlaying(true);
        setAlbumId(albumId);
      }
    }
  }

  function handleShuffle() {
    if (songs?.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setMusicId(songs[randomIndex].id);
      setAlbumId(albumId);
      setIsPlaying(true);
    }
  }

  function formatArtist(song, check = false) {
    const all = song.artists.primary;
    const x = check ? all.length : isMobile ? 1 : 3;

    const artists = all
      .slice(0, x)
      .map(
        (artist) =>
          `<a href="/artist?Id=${artist.id}" class="hover:underline">${artist.name.trim()}</a>`
      )
      .join(", ");

    return all.length > x ? `${artists} & more` : artists;
  }

  function getDescription() {
    const year = albumData.year;
    const artists = formatArtist(albumData, true);

    const description = `${year} · ${artists}`;
    return description;
  }

  const handleCopyLink = async () => {
    const link = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("Link copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy link");
      console.error("Copy link error:", e);
    }
  };

  // Calculate total duration
  const totalDuration = songs?.reduce((acc, song) => acc + song.duration, 0) || 0;
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  async function handleAddAllToPlaylist(playlistId) {
    try {
      const ids = (songs || []).map((s) => s.id).filter(Boolean);
      if (!ids.length) return;
      pushManyToDb(playlistId, ids);
      // Refresh local store so UI stays in sync
      fetchFireStore(setPlaylist, setLikedSongs);
      setIsAddToPlaylistOpen(false);
    } catch (e) {
      toast.error("Could not add songs to playlist.");
      console.error(e);
    }
  }

  async function handleCreatePlaylist(e) {
    e.preventDefault();
    const ids = (songs || []).map((s) => s.id).filter(Boolean);
    const playlistName = newPlaylistName?.trim() || albumData?.name || "New Playlist";
    const res = await createPlaylistWithSongs(playlistName, ids);
    if (res?.ok) {
      setNewPlaylistName("");
      setIsCreatingPlaylist(false);
      fetchFireStore(setPlaylist, setLikedSongs);
      setIsAddToPlaylistOpen(false);
    }
  }

  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const mql = window.matchMedia("(max-width: 768px)");
      const onChange = () => setIsMobile(mql.matches);
      onChange();
      if (mql.addEventListener) mql.addEventListener("change", onChange);
      else mql.addListener(onChange);
      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", onChange);
        else mql.removeListener(onChange);
      };
    }, []);
    return isMobile;
  }

  const isMobile = useIsMobile();

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
          className="relative w-full pb-8"
          style={{
            background: bgColor
              ? `linear-gradient(180deg, ${bgColor.bg1} 0%, ${bgColor.bg2} 60%, transparent 100%)`
              : "linear-gradient(180deg, hsl(var(--muted)) 0%, transparent 100%)",
          }}
        >
          {/* Dark/Light overlay tuned for contrast */}
          <div
            className={`absolute inset-0 bg-gradient-to-b to-transparent ${
              textColor === "dark" ? "from-white/70 via-white/60" : "from-black/50 via-black/40"
            }`}
          ></div>

          <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
              {/* Album Cover */}
              <div className="relative mx-auto lg:mx-0 flex-shrink-0 hover:scale-105 transition-transform">
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={albumData.image[2].url || "/placeholder.svg"}
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
              <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6">
                <div className="space-y-2">
                  <p
                    className={`text-sm font-medium uppercase tracking-wider drop-shadow-md ${
                      textColor === "dark" ? "opacity-90" : "opacity-90"
                    }`}
                    style={{
                      color:
                        textColor === "dark"
                          ? "hsl(var(--contrast-foreground-dark))"
                          : "hsl(var(--contrast-foreground-light))",
                    }}
                  >
                    Album
                  </p>
                  <h1
                    className={`text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight break-words drop-shadow-lg`}
                    style={{
                      color:
                        textColor === "dark"
                          ? "hsl(var(--contrast-foreground-dark))"
                          : "hsl(var(--contrast-foreground-light))",
                    }}
                  >
                    {albumData.name}
                  </h1>
                </div>

                {albumData.description && (
                  <div
                    className="text-sm sm:text-base leading-relaxed max-w-2xl drop-shadow-md opacity-80 break-words whitespace-pre-wrap overflow-hidden text-ellipsis"
                    style={{
                      color:
                        textColor === "dark"
                          ? "hsl(var(--contrast-foreground-dark))"
                          : "hsl(var(--contrast-foreground-light))",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: getDescription() }}
                  />
                )}

                {/* Album Stats */}
                <div
                  className="flex flex-wrap items-center gap-2 text-sm justify-center lg:justify-start drop-shadow-md opacity-80"
                  style={{
                    color:
                      textColor === "dark"
                        ? "hsl(var(--contrast-foreground-dark))"
                        : "hsl(var(--contrast-foreground-light))",
                  }}
                >
                  <span>{songs?.length || 0} songs</span>
                  <span>•</span>
                  <span>
                    {totalHours > 0 ? `${totalHours}h ${displayMinutes}m` : `${totalMinutes}m`}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg min-h-[44px]"
                  >
                    {!isPlaying || currentAlbumId != albumId ? (
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
                  <button
                    onClick={() => setIsAddToPlaylistOpen(true)}
                    className={`flex items-center gap-2 backdrop-blur-sm px-4 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 min-h-[44px] shadow-md ${
                      textColor === "dark"
                        ? "bg-background/20 hover:bg-background/30 text-foreground border border-border/50"
                        : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
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

        {/* Songs Section */}
        <div className="container mx-auto px-3 sm:px-4">
          <div className="space-y-6">
            {!isMobile && (
              <div className="md:grid grid-cols-[40px_1fr_80px_40px_40px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border/50">
                <div className="text-center">#</div>
                <div>Title</div>
                <div className="text-center">
                  <Clock className="w-4 h-4 mx-auto" />
                </div>
                <div></div>
                <div></div>
              </div>
            )}

            {/* Songs List */}
            <div className="space-y-1">
              {songs?.map((song, index) => (
                <div
                  key={song.id || index}
                  className={`group rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                    song.id === musicId || openMenuId === song.id ? "bg-muted/50" : ""
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div
                      className="flex items-center gap-3 p-3 min-h-[60px] cursor-pointer"
                      onClick={() => handleSongClick(song)}
                    >
                      {/* Track Number / Play Button */}
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span
                          className={`text-sm text-muted-foreground group-hover:hidden ${
                            song.id === musicId ? "hidden" : ""
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSongClick(song);
                          }}
                          className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                            song.id === musicId ? "block" : "hidden group-hover:block"
                          }`}
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
                        </div>
                      </div>

                      {/* Song Info - Mobile */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h3
                          className={`font-medium text-sm leading-5 ${
                            song.id === musicId ? "text-primary" : "text-foreground"
                          }`}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-word",
                          }}
                        >
                          {song.name}
                        </h3>
                        <p
                          className="text-xs text-muted-foreground truncate mt-0.5"
                          dangerouslySetInnerHTML={{ __html: formatArtist(song) }}
                        />
                      </div>

                      {/* Like Button - Mobile */}
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Like songId={song.id} />
                        </div>
                      </div>

                      {/* Menu Button */}
                      <div className="flex-shrink-0">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                        >
                          <Menu
                            song={song}
                            onOpenChange={(open) => setOpenMenuId(open ? song.id : null)}
                          />
                        </div>
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
                            song.id === musicId ? "block" : "hidden group-hover:block"
                          }`}
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

                      {/* Song Title */}
                      <div className="min-w-0">
                        <h3
                          className={`font-medium truncate ${song.id === musicId ? "text-primary" : "text-foreground"}`}
                          title={song.name}
                        >
                          {song.name}
                        </h3>
                        <p
                          className="text-sm text-muted-foreground truncate mt-0.5"
                          dangerouslySetInnerHTML={{ __html: formatArtist(song) }}
                        />
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
                          <Menu
                            song={song}
                            onOpenChange={(open) => setOpenMenuId(open ? song.id : null)}
                          />
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

      {isMobile ? (
        <Drawer open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
          <DrawerContent
            overlayClassName="backdrop-blur-xl bg-black/30"
            className="inset-0 h-[100dvh] bg-transparent !rounded-t-3xl !border-none !bg-transparent p-0"
            aria-describedby="add-to-playlist-desc"
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Add to playlist</DrawerTitle>
              <DrawerDescription>
                Choose a playlist or create a new one to add all songs.
              </DrawerDescription>
            </DrawerHeader>

            {/* Top section: header + create new playlist */}
            <div className="flex flex-col h-[100dvh] bg-black/60 backdrop-blur-xl text-white rounded-t-3xl">
              <div className="px-4 pt-4 pb-3 flex-shrink-0">
                {/* Header summary */}
                <div className="flex items-center gap-3 mb-4">
                  {albumData?.image?.[1]?.url ? (
                    <img
                      className="h-16 w-16 rounded-md object-cover"
                      src={albumData?.image?.[1]?.url || "/placeholder.svg"}
                      alt={`${albumData?.name || "Album"} cover`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/image.png";
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 grid place-items-center rounded-md bg-black/30 text-white">
                      <Play className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold line-clamp-2 break-words">
                      {albumData?.name || "Album"}
                    </h3>
                    <p className="text-sm text-white/70">Add all songs to</p>
                  </div>
                </div>

                {/* Create new playlist */}
                {!isCreatingPlaylist ? (
                  <button
                    className="w-full rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-3 transition-colors"
                    onClick={() => setIsCreatingPlaylist(true)}
                  >
                    Create new playlist
                  </button>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreatePlaylist(e);
                    }}
                    className="space-y-3"
                  >
                    <input
                      className="w-full rounded-md bg-black/20 border border-white/20 px-3 py-2 outline-none placeholder-white/50"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder={albumData.name}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-md bg-transparent hover:bg-white/10 border border-white/20"
                        onClick={() => setIsCreatingPlaylist(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20"
                      >
                        Create & Add All
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Scrollable playlist list */}
              <div className="flex-1 overflow-y-auto px-4">
                <p className="text-xs uppercase tracking-wider text-white/60 mb-2">
                  Your playlists
                </p>
                <div className="rounded-md border border-white/15 bg-white/5">
                  {Array.isArray(playlist) && playlist.length > 0 ? (
                    <ul className="divide-y divide-white/10">
                      {playlist.map((pl) => (
                        <li key={pl.id}>
                          <button
                            onClick={() => {
                              handleAddAllToPlaylist(pl.id);
                              setIsAddToPlaylistOpen(false);
                            }}
                            className="w-full text-left px-3 py-3 hover:bg-white/10 transition-colors"
                          >
                            {pl.data?.name || "Untitled"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-sm text-white/70">No playlists yet</div>
                  )}
                </div>
              </div>

              {/* Bottom close button */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
                <DrawerClose asChild>
                  <button
                    className="w-full h-10 rounded-full bg-white/10 hover:bg-white/20 text-foreground text-sm font-medium"
                    onClick={() => setIsAddToPlaylistOpen(false)}
                  >
                    Close
                  </button>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
          <DialogContent className="sm:max-w-md bg-black/60 backdrop-blur-xl border border-white/20 text-white">
            <DialogTitle className="sr-only">Add to playlist</DialogTitle>
            <DialogDescription className="sr-only">
              Choose a playlist to add all songs or create a new playlist.
            </DialogDescription>

            {/* Header summary */}
            <div className="flex items-center gap-3">
              {albumData?.image?.[1]?.url ? (
                <img
                  className="h-16 w-16 rounded-md object-cover"
                  src={albumData?.image?.[1]?.url || "/placeholder.svg"}
                  alt={`${albumData?.name} cover`}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/image.png";
                  }}
                />
              ) : (
                <div className="h-16 w-16 grid place-items-center rounded-md bg-black/30 text-white">
                  <Play className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold line-clamp-2 break-words">
                  {albumData?.name || "Album"}
                </h3>
                <p className="text-sm text-white/70">Add all songs to</p>
              </div>
            </div>

            {/* Existing playlists */}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Your playlists</p>
              <div className="max-h-56 overflow-y-auto rounded-md border border-white/15 bg-white/5">
                {Array.isArray(playlist) && playlist.length > 0 ? (
                  <ul className="divide-y divide-white/10">
                    {playlist.map((pl) => (
                      <li key={pl.id}>
                        <button
                          onClick={() => handleAddAllToPlaylist(pl.id)}
                          className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors"
                          title={`Add all songs to ${pl.data?.name || "playlist"}`}
                        >
                          {pl.data?.name || "Untitled"}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-sm text-white/70">No playlists yet</div>
                )}
              </div>
            </div>

            {/* Create new playlist */}
            <div className="mt-4">
              {!isCreatingPlaylist ? (
                <button
                  className="w-full rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-3 transition-colors"
                  onClick={() => setIsCreatingPlaylist(true)}
                >
                  Create new playlist
                </button>
              ) : (
                <form onSubmit={handleCreatePlaylist} className="space-y-3">
                  <input
                    className="w-full rounded-md bg-black/20 border border-white/20 px-3 py-2 outline-none placeholder-white/50 text-white"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder={albumData.name}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-md bg-transparent hover:bg-white/10 border border-white/20"
                      onClick={() => setIsCreatingPlaylist(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20"
                    >
                      Create & Add All
                    </button>
                  </div>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </ScrollArea>
  );
}
