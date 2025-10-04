import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Home, Menu, X, List, User, Baby, Heart } from "lucide-react";
import { useStore } from "../../zustand/store";
import { Dialog, DialogContent } from "../ui/dialog";
import AuthTab from "../../Auth/AuthTab";
import { signOut, getAuth } from "firebase/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Playlist from "../playlist/Playlists";
import { app } from "../../Auth/firebase";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const auth = getAuth(app);
  const [isOpen, setIsOpen] = useState(false);
  const [popover, setPopover] = useState(false);

  const { isUser, setIsUser, dialogOpen, setDialogOpen } = useStore();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handlePlaylist = () => {
    if (isUser) {
      setPopover(true);
    } else {
      setDialogOpen(true);
      setIsOpen(false);
    }
  };

  // Close sidebar on outside click
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

  return (
    <>
      {/* Auth Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <AuthTab />
        </DialogContent>
      </Dialog>

      {/* Sidebar Toggle Button */}
      <div
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background shadow-lg border border-muted cursor-pointer transition hover:bg-muted"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu className="w-8 h-8" />}
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-56 sm:w-64 z-40 bg-background border-r shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col h-full  pt-20">
          <ul className="flex-grow flex flex-col gap-2  space-y-2  p-4">
            <li>
              <Button
                onClick={() => {
                  navigate(
                    `/search?searchTxt=${localStorage.getItem("search")}`
                  );
                  setIsOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-lg py-4  hover:bg-accent"
              >
                <Home size={28} className="mr-4" /> Home
              </Button>
            </li>

            <Link to={`/liked`} onClick={() => setIsOpen(false)}>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg py-4  hover:bg-accent"
                >
                  <Heart size={28} className="mr-4" /> Liked Songs
                </Button>
              </li>
            </Link>
            <li>
              <Popover open={popover} onOpenChange={setPopover}>
                <PopoverTrigger className="w-full">
                  <Button
                    onClick={handlePlaylist}
                    variant="ghost"
                    className="w-full justify-start text-lg py-4 hover:bg-accent"
                  >
                    <List size={28} className="mr-4" /> Playlist
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="relative w-72 p-4">
                  <X
                    className="absolute top-2 right-2 cursor-pointer"
                    onClick={() => setPopover(false)}
                  />
                  <Playlist setPopover={setPopover} />
                </PopoverContent>
              </Popover>
            </li>

            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg py-4 hover:bg-accent"
              >
                <a
                  href="https://anmol.pro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full"
                >
                  <Baby size={28} className="mr-4" /> About Me
                </a>
              </Button>
            </li>

            {!isUser ? (
              <li>
                <Button
                  onClick={() => {
                    setDialogOpen(true);
                    setIsOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start text-lg py-4 hover:bg-accent"
                >
                  <User size={28} className="mr-4" /> Log In
                </Button>
              </li>
            ) : (
              <li>
                <Button
                  onClick={() => {
                    signOut(auth);
                    setIsUser(false);
                    setPopover(false);
                    setIsOpen(false);
                  }}
                  className="w-full justify-start  text-lg py-4 bg-destructive text-white hover:bg-destructive/80"
                >
                  <User size={28} className="mr-4" /> Log Out
                </Button>
              </li>
            )}
          </ul>

          <div className="p-4 border-t text-sm text-muted-foreground">
            © 2024 Anmol Singh
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
