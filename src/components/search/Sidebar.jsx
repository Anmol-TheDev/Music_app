import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Home,
  Menu,
  X,
  List,
  User,
  Baby,
  Heart,
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
} from "lucide-react";
import { useStore } from "../../zustand/store";
import { Dialog, DialogContent } from "../ui/dialog";
import AuthTab from "../../Auth/AuthTab";
import { signOut, getAuth } from "firebase/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Playlist from "../playlist/Playlists";
import { app } from "../../Auth/firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { ThemeToggle } from "../ThemeToggle";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const auth = getAuth(app);
  const [isOpen, setIsOpen] = useState(false);
  const [popover, setPopover] = useState(false);

  const { isUser, setIsUser, dialogOpen, setDialogOpen, playlist, likedSongs } = useStore();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handlePlaylist = () => {
    if (isUser) {
      setPopover(true);
    } else {
      setDialogOpen(true);
      setIsOpen(false);
    }
  };

  const isActive = (itemId) => {
    if (itemId === "home") {
      return location.pathname === "/";
    }
    if (itemId === "search") {
      return location.pathname === "/search" || location.search.includes("searchTxt");
    }
    // Updated to check for other paths
    return location.pathname === `/${itemId}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest("#sidebar-toggle") &&
        !event.target.closest('[role="dialog"]')
      ) {
        setIsOpen(false);
        setPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const storedSearch = localStorage.getItem("search") || "top hits";

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      path: `/search?searchTxt=${encodeURIComponent(storedSearch)}`,
    },
    {
      id: "liked",
      label: "Liked Songs",
      icon: Heart,
      path: "/liked",
      requiresAuth: true, // It's good practice to require auth for liked songs
      badge: isUser && likedSongs.length > 0 ? likedSongs.length : null,
    },
    {
      id: "playlist",
      label: "Playlist",
      icon: List,
      expandable: true,
      requiresAuth: true,
    },
    // ---- START: Added Profile Item ----
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: "/profile",
      requiresAuth: true,
    },
    // ---- END: Added Profile Item ----
    {
      id: "about",
      label: "About Me",
      icon: Baby,
      external: "https://anmol.pro/",
    },
  ];

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <AuthTab />
        </DialogContent>
      </Dialog>

      {!isOpen && (
        <div
          id="sidebar-toggle"
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50 p-2 rounded-lg cursor-pointer transition-all duration-200",
            "bg-background/80 backdrop-blur-sm shadow-lg border border-border",
            "hover:bg-accent hover:scale-105 active:scale-95"
          )}
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} className="transition-transform duration-200" />
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-40",
          "bg-background/95 backdrop-blur-md border-r border-border shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-4 py-4 border-b border-border flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sangeet App
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Your music, your way</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              if (item.requiresAuth && !isUser) {
                return (
                  <li key={item.id}>
                    <Button
                      onClick={() => {
                        setDialogOpen(true);
                        setIsOpen(false);
                      }}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-5 text-base font-medium",
                        "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                        "relative overflow-hidden group"
                      )}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <span className="text-xs text-muted-foreground">(Login)</span>
                    </Button>
                  </li>
                );
              }

              if (item.expandable) {
                return (
                  <li key={item.id}>
                    <Popover open={popover} onOpenChange={setPopover}>
                      <PopoverTrigger asChild>
                        <Button
                          onClick={handlePlaylist}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-5 text-base font-medium",
                            "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                            "relative overflow-hidden",
                            (popover || isActive(item.id)) &&
                              "bg-accent text-accent-foreground font-semibold"
                          )}
                        >
                          {isActive(item.id) && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                          )}
                          <item.icon size={20} className="flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {playlist.length > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                              {playlist.length}
                            </span>
                          )}
                          {popover ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="relative w-72 p-4">
                        <X
                          className="absolute top-2 right-2 cursor-pointer hover:bg-accent rounded-sm p-1 transition-colors"
                          onClick={() => setPopover(false)}
                        />
                        <Playlist setPopover={setPopover} />
                      </PopoverContent>
                    </Popover>
                  </li>
                );
              }

              if (item.external) {
                return (
                  <li key={item.id}>
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-5 text-base font-medium",
                        "hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                      )}
                    >
                      <a href={item.external} target="_blank" rel="noopener noreferrer">
                        <item.icon size={20} className="flex-shrink-0" />
                        <span>{item.label}</span>
                      </a>
                    </Button>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-5 text-base font-medium",
                      "hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                      "relative overflow-hidden",
                      isActive(item.id) && "bg-accent text-accent-foreground font-semibold"
                    )}
                  >
                    <Link
                      to={item.path}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                    >
                      {isActive(item.id) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      <item.icon size={20} className="flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>

          <Separator className="my-4" />
        </nav>
        <div className="flex flex-col gap-2">
          <div className="px-3 ">
            {!isUser ? (
              <Button
                onClick={() => {
                  setDialogOpen(true);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-5 text-base font-medium",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "shadow-lg hover:shadow-xl transition-all duration-200"
                )}
              >
                <User size={20} />
                <span>Log In</span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  signOut(auth);
                  setIsUser(false);
                  setPopover(false);
                  setIsOpen(false);
                  // Clear visitor flag so landing page shows again after logout
                  localStorage.removeItem("hasVisited");
                  navigate("/"); // Redirect to home on logout
                }}
                variant="destructive"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-5 text-base font-medium",
                  "transition-all duration-200 hover:bg-destructive/90"
                )}
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </Button>
            )}
          </div>

          <ThemeToggle />
        </div>

        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">© 2025 Anmol Singh</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
