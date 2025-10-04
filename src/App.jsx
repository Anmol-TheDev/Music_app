import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Artist from "./components/Artist/artist";
import SearchComponent from "./components/search/SearchResult";
import Album from "./components/Album/Album";
import Plylistinfo from "./components/playlist/Plylistinfo";
import LikedSongs from "./components/LikedSongs/LikedSongs";
import ErrorPage from "./components/ErrorPage";

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
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
