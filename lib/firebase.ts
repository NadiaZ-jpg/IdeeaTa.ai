import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use the current browser hostname as authDomain so Firebase Auth popup
// opens under the same domain as the app (bypasses third-party cookie blockers).
// Falls back to the env var on localhost / SSR.
const getAuthDomain = (): string => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return window.location.hostname;
  }
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
