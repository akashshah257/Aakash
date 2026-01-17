
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Vite requires environment variables to start with VITE_ 
// They are accessed via import.meta.env
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID
};

// Check if critical config is missing (common on Netlify first-deploy)
const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'placeholder-key';

if (isConfigMissing && typeof window !== 'undefined') {
  console.warn(
    "RAJHOJIYARI: Firebase API Key is missing. \n" +
    "Please set VITE_FIREBASE_API_KEY in your Netlify environment variables."
  );
}

// Initialize Firebase with a safety check
let app;
try {
  // Only attempt initialization if we have at least an API key
  if (!isConfigMissing) {
    app = initializeApp(firebaseConfig);
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// Initialize services with null checks for the rest of the app
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null;
