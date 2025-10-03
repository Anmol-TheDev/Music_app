import React from "react";
import { useStore } from "../../zustand/store";
import { ScrollArea } from "../ui/scroll-area";
import { Music2 } from "lucide-react";

function Queue() {
  const { queue, currentIndex, setMusicId } = useStore();

  if (!queue || queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
        <Music2 className="w-10 h-10 mb-2" />
        <p>Antrean kosong</p>
      </div>
    );
  }

  const handleSongClick = (songId) => {
    setMusicId(songId);
  };

  return (
    <ScrollArea className="h-full w-full rounded-md border p-4 bg-neutral-900 text-white">
      <h2 className="text-lg font-semibold mb-4">Antrean Berikutnya</h2>
      <ul>
        {queue.map((song, index) => (
          <li
            key={song.id + "-" + index}
            onClick={() => handleSongClick(song.id)}
            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-neutral-800 ${
              index === currentIndex ? "bg-green-500/20 text-green-400" : ""
            }`}
          >
            <img
              src={song.image[1]?.url || "/image.png"}
              alt={song.name}
              className="w-10 h-10 rounded-md mr-4 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/image.png";
              }}
            />
            <div className="flex-1">
              <p className="font-semibold truncate">{song.name}</p>
              <p className="text-xs text-neutral-400 truncate">
                {song.artists.primary.map((artist) => artist.name).join(", ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

export default Queue;
