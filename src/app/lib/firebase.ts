// app/lib/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Declare global variables provided by the Canvas environment
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let isFirebaseInitialized = false;

interface FirebaseInitResult {
  db: Firestore;
  auth: Auth;
  userId: string | null;
}

/**
 * Initializes Firebase and authenticates the user.
 * It uses __initial_auth_token if available, otherwise signs in anonymously.
 * This function ensures Firebase is initialized only once.
 * @returns {Promise<FirebaseInitResult>} An object containing Firestore, Auth instances, and the user ID.
 */
export const initializeFirebaseAndAuth = async (): Promise<FirebaseInitResult> => {
  if (isFirebaseInitialized) {
    // If already initialized, just return the instances
    return { db, auth, userId: auth.currentUser?.uid || null };
  }

  try {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
      console.error("Firebase config is missing or empty.");
      throw new Error("Firebase configuration is not provided.");
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Sign in using custom token if provided, otherwise sign in anonymously
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      console.log("Attempting to sign in with custom token...");
      await signInWithCustomToken(auth, __initial_auth_token);
      console.log("Signed in with custom token.");
    } else {
      console.log("Attempting to sign in anonymously...");
      await signInAnonymously(auth);
      console.log("Signed in anonymously.");
    }

    isFirebaseInitialized = true;
    const userId = auth.currentUser?.uid || null;
    console.log("Firebase initialized. Current user ID:", userId);
    return { db, auth, userId };

  } catch (e) {
    console.error("Error initializing Firebase or authenticating:", e);
    throw e; // Re-throw to be caught by the calling component
  }
};

/**
 * Returns the Firebase Auth instance.
 * @returns {Auth} The Firebase Auth instance.
 * @throws {Error} If Firebase Auth is not initialized.
 */
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Call initializeFirebaseAndAuth first.");
  }
  return auth;
};

/**
 * Returns the Firestore instance.
 * @returns {Firestore} The Firestore instance.
 * @throws {Error} If Firestore is not initialized.
 */
export const getFirebaseFirestore = (): Firestore => {
  if (!db) {
    throw new Error("Firestore is not initialized. Call initializeFirebaseAndAuth first.");
  }
  return db;
};

/**
 * Returns the application ID.
 * @returns {string} The application ID.
 */
export const getAppId = (): string => {
  return typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
};
