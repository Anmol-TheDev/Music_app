import axios from "axios";
import { toast } from "sonner";

const Api = axios.create({
  baseURL: "https://saavn.dev",
});

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

const shouldRetry = (error) => {
  // Guard against missing config or method
  if (!error.config || !error.config.method) {
    return false;
  }

  const method = error.config.method.toLowerCase();
  const idempotentMethods = ['get', 'head', 'options', 'put', 'delete'];
  const isIdempotent = idempotentMethods.includes(method);
  const retryUnsafe = error.config.retryUnsafe === true;

  if (!isIdempotent && !retryUnsafe) {
    return false;
  }

  // Retry on network errors, 5xx errors, and rate limits (429)
  if (!error.response) return true; // Network error
  const status = error.response.status;
  return status >= 500 || status === 429;
};

const retryRequest = (error) => {
  if (!error.config) {
    return Promise.reject(error);
  }

  const retryCount = error.config.__retryCount || 0;

  if (retryCount >= MAX_RETRIES || !shouldRetry(error)) {
    // Show error toast after retries exhausted or not retryable
    if (error.response) {
      toast.error(
        `Error: ${error.response.status} - ${error.response.statusText}`
      );
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      toast.error(
        "Error: No response from server. Please check your internet connection."
      );
      console.error("API Error: No response received", error.request);
    } else {
      toast.error("Error: Something went wrong with the request.");
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }

  error.config.__retryCount = retryCount + 1;

  const delay = BASE_DELAY * Math.pow(2, retryCount); // Exponential backoff
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Api.request(error.config));
    }, delay);
  }).catch((retryError) => {
    return retryRequest(retryError);
  });
};

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    return retryRequest(error);
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
        const collectionRef = doc(
          db,
          "users",
          user?.uid,
          "playlists",
          playlistId
        );
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

export async function deletePlaylist(
  playlistId,
  playlists,
  setPlaylist,
  emptyPlaylist
) {
  const auth = getAuth(app);
  const user = auth?.currentUser;
  if (user?.uid) {
    const docRef = doc(db, "users", user?.uid, "playlists", playlistId);
    deleteDoc(docRef);
    emptyPlaylist()
  }
  playlists.forEach((e)=>{
    if(e.id!==playlistId){
        setPlaylist(e)
    }
  })
}

export function addToLikedSongs(songId) {
  const auth = getAuth(app);
  const user = auth?.currentUser;
  
  if (!user) {
    return;
  }
  
  if (user?.uid) {
    const userDocRef = doc(db, "users", user?.uid);
    setDoc(userDocRef, {
      likedSongs: arrayUnion(songId),
    }, { merge: true }).catch((error) => {
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
    setDoc(userDocRef, {
      likedSongs: arrayRemove(songId),
    }, { merge: true }).catch((error) => {
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

export async function fetchSongsByIds(songIds) {
  try {
    const idsString = songIds.join(',');
    const response = await Api(`/api/songs?ids=${idsString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching songs by IDs:", error);
    return { success: false, data: [] };
  }
}
