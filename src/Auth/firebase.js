import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqQi1KT2F1CNacraAG7iGP5_S2UwKdhME",
  authDomain: "test-music-app-42a1d.firebaseapp.com",
  projectId: "test-music-app-42a1d",
  storageBucket: "test-music-app-42a1d.firebasestorage.app",
  messagingSenderId: "722630245657",
  appId: "1:722630245657:web:d84ab049f48ade6171d988",
  measurementId: "G-GEXNZ2M00M",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export app and services
export { app, db, auth };
