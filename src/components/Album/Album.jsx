import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Api from "../../Api";
import { useStore } from "../../zustand/store";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import { fetchFireStore, pushManyToDb, createPlaylistWithSongs } from "../../Api";
import { decodeHtml } from "@/lib/utils";
import AlbumHero from "./AlbumHero";
import AlbumSongs from "./AlbumSongs";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function Album() {
  const [albumData, setAlbumData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const url = useLocation();
  const { setCurrentList, playlist, setPlaylist, setLikedSongs } = useStore();
  const albumId = new URLSearchParams(url.search).get("Id");

  useEffect(() => {
    const fetching = async () => {
      try {
        setIsLoading(true);
        const res = await Api(`/api/albums?id=${albumId}`);
        setAlbumData(res.data.data);
        setSongs(res.data.data.songs);
        setCurrentList(res.data.data.songs);
      } catch (error) {
        toast.error("Failed to load album data.");
        console.error("Album API fetch error:", error);
        setAlbumData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetching();
  }, [albumId, setCurrentList]);

  async function handleAddAllToPlaylist(playlistId) {
    try {
      const ids = (songs || []).map((s) => s.id).filter(Boolean);
      if (!ids.length) return;
      pushManyToDb(playlistId, ids);
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
    const playlistName = newPlaylistName?.trim() || decodeHtml(albumData?.name) || "New Playlist";
    const res = await createPlaylistWithSongs(playlistName, ids);
    if (res?.ok) {
      setNewPlaylistName("");
      setIsCreatingPlaylist(false);
      fetchFireStore(setPlaylist, setLikedSongs);
      setIsAddToPlaylistOpen(false);
    }
  }

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
        <AlbumHero
          albumData={albumData}
          songs={songs}
          albumId={albumId}
          onAddToPlaylist={() => setIsAddToPlaylistOpen(true)}
        />
        <AlbumSongs songs={songs} albumId={albumId} />
      </div>

      <AddToPlaylistModal
        open={isAddToPlaylistOpen}
        onOpenChange={setIsAddToPlaylistOpen}
        albumData={albumData}
        playlist={playlist}
        onAddToPlaylist={handleAddAllToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
        isCreatingPlaylist={isCreatingPlaylist}
        setIsCreatingPlaylist={setIsCreatingPlaylist}
        newPlaylistName={newPlaylistName}
        setNewPlaylistName={setNewPlaylistName}
      />
    </ScrollArea>
  );
}
