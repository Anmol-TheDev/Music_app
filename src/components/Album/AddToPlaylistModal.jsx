import PropTypes from "prop-types";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../ui/drawer";
import { useIsMobile } from "@/hooks/SongCustomHooks";
import { decodeHtml } from "@/lib/utils";

export default function AddToPlaylistModal({
  open,
  onOpenChange,
  albumData,
  playlist,
  onAddToPlaylist,
  onCreatePlaylist,
  isCreatingPlaylist,
  setIsCreatingPlaylist,
  newPlaylistName,
  setNewPlaylistName,
}) {
  const isMobile = useIsMobile();
  const albumName = decodeHtml(albumData?.name) || "Album";
  const coverUrl = albumData?.image?.[1]?.url;

  const headerSection = (
    <div className="flex items-center gap-3 mb-4">
      {coverUrl ? (
        <img
          className="h-16 w-16 rounded-md object-cover"
          src={coverUrl}
          alt={`${albumName} cover`}
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
        <h3 className="text-base font-semibold line-clamp-2 break-words">{albumName}</h3>
        <p className="text-sm text-white/70">Add all songs to</p>
      </div>
    </div>
  );

  const createSection = !isCreatingPlaylist ? (
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
        onCreatePlaylist(e);
      }}
      className="space-y-3"
    >
      <input
        className="w-full rounded-md bg-black/20 border border-white/20 px-3 py-2 outline-none placeholder-white/50"
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        placeholder={albumName}
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
  );

  const playlistList = (
    <>
      <p className="text-xs uppercase tracking-wider text-white/60 mb-2">Your playlists</p>
      <div className="rounded-md border border-white/15 bg-white/5">
        {Array.isArray(playlist) && playlist.length > 0 ? (
          <ul className="divide-y divide-white/10">
            {playlist.map((pl) => (
              <li key={pl.id}>
                <button
                  onClick={() => onAddToPlaylist(pl.id)}
                  className="w-full text-left px-3 py-3 hover:bg-white/10 transition-colors"
                >
                  {decodeHtml(pl.data?.name) || "Untitled"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-3 text-sm text-white/70">No playlists yet</div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
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

          <div className="flex flex-col h-[100dvh] bg-black/60 backdrop-blur-xl text-white rounded-t-3xl">
            <div className="px-4 pt-4 pb-3 flex-shrink-0">
              {headerSection}
              {createSection}
            </div>

            <div className="flex-1 overflow-y-auto px-4">{playlistList}</div>

            <div className="sticky bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
              <DrawerClose asChild>
                <button
                  className="w-full h-10 rounded-full bg-white/10 hover:bg-white/20 text-foreground text-sm font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/60 backdrop-blur-xl border border-white/20 text-white">
        <DialogTitle className="sr-only">Add to playlist</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a playlist to add all songs or create a new playlist.
        </DialogDescription>

        {headerSection}

        <div className="mt-4">{playlistList}</div>

        <div className="mt-4">{createSection}</div>
      </DialogContent>
    </Dialog>
  );
}

AddToPlaylistModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  albumData: PropTypes.object,
  playlist: PropTypes.array,
  onAddToPlaylist: PropTypes.func.isRequired,
  onCreatePlaylist: PropTypes.func.isRequired,
  isCreatingPlaylist: PropTypes.bool.isRequired,
  setIsCreatingPlaylist: PropTypes.func.isRequired,
  newPlaylistName: PropTypes.string.isRequired,
  setNewPlaylistName: PropTypes.func.isRequired,
};
