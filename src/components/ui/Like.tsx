import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "../../lib/utils";
import { addToLikedSongs, removeFromLikedSongs } from "../../Api";
import { useStore } from "../../zustand/store";
import { getAuth } from "firebase/auth";
import { app } from "../../Auth/firebase";

const Like = ({ songId }: { songId: string }) => {
  const { isLiked, addLikedSong, removeLikedSong, isUser } = useStore();
  const songIsLiked = isLiked(songId);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const auth = getAuth(app);
    const user = auth?.currentUser;
    if (!user || !isUser) {
      alert("Please log in to like songs");
      return;
    }
    if (songIsLiked) {
      removeLikedSong(songId);
      removeFromLikedSongs(songId);
    } else {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
      addLikedSong(songId);
      addToLikedSongs(songId);
    }
  };

  const auth = getAuth(app);
  const user = auth?.currentUser;
  const isAuthenticated = Boolean(user && isUser);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex items-center justify-center transition-transform duration-200",
        isAuthenticated ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed opacity-60"
      )}
      aria-label={
        !isAuthenticated
          ? "Login to like songs"
          : songIsLiked
            ? "Unlike this song"
            : "Like this song"
      }
      disabled={!isAuthenticated}
    >
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute animate-burst-ring">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-500" />
          </div>
          <div className="absolute animate-burst-ring-inner">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-pink-400" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-particle"
              style={{ transform: `rotate(${i * 45}deg)`, animationDelay: "0s" }}
            >
              <div
                className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-br from-red-400 to-pink-500"
                style={{ marginTop: "-20px" }}
              />
            </div>
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`small-${i}`}
              className="absolute animate-particle-small"
              style={{ transform: `rotate(${i * 45 + 22.5}deg)`, animationDelay: "0.05s" }}
            >
              <div
                className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-br from-pink-400 to-red-400"
                style={{ marginTop: "-16px" }}
              />
            </div>
          ))}
        </div>
      )}

      <Heart
        className={cn(
          "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-150 relative z-10",
          !isAuthenticated
            ? "fill-transparent stroke-muted-foreground/50"
            : songIsLiked
              ? "fill-red-500 stroke-red-500"
              : "fill-transparent stroke-muted-foreground hover:fill-red-500/20 hover:stroke-red-500",
          isAnimating && "animate-instagram-like"
        )}
      />

      <style>{`
        @keyframes instagram-like { 0% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(0.95); } 45% { transform: scale(1.1); } 60% { transform: scale(1); } }
        @keyframes burst-ring { 0% { transform: scale(0.3); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes burst-ring-inner { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes particle { 0% { transform: translateY(0) scale(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-24px) scale(1); opacity: 0; } }
        @keyframes particle-small { 0% { transform: translateY(0) scale(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-18px) scale(1); opacity: 0; } }
        .animate-instagram-like { animation: instagram-like 0.5s cubic-bezier(0.34, 1.61, 0.7, 1); }
        .animate-burst-ring { animation: burst-ring 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-burst-ring-inner { animation: burst-ring-inner 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-particle { animation: particle 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-particle-small { animation: particle-small 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </button>
  );
};

export default Like;
