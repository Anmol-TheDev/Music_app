import { Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "./music/MusicPlayer";
import { Outlet } from "react-router-dom";
import Sidebar from "./search/Sidebar";
import { Toaster } from "sonner";
import NowPlaying from "./music/NowPlaying";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../Auth/firebase";
import { useStore } from "../zustand/store";
import { fetchFireStore } from "../Api";

export default function Home() {
  const { isFullScreen } = useStore();
  const navigate = useNavigate();
  const { setIsUser, setPlaylist } = useStore();

  useEffect(() => {
    const auth = getAuth(app);
    const pathName = `/search?searchtxt=${
      localStorage.getItem("search") || "punjabi"
    }`;
    onAuthStateChanged(auth, (user) => {
      if (user) setIsUser(true);
    });
    fetchFireStore(setPlaylist);
    navigate(pathName);
  }, []);

  return (
    <>
       <div className="flex h-screen bg-black text-white">
      {!isFullScreen && <Sidebar />}
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<div>...Loading</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>

    <MusicPlayer />
    {isFullScreen && <NowPlaying />}
    <Toaster />
    </>
  );
}