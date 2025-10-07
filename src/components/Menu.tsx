import { pushInDb } from "../Api";
import { useStore } from "../zustand/store";
import { EllipsisVertical, ListPlus, User, Disc3, SkipForward, Copy, Play } from "lucide-react";
import {
  Menubar,
  MenubarMenu,
  MenubarContent,
  MenubarTrigger,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
} from "../components/ui/menubar";
import { getAuth } from "firebase/auth";
import { app } from "../Auth/firebase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./ui/drawer";

type Artist = { id?: string; name?: string; perma_url?: string };
type SongImage = { url?: string };
type Song = {
  id?: string;
  name?: string;
  url?: string;
  perma_url?: string;
  permaUrl?: string;
  permalink?: string;
  image?: SongImage[];
  album?: { id?: string };
  albumId?: string;
  artists?: { primary?: { name?: string }[]; all?: Artist[] };
};

type MenuProps = {
  song?: Song;
  onOpenChange?: (open: boolean) => void;
};

const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function Menu({ song, onOpenChange }: MenuProps) {
  const { playlist, isUser, addToQueue, addToQueueNext } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const auth = getAuth(app);
  const user = auth?.currentUser;
  const isAuthenticated = Boolean(user && isUser);

  const getShareUrl = () => {
    try {
      const external = song?.perma_url || song?.permaUrl || song?.url || song?.permalink;
      if (external) return external;

      const url = new URL(window.location.href);
      url.searchParams.set("song", song?.id || "");
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const handleCopyLink = async (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    const link = getShareUrl();
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
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Copy link error:", err);
    }
  };

  const handleAddToQueue = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    if (addToQueue) {
      addToQueue(song as any);
      toast.success("Added to queue!");
    } else {
      toast.info("Queue feature coming soon!");
    }
  };

  const handleAddToNext = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    if (addToQueueNext) {
      addToQueueNext(song as any);
      toast.success("Playing Next!");
    } else {
      toast.info("Queue feature coming soon!");
    }
  };

  const handleGoToAlbum = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    if (song?.album?.id || song?.albumId) {
      const albumId = song.album?.id || song.albumId;
      navigate(`/album?Id=${albumId}`);
      toast.success("Navigating to album...");
    } else {
      toast.error("Album information not available");
    }
  };

  return (
    <>
      {isMobile ? (
        <div className="inline-flex">
          <button
            type="button"
            aria-label="Open actions menu"
            title="Actions"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenChange(true);
            }}
            className="p-2 rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <EllipsisVertical className="w-5 h-5" />
          </button>

          <Drawer open={open} onOpenChange={handleOpenChange} shouldScaleBackground>
            <DrawerContent
              overlayClassName="backdrop-blur-xl bg-black/30"
              className="inset-0 h-[100dvh] bg-transparent !rounded-t-3xl !border-none !bg-transparent p-0"
              aria-describedby="song-actions-desc"
            >
              <DrawerHeader className="sr-only">
                <DrawerTitle>Song actions</DrawerTitle>
                <DrawerDescription id="song-actions-desc">
                  Choose what to do with the current song.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex min-h-[100dvh] flex-col bg-black/60 backdrop-blur-xl text-white rounded-t-3xl">
                <div className="flex items-center gap-4 px-4 pt-6 pb-8">
                  {song?.image?.[1]?.url ? (
                    <img
                      className="h-14 w-14 rounded object-cover"
                      src={song?.image?.[1]?.url || "/placeholder.svg"}
                      alt={song?.name || "Song artwork"}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).onerror = null;
                        (e.currentTarget as HTMLImageElement).src = "/image.png";
                      }}
                    />
                  ) : (
                    <div className="h-14 w-14 grid place-items-center rounded bg-black/30 text-white">
                      <Play className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xl font-medium truncate">{song?.name}</div>
                    <p className="text-sm text-white/70 truncate">
                      {song?.artists?.primary?.[0]?.name || "Unknown artist"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-20 pr-1">
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-s text-muted-foreground">Playback</p>
                    <button
                      className="w-full flex items-center gap-3 px-3 h-12 rounded-md hover:bg-accent/60 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToNext(e);
                        handleOpenChange(false);
                      }}
                      title="Queue this to play next"
                    >
                      <SkipForward className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Play next</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 h-12 rounded-md hover:bg-accent/60 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToQueue(e);
                        handleOpenChange(false);
                      }}
                      title="Add to queue"
                    >
                      <ListPlus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Add to queue</span>
                    </button>
                  </div>

                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-s text-muted-foreground">Library</p>
                    {isAuthenticated ? (
                      <div className="flex flex-col">
                        {playlist?.length ? (
                          playlist.map((list: any) => (
                            <button
                              key={list.id}
                              className="w-full flex items-center gap-3 px-3 h-12 rounded-md hover:bg-accent/60 text-left"
                              onClick={(e) => {
                                e.stopPropagation();
                                pushInDb(list.id, (song as any).id);
                                toast.success(`Added to ${list.data.name}`);
                                handleOpenChange(false);
                              }}
                              title={`Add to ${list.data.name}`}
                            >
                              <ListPlus className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm">{list.data.name}</span>
                            </button>
                          ))
                        ) : (
                          <div className="w-full flex items-center gap-3 px-3 h-12 rounded-md text-muted-foreground">
                            <span className="text-sm">No playlists yet</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex items-center gap-3 px-3 h-12 rounded-md text-muted-foreground">
                        <ListPlus className="h-5 w-5" />
                        <span className="text-sm">Login to add to playlist</span>
                      </div>
                    )}
                  </div>

                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-s text-muted-foreground">Navigation</p>
                    <div className="flex flex-col">
                      {Array.from(
                        new Map(
                          (song?.artists?.all ?? [])
                            .filter((a) => a?.id || a?.name)
                            .map((a) => [`${a.id ?? a.name}`.toLowerCase(), a])
                        ).values()
                      )
                        .slice(0, 3)
                        .map((artist) => (
                          <button
                            key={
                              (artist as any).id ||
                              (artist as any).perma_url ||
                              (artist as any).name
                            }
                            className="w-full flex items-center gap-3 px-3 h-12 rounded-md hover:bg-accent/60 text-left"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/artist?Id=${(artist as any).id}`);
                              handleOpenChange(false);
                            }}
                            title={`Go to ${(artist as any).name}`}
                          >
                            <User className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm">Go to {(artist as any).name}</span>
                          </button>
                        ))}

                      {(song?.artists?.all?.length ?? 0) === 0 && (
                        <div className="w-full flex items-center gap-3 px-3 h-12 rounded-md text-muted-foreground">
                          <span className="text-sm">No artists found</span>
                        </div>
                      )}
                      {(song?.album?.id || song?.albumId) && (
                        <button
                          className="w-full flex items-center gap-3 px-3 h-12 rounded-md hover:bg-accent/60 text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToAlbum(e);
                            handleOpenChange(false);
                          }}
                          title="Go to album"
                        >
                          <Disc3 className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm">Go to Album</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-s text-muted-foreground">Share</p>
                    <button
                      className="w-full flex items-center gap-3 px-3 h-12 rounded-md hover:bg-accent/60 text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(e);
                        handleOpenChange(false);
                      }}
                      title="Copy link"
                    >
                      <Copy className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Copy link</span>
                    </button>
                  </div>
                </div>

                <div className="sticky bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
                  <DrawerClose asChild>
                    <button
                      className="w-full h-10 rounded-full bg-white/10 hover:bg-white/20 text-foreground text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Close
                    </button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      ) : (
        <Menubar className="border-none bg-transparent" aria-label="Song actions">
          <MenubarMenu>
            <MenubarTrigger
              className="cursor-pointer hover:bg-accent transition-colors rounded-md p-2"
              aria-label="Open actions menu"
              title="Actions"
            >
              <EllipsisVertical className="w-5 h-5" />
            </MenubarTrigger>

            <MenubarContent
              className="min-w-[240px] mb-3 mr-6 p-1 bg-black/90 text-white border border-white/10 rounded-lg shadow-2xl"
              align="start"
              sideOffset={6}
            >
              <MenubarLabel className="px-2 py-1 text-xs text-muted-foreground">
                Playback
              </MenubarLabel>
              <MenubarItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToNext(e as any);
                }}
                title="Queue this to play next"
              >
                <SkipForward className="h-4 w-4 text-muted-foreground" />
                Play next
              </MenubarItem>
              <MenubarItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToQueue(e as any);
                }}
                title="Add to queue"
              >
                <ListPlus className="h-4 w-4 text-muted-foreground" />
                Add to queue
              </MenubarItem>

              <MenubarSeparator className="my-1" />

              <MenubarLabel className="px-2 py-1 text-xs text-muted-foreground">
                Library
              </MenubarLabel>
              {isAuthenticated ? (
                <MenubarSub>
                  <MenubarSubTrigger className="gap-2" title="Add to playlist">
                    <ListPlus className="h-4 w-4 text-muted-foreground" />
                    Add to playlist
                  </MenubarSubTrigger>
                  <MenubarSubContent className="w-56">
                    {playlist?.length ? (
                      playlist.map((list: any) => (
                        <MenubarItem
                          key={list.id}
                          className="p-2 rounded-md w-full hover:bg-accent/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            pushInDb(list.id, (song as any).id);
                            toast.success(`Added to ${list.data.name}`);
                          }}
                          title={`Add to ${list.data.name}`}
                        >
                          {list.data.name}
                        </MenubarItem>
                      ))
                    ) : (
                      <MenubarItem disabled>No playlists yet</MenubarItem>
                    )}
                  </MenubarSubContent>
                </MenubarSub>
              ) : (
                <MenubarItem disabled className="gap-2" title="Login to add to playlist">
                  <ListPlus className="h-4 w-4 text-muted-foreground" />
                  Login to add to playlist
                </MenubarItem>
              )}

              <MenubarSeparator className="my-1" />

              <MenubarLabel className="px-2 py-1 text-xs text-muted-foreground">
                Navigation
              </MenubarLabel>
              <MenubarSub>
                <MenubarSubTrigger className="gap-2" title="Go to artists">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Go to Artists
                </MenubarSubTrigger>
                <MenubarSubContent className="w-56">
                  {Array.from(
                    new Map(
                      (song?.artists?.all ?? [])
                        .filter((a) => a?.id || a?.name)
                        .map((a) => [`${a.id ?? a.name}`.toLowerCase(), a])
                    ).values()
                  )
                    .slice(0, 3)
                    .map((artist) => (
                      <MenubarItem
                        key={
                          (artist as any).id || (artist as any).perma_url || (artist as any).name
                        }
                        className="p-2 rounded-md w-full hover:bg-accent/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/artist?Id=${(artist as any).id}`);
                        }}
                        title={`Go to ${(artist as any).name}`}
                      >
                        {(artist as any).name}
                      </MenubarItem>
                    ))}

                  {!song?.artists?.all?.length && (
                    <MenubarItem disabled>No artists found</MenubarItem>
                  )}
                </MenubarSubContent>
              </MenubarSub>

              {(song?.album?.id || song?.albumId) && (
                <MenubarItem
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoToAlbum(e as any);
                  }}
                  title="Go to album"
                >
                  <Disc3 className="w-4 h-4 text-muted-foreground" />
                  Go to Album
                </MenubarItem>
              )}

              <MenubarSeparator className="my-1" />

              <MenubarLabel className="px-2 py-1 text-xs text-muted-foreground">Share</MenubarLabel>
              <MenubarItem className="gap-2" onClick={() => handleCopyLink()} title="Copy link">
                <Copy className="h-4 w-4 text-muted-foreground" />
                Copy link
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}
    </>
  );
}
