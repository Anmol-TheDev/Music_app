import React, { useState } from "react";
import { Button } from "../ui/button";
import { Home, Menu, X, List, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../zustand/store";
import { Dialog, DialogContent } from "../ui/dialog";
import AuthTab from "../../Auth/AuthTab";
import { signOut, getAuth } from "firebase/auth";
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover";
import Playlist from "../playlist/Playlist";
import { app } from "../../Auth/firebase";
const Sidebar = () => {
  const auth = getAuth(app);
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { isUser, setIsUser, dialogOpen, setDialogOpen } = useStore();
  const [popover,setPopover]=useState(false)
  function handlePlaylist() {
    if (isUser) {
      setPopover(true)
    } else {
      setDialogOpen(true);
      setIsOpen(false);
      setPopover(false)
    }
  }
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <AuthTab />
        </DialogContent>
      </Dialog>
      <Button
        onClick={toggleSidebar}
        className="fixed top-2 left-2 z-50 p-2 bg-background"
        variant="outline"
        size="icon"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      <div
        className={`fixed top-0 left-0 h-full w-48 sm:w-64 z-30  shadow-lg transform transition-transform bg-background duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col h-full pt-16 shadow-2xl">
          <ul className="flex-grow space-y-2 p-4">
            <li>
              <Button
                onClick={() =>
                  navigate(
                    `/search?searchTxt=${localStorage.getItem("search")}`
                  )
                }
                variant="ghost"
                className="w-full justify-start text-lg py-6"
              >
                <Home size={32} className="mr-4" /> Home
              </Button>
            </li>
            <li>
              <Popover open={popover} onOpenChange={setPopover}>
                <PopoverTrigger/>
                <PopoverContent>
                  
                <Playlist/>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                onClick={handlePlaylist}
                className="w-full justify-start text-lg py-6"
              >
                <List size={32} className="mr-4" /> Playlist
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg py-6"
              >
                <User size={32} className="mr-4" /> About me
              </Button>
            </li>
            {!isUser && (
              <li>
                <Button
                  onClick={() => (setDialogOpen(true), setIsOpen(false))}
                  variant="ghost"
                  className="w-full justify-start text-lg py-6"
                >
                  <User size={32} className="mr-4" /> LogIn
                </Button>
              </li>
            )}
            {isUser && (
              <li>
                <Button
                  onClick={() => (signOut(auth), setIsUser(false))}
                  variant="ghost"
                  className="w-full text-black bg-red-400 justify-start text-lg py-6"
                >
                  <User size={32} className="mr-4" /> Logout
                </Button>
              </li>
            )}
          </ul>
          <div className="p-4 border-t">
            <p className="text-sm ">© 2024 Anmol Singh</p>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
