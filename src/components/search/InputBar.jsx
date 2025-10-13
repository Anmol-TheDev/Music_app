import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { createSearchParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Api from "../../Api";

export default function InputBar() {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchBarRef = useRef(null);
  const [, setSearchQuery] = useSearchParams();
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const CurrPath = useLocation();
  const router = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    searchSong(searchInput);
  }
  const searchSong = (query) => {
    setSearchQuery({ query });
    localStorage.setItem("search", query);

    const path = {
      pathname: "/search",
      search: createSearchParams({
        searchtxt: query,
      }).toString(),
    };
    if (CurrPath.pathname !== "/search") router(path);
    setIsSearchBarFocused(false);
    if (query !== searchInput) {
      setSearchInput(query);
    }
  };

  function decodeHTML(html) {
    const parser = new DOMParser();
    return parser.parseFromString(html || "", "text/html").documentElement.textContent;
  }

  function truncateCenter(text, maxLength = 20) {
    if (text.length <= maxLength) return text;
    const half = Math.floor((maxLength - 3) / 2);
    return text.slice(0, half) + "..." + text.slice(-half);
  }

  useEffect(() => {
    const search = localStorage.getItem("search");
    if (search) {
      setSearchInput(search);
    }
    searchBarRef.current.addEventListener("focus", () => {
      setIsSearchBarFocused(true);
    });
    // searchBarRef.current.addEventListener("blur", () => {
    // });
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("song-sugg") || e.target.classList.contains("inputBar")) {
        return;
      } else {
        setIsSearchBarFocused(false);
      }
    });
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      if (searchInput && isSearchBarFocused) {
        const res = await Api(`/api/search/songs?query=${searchInput}&limit=4`);
        const data = res.data.data.results.map((res) => {
          return {
            id: res["id"],
            name: decodeHTML(res["name"]),
          };
        });

        setSuggestions(data);
        setLoading(false);
      } else {
        setSuggestions([]);
      }
    };
    const timeout = setTimeout(() => {
      fetchSearch();
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput, isSearchBarFocused]);

  return (
    <form
      className="sticky  top-0 z-10 p-3 sm:p-4 shadow-lg bg-background w-screen "
      onSubmit={handleSubmit}
    >
      <div className="max-w-3xl mx-auto flex justify-center items-center gap-2 sm:gap-3">
        <div className="relative ml-12 sm:ml-0">
          <Input
            placeholder="Search for music..."
            className="text-sm sm:text-base md:text-lg p-4 py-6 flex-grow rounded-xl lg:w-[36rem] inputBar"
            required
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            ref={searchBarRef}
            type="text"
          />
          {searchInput && isSearchBarFocused ? (
            loading == true ? (
              <div className="bg-popover p-2 rounded-lg float_debouncer flex justify-center lg:w-[36rem] mt-2  shadow-lg w-full">
                <div className="w-10 h-10 border-4 border-t-foreground  rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="bg-popover p-2 rounded-lg float_debouncer lg:w-[36rem] mt-2 w-full shadow-lg">
                {suggestions.length > 0 ? (
                  <ul className=" flex flex-col gap-2 pt-2">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        className="p-2 hover:bg-foreground/20 rounded-md cursor-pointer  song-sugg"
                        onClick={() => searchSong(suggestion.name)}
                      >
                        {truncateCenter(suggestion.name)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No suggestions found</p>
                )}
              </div>
            )
          ) : null}
        </div>
        <button
          type="submit"
          className="p-1 sm:p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors "
        >
          <Search className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </form>
  );
}
