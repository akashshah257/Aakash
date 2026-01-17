import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Safer environment variable access
const getEnv = (key: string): string | undefined => {
  try {
    // Attempt to access from import.meta.env (Vite) or process.env (Node/Netlify)
    const env = (import.meta as any).env || (window as any).process?.env;
    return env ? env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Check if critical config is missing
const isConfigMissing = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'placeholder-key';

if (isConfigMissing && typeof window !== 'undefined') {
  console.warn(
    "RAJHOJIYARI: Firebase API Key is missing. \n" +
    "Please set VITE_FIREBASE_API_KEY in your environment variables."
  );
}

// Initialize Firebase with a safety check
let app: any = null;
try {
  if (!isConfigMissing) {
    app = initializeApp(firebaseConfig);
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// Export services with null checks
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null;
export { app as firebaseApp };