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
  const { setIsUser, setPlaylist, setLikedSongs } = useStore();
  useEffect(() => {
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) setIsUser(true);
    });
    fetchFireStore(setPlaylist, setLikedSongs);

    const DEFAULT_SEARCH = "top hits";
    const searchText = localStorage.getItem("search");
    if (!searchText) {
      localStorage.setItem("search", DEFAULT_SEARCH);
    }
    const pathName = `/search?searchTxt=${localStorage.getItem("search")}`;
    const currentSearch = new URLSearchParams(window.location.search).get("searchTxt");
    if (!currentSearch) {
      navigate(pathName);
    }
  }, []);
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
