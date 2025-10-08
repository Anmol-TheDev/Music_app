import { useEffect, useState } from "react";
import { app, db } from "../../Auth/firebase";
import { getAuth } from "firebase/auth";
import Api from "../../Api";
import { doc, getDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";
import { useStore } from "../../zustand/store";
import { Play, Heart, Clock, Pause } from "lucide-react";
import { toast } from "sonner";
import { useSongHandlers } from "@/hooks/SongCustomHooks";

export default function Plylistinfo() {
  const url = useLocation();
  const playlistId = url?.search.split("=")[1];
  const user = getAuth(app).currentUser;
  const [playlistData, setPlaylistData] = useState([]);
  const [playlistName, setPlaylistName] = useState();
  const { isPlaying, setIsPlaying, setMusicId, musicId, setQueue } = useStore();
  const { handleSongClick } = useSongHandlers();

  let count = playlistData.slice(0, 3).length;

  useEffect(() => {
    setPlaylistData([]);
    async function getFireStore() {
      try {
        const docRef = doc(db, "users", user?.uid, "playlists", playlistId);
        const data = await getDoc(docRef);
        if (data.exists()) {
          setPlaylistName(data.data().name);
          for (const element of data.data().songs) {
            try {
              const res = await Api(`/api/songs/${element}`);
              setPlaylistData((prevData) => [...prevData, res.data.data[0]]);
            } catch (apiError) {
              toast.error(`Failed to fetch song: ${element}`);
              console.error(`Error fetching song ${element}:`, apiError);
            }
          }
        } else {
          toast.error("Playlist not found.");
        }
      } catch (error) {
        toast.error("Failed to load playlist information.");
        console.error("Firestore get playlist info error:", error);
      }
    }
    getFireStore();
  }, [user, url]);

  useEffect(() => {
    setQueue(playlistData);
  }, [playlistData]);

  return (
    <>
      <ScrollArea className="h-[100dvh]">
        <div className="container mx-auto p-4 space-y-6 mb-[15dvh]">
          <Card className="overflow-hidden bg-gradient-to-b">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="w-64 h-64 border rounded-lg overflow-hidden ">
                  <div className={`flex flex-wrap w-full h-full`}>
                    {playlistData.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image[2].url}
                        alt={`song ${i + 1}`}
                        className={`object-cover ${
                          count === 1 ? "w-full h-full" : ""
                        }${count === 2 ? "w-1/2 h-full" : ""}${
                          count === 3 ? (i === 0 ? "w-full h-1/2" : "w-1/2 h-1/2") : ""
                        }${count === 4 ? "w-1/2 h-1/2" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">PLAYLIST</p>
                  <h1 className="text-3xl font-bold mb-4 truncate w-24">{playlistName}</h1>
                  <div className="flex items-center gap-4">
                    <button className="bg-primary text-primary-foreground rounded-full p-3 hover:opacity-90">
                      <Play size={24} fill="currentColor" />
                    </button>
                    <button className="text-gray-400 hover:text-primary">
                      <Heart size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Songs</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={16} />
                <span>Total: {playlistData.length} songs</span>
              </div>
            </div>

            <ul className="space-y-2">
              {playlistData.map((song, index) => (
                <li
                  key={index}
                  onClick={() => setMusicId(song.id)}
                  className="rounded-lg hover:bg-secondary hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-4">
                      <p className="text-sm w-6">{index + 1}.</p>
                      <img
                        className="w-12 h-12 rounded-md"
                        loading="lazy"
                        src={song.image?.[1]?.url || "/api/placeholder/48/48"}
                        alt={song.name}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{song.name}</span>
                        <span className="text-sm text-gray-400">{song.artist}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      {isPlaying && song.id === musicId ? (
                        <Pause
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          onClick={() => setIsPlaying(false)}
                        />
                      ) : (
                        <Play
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          onClick={() => handleSongClick(song)}
                        />
                      )}
                      <span className="text-sm text-gray-500">
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
