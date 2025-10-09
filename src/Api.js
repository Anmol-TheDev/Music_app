import axios from "axios";
import { toast } from "sonner";

const Api = axios.create({
  baseURL: "https://saavn.dev",
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      toast.error(`Error: ${error.response.status} - ${error.response.statusText}`);
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("Error: No response from server. Please check your internet connection.");
      console.error("API Error: No response received", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("Error: Something went wrong with the request.");
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default Api;

import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { app, db } from "./Auth/firebase";
export const fetchFireStore = (setPlaylist, setLikedSongs) => {
  let auth = getAuth(app);
  onAuthStateChanged(auth, async (user) => {
    if (user?.uid) {
      try {
        const docRef = collection(db, "users", user?.uid, "playlists");
        const docSnap = await getDocs(docRef);
        docSnap.forEach((e) => {
          setPlaylist({ id: e.id, data: e.data() });
        });
        const userDocRef = doc(db, "users", user?.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const likedSongs = userData.likedSongs || [];
          setLikedSongs(likedSongs);
        } else {
          await setDoc(userDocRef, {
            likedSongs: [],
            createdAt: new Date().toISOString(),
          });
          setLikedSongs([]);
        }
      } catch (error) {
        toast.error("Failed to fetch playlists.");
        console.error("Firestore fetch error:", error);
        setLikedSongs([]);
      }
    }
  });
};

export function pushInDb(playlistId, musicId) {
  const auth = getAuth(app);
  onAuthStateChanged(auth, async (user) => {
    if (user?.uid) {
      try {
        const collectionRef = doc(db, "users", user?.uid, "playlists", playlistId);
        await updateDoc(collectionRef, {
          songs: arrayUnion(musicId),
        });
        toast.success("Song added to playlist!");
      } catch (error) {
        toast.error("Failed to add song to playlist.");
        console.error("Firestore push error:", error);
      }
    }
  });
}

export function pushManyToDb(playlistId, musicIds = []) {
  const auth = getAuth(app);
  onAuthStateChanged(auth, async (user) => {
    if (!user?.uid || !Array.isArray(musicIds) || musicIds.length === 0) return;
    try {
      const collectionRef = doc(db, "users", user.uid, "playlists", playlistId);
      await updateDoc(collectionRef, {
        songs: arrayUnion(...musicIds),
      });
      toast.success("All songs added to playlist!");
    } catch (error) {
      toast.error("Failed to add songs to playlist.");
      console.error("Firestore pushMany error:", error);
    }
  });
}

export async function createPlaylistWithSongs(name, songIds = []) {
  const auth = getAuth(app);
  const user = auth?.currentUser;

  if (!user?.uid) {
    toast.error("Please login to create a playlist.");
    return { ok: false };
  }

  try {
    const collectionRef = collection(db, "users", user.uid, "playlists");
    const docRef = await addDoc(collectionRef, {
      name,
      songs: songIds.length ? arrayUnion(...songIds) : arrayUnion(),
    });
    toast.success("Playlist created and songs added!");
    return { ok: true, id: docRef.id };
  } catch (error) {
    toast.error("Failed to create playlist.");
    console.error("Firestore add playlist with songs error:", error);
    return { ok: false };
  }
}

export async function deletePlaylist(playlistId, playlists, setPlaylist, emptyPlaylist) {
  const auth = getAuth(app);
  const user = auth?.currentUser;
  if (user?.uid) {
    const docRef = doc(db, "users", user?.uid, "playlists", playlistId);
    deleteDoc(docRef);
    emptyPlaylist();
  }
  playlists.forEach((e) => {
    if (e.id !== playlistId) {
      setPlaylist(e);
    }
  });
}

export function addToLikedSongs(songId) {
  const auth = getAuth(app);
  const user = auth?.currentUser;

  if (!user) {
    return;
  }

  if (user?.uid) {
    const userDocRef = doc(db, "users", user?.uid);
    setDoc(
      userDocRef,
      {
        likedSongs: arrayUnion(songId),
      },
      { merge: true }
    ).catch((error) => {
      console.error("Error adding to liked songs:", error);
    });
  }
}

export function removeFromLikedSongs(songId) {
  const auth = getAuth(app);
  const user = auth?.currentUser;

  if (!user) {
    return;
  }

  if (user?.uid) {
    const userDocRef = doc(db, "users", user?.uid);
    setDoc(
      userDocRef,
      {
        likedSongs: arrayRemove(songId),
      },
      { merge: true }
    ).catch((error) => {
      console.error("Error removing from liked songs:", error);
    });
  }
}

export async function fetchLikedSongs() {
  const auth = getAuth(app);
  const user = auth?.currentUser;
  if (user?.uid) {
    try {
      const userDocRef = doc(db, "users", user?.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data().likedSongs || [];
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
  }
  return [];
}

export async function fetchSongById(songId) {
  try {
    const response = await Api(`/api/songs/${songId}`);
    return response.data.data[0];
  } catch (error) {
    console.error("Error fetching songs by IDs:", error);
    return { success: false, data: [] };
  }
}

export async function fetchSongsByIds(songIds) {
  try {
    const idsString = songIds.join(",");
    const response = await Api(`/api/songs?ids=${idsString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching songs by IDs:", error);
    return { success: false, data: [] };
  }
}
