import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Artist from "./components/Artist/artist";
import SearchComponent from "./components/search/SearchResult";
import Album from "./components/Album/Album";
import Plylistinfo from "./components/playlist/Plylistinfo";
import LikedSongs from "./components/LikedSongs/LikedSongs";
import ErrorPage from "./components/ErrorPage";
import Profile from "./components/Profile/Profile"; // 1. Import the new component
import CuratedPlaylistDetail from "./components/playlist/CuratedPlaylistDetail";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/artist",
          element: <Artist />,
        },
        {
          path: "/search",
          element: <SearchComponent />,
        },
        {
          path: "/album",
          element: <Album />,
        },
        {
          path: "/playlist",
          element: <Plylistinfo />,
        },
        {
          path: "/liked",
          element: <LikedSongs />,
        },
        // 2. Add the new profile route
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/curated-playlist",
          element: <CuratedPlaylistDetail />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
