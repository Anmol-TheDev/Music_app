import { Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "./music/MusicPlayer";
import { Outlet } from "react-router-dom";
import Sidebar from "./search/Sidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../Auth/firebase";
import { useStore } from "../zustand/store";
import InputBar from "./search/InputBar";
import { fetchFireStore } from "../Api";

export default function Home() {
  const navigate = useNavigate();
  const { setIsUser, setPlaylist } = useStore();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) setIsUser(true);
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setIsUser(false);
      }
    );

    const fetchData = async () => {
      try {
        await fetchFireStore(setPlaylist);
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
      }

      const DEFAULT_SEARCH = "top hits";
      const currentSearch = new URLSearchParams(window.location.search).get(
        "searchtxt"
      );
      if (!currentSearch) {
        navigate(`/search?searchtxt=${DEFAULT_SEARCH}`, { replace: true });
      }
    };

    fetchData();

    return () => unsubscribe();
  }, [navigate, setIsUser, setPlaylist]);

  return (
    <>
      <div className="flex items-start">
        <Sidebar />
        <InputBar />
      </div>
      <Suspense fallback={<div>...Loading</div>}>
        <Outlet />
      </Suspense>
      <MusicPlayer />
    </>
  );
}
