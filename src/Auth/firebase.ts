import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const envCfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasAllEnv = Object.values(envCfg).every((v) => typeof v === "string" && v.length > 0);

const fallbackConfig: FirebaseOptions = {
  apiKey: "dev-placeholder",
  authDomain: "dev-placeholder.firebaseapp.com",
  projectId: "dev-placeholder",
  storageBucket: "dev-placeholder.appspot.com",
  messagingSenderId: "0",
  appId: "1:0:web:devplaceholder",
};

const firebaseConfig: FirebaseOptions = hasAllEnv ? (envCfg as FirebaseOptions) : fallbackConfig;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
