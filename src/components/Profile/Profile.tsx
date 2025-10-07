import { useState, useEffect, useRef } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useStore } from "../../zustand/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Heart, ListMusic } from "lucide-react";

export default function Profile() {
  const { isUser, likedSongs, playlist } = useStore();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const displayNameRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [isUser, navigate, auth]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDisplayName = (displayNameRef.current?.value || "").trim();
    if (user.displayName !== newDisplayName && newDisplayName) {
      try {
        await updateProfile(auth.currentUser!, { displayName: newDisplayName });
        setUser({ ...auth.currentUser });
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } catch (error: any) {
        toast.error("Failed to update profile", { description: error.message });
      }
    } else {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[90vh]">
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="text-primary" /> My Profile
          </h1>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View and edit your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        ref={displayNameRef}
                        defaultValue={user.displayName || ""}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <p className="text-sm p-3 text-muted-foreground bg-muted rounded-md">
                        {user.email} (cannot be changed)
                      </p>
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <Label>Display Name</Label>
                      <p className="text-xl font-medium">
                        {user.displayName || (
                          <span className="text-muted-foreground text-base">Not set</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <p className="text-xl font-medium text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Stats</CardTitle>
                <CardDescription>Click to view your activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div
                  className="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => navigate("/liked")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Heart className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{likedSongs.length}</p>
                    <p className="text-muted-foreground">Liked Songs</p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-4 p-3 rounded-lg"
                  title="View your playlists in the sidebar"
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <ListMusic className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{playlist.length}</p>
                    <p className="text-muted-foreground">Playlists</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
