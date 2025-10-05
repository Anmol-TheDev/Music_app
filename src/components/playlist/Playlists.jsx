import React, { useRef, useState } from "react";
import { db, app } from "../../Auth/firebase";
import { addDoc, arrayUnion, collection } from "firebase/firestore";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { getAuth } from "firebase/auth";
import { useStore } from "../../zustand/store";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate, createSearchParams } from "react-router-dom";
import { deletePlaylist } from "../../Api";
import { fetchFireStore } from "../../Api";
import { toast } from "sonner";

export default function Playlist({ setPopover }) {
  const navigate = useNavigate();
  const user = getAuth(app)?.currentUser;
  const [isDialog, setIsDialog] = useState(false);
  const input = useRef(null);
  const { playlist, setPlaylist, emptyPlaylist, setLikedSongs } = useStore();
  async function handleSubmit(e) {
    e.preventDefault();

    if (!input.current?.value?.trim()) {
      return; // Don't submit if input is empty
    }

    setIsDialog(false);
    try {
      const collectionRef = collection(db, "users", user?.uid, "playlists");
      await addDoc(collectionRef, {
        name: input.current.value,
        songs: arrayUnion(),
      });
      emptyPlaylist();
      fetchFireStore(setPlaylist, setLikedSongs);
      toast.success("Playlist created successfully!");
    } catch (error) {
      toast.error("Failed to create playlist.");
      console.error("Firestore add playlist error:", error);
    }
  }

  const handleClick = (list) => {
    const id = list?.id;
    const path = {
      pathname: "/playlist",
      search: createSearchParams({ id }).toString(),
    };
    setPopover(false);
    navigate(path);
  };

  const handleOpenDialog = (e) => {
    e.stopPropagation();
    setIsDialog(true);
  };

  return (
    <>
      <h1 className="text-3xl border-b-2 p-2">Playlist</h1>

      <Dialog open={isDialog} onOpenChange={setIsDialog}>
        <DialogContent>
          <DialogTitle>Name is needed to create Playlist</DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter the name of playlist"
              ref={input}
              required
            />
            <Button type="submit">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex flex-col h-40 sm:h-64">
        {playlist.map((list) => (
          <div
            key={list.id}
            className="p-2 rounded-lg w-full hover:bg-secondary flex"
          >
            <p
              onClick={() => handleClick(list)}
              className="w-full cursor-pointer"
            >
              {list.data.name}
            </p>
            <Trash2
              size={18}
              onClick={() =>
                deletePlaylist(list.id, setPlaylist, emptyPlaylist)
              }
              className="cursor-pointer"
            />
          </div>
        ))}
      </ScrollArea>

      <div className="flex justify-center">
        <Button onClick={handleOpenDialog}>Add playlist</Button>
      </div>
    </>
  );
}
