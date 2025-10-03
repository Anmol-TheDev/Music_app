import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Artist from "./components/Artist/artist";
import SearchComponent from "./components/search/SearchResult";
import Album from "./components/Album/Album";
import Plylistinfo from "./components/playlist/Plylistinfo";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
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
      ],
    },
  ]);
  
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
