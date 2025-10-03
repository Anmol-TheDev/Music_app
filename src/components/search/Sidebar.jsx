import { useEffect, useState } from "react";
import { Home, List, User, Baby, Sun, Moon, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
 
import { app } from "../../Auth/firebase";
import { useStore } from "../../zustand/store";
import { Dialog, DialogContent } from "../ui/dialog";
import AuthTab from "../../Auth/AuthTab";
import Playlist from "../playlist/Playlists";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { isUser, setIsUser, dialogOpen, setDialogOpen } = useStore();

  const isHomeActive = location.pathname === "/" || location.pathname.startsWith("/search");
  const isPlaylistActive = location.pathname.startsWith("/playlist");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    if (initial === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const onNavigateHome = () => {
    navigate(`/search?searchTxt=${localStorage.getItem("search")}`);
  };

  const onTogglePlaylist = () => {
    if (!isUser) {
      setDialogOpen(true);
      return;
    }
    setPlaylistOpen((prev) => !prev);
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <AuthTab />
        </DialogContent>
      </Dialog>

      <SidebarProvider>
        {/* Floating trigger for mobile and desktop collapse/expand */}
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger className="border" />
        </div>

        <UISidebar side="left" variant="sidebar" collapsible="offcanvas">
          <SidebarContent className="pt-14">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isHomeActive}
                    onClick={onNavigateHome}
                    className="h-10 text-sm"
                  >
                    <Home className="mr-2 h-4 w-4" /> <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isPlaylistActive || playlistOpen}
                    onClick={onTogglePlaylist}
                    className="h-10 text-sm justify-between"
                  >
                    <span className="flex items-center">
                      <List className="mr-2 h-4 w-4" /> <span>Playlist</span>
                    </span>
                    {playlistOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </SidebarMenuButton>
                  {playlistOpen && (
                    <div className="mt-1 pl-3">
                      <SidebarSeparator />
                      <div className="mt-2">
                        <Playlist setPopover={() => setPlaylistOpen(false)} />
                      </div>
                    </div>
                  )}
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-10 text-sm">
                    <a
                      href="https://anmol.pro/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Baby className="mr-2 h-4 w-4" /> <span>About Me</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {!isUser ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setDialogOpen(true)}
                      className="h-10 text-sm"
                    >
                      <User className="mr-2 h-4 w-4" /> <span>Log In</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        signOut(auth);
                        setIsUser(false);
                        setPlaylistOpen(false);
                      }}
                      className="h-10 text-sm text-red-500"
                    >
                      <User className="mr-2 h-4 w-4" /> <span>Log Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <Button variant="ghost" className="justify-start text-base" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
            <div className="text-xs text-muted-foreground">© 2024 Anmol Singh</div>
          </SidebarFooter>

          <SidebarRail />
        </UISidebar>
      </SidebarProvider>
    </>
  );
};

export default Sidebar;
