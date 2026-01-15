"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Auth
} from "firebase/auth";

import { getStorage, FirebaseStorage } from "firebase/storage";

// Added interface to fix TypeScript errors
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// MUST only run on client
if (typeof window === "undefined") {
  console.warn("⚠ Firebase skipped on server");
}

// Global state for Firebase
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null; // FIXED: Moved to global scope so it can be exported
let initializationPromise: Promise<Auth | null> | null = null;
let isInitialized = false;

// Get config from window object (set by FirebaseConfigProvider) or fetch from API
const getFirebaseConfig = async (): Promise<FirebaseConfig | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  // First, check if config is already in window (set by FirebaseConfigProvider)
  const windowConfig = (window as any).__FIREBASE_CONFIG__;
  if (windowConfig && windowConfig.apiKey) {
    return windowConfig;
  }

  // Fallback: fetch from API endpoint
  try {
    const response = await fetch('/api/config/firebase');
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }
    const config = await response.json();
    
    // Store in window for future use
    (window as any).__FIREBASE_CONFIG__ = config;
    
    return config;
  } catch (error) {
    return null;
  }
};

// Initialize Firebase asynchronously
const initializeFirebase = async (): Promise<Auth | null> => {
  if (typeof window === "undefined") {
    console.warn("⚠ Firebase skipped on server");
    return null;
  }

  // Return existing auth if already initialized
  if (isInitialized && auth) {
    return auth;
  }

  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    const config = await getFirebaseConfig();
    
    if (!config) {
      return null;
    }

    // Validate required config
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      return null;
    }

    // Only initialize Firebase on client side and if config is valid
    if (typeof window !== "undefined") {
      // Validate required config
      // FIXED: Changed 'firebaseConfig' to 'config'
      if (!config.apiKey || !config.authDomain || !config.projectId) {
        console.error("❌ Firebase configuration is incomplete. Authentication will be disabled.");
        console.error("Missing config:", {
          apiKey: !!config.apiKey,
          authDomain: !!config.authDomain,
          projectId: !!config.projectId,
        });
      } else {
        try {
          // FIXED: Changed 'firebaseConfig' to 'config'
          const app = !getApps().length ? initializeApp(config) : getApp();
          auth = getAuth(app);

          // FIXED: Now assigns to the global 'storage' variable
          storage = getStorage(app);

          console.log("🔥 Firebase initialized successfully (client)");
          console.log("Firebase Config Check:", {
            hasApiKey: !!config.apiKey,
            hasAuthDomain: !!config.authDomain,
            hasProjectId: !!config.projectId,
          });
          
          return auth;
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  })(); // FIXED: Removed the extra closing syntax that was causing the error

  return initializationPromise;
};

// Get auth instance (initializes if needed)
const getFirebaseAuth = async (): Promise<Auth | null> => {
  if (auth) return auth;
  return initializeFirebase();
};

// Synchronous getter for auth (returns null if not yet initialized)
const getAuthSync = (): Auth | null => auth;

// Start initialization immediately on client side
if (typeof window !== "undefined") {
  initializeFirebase();
}

export {
  auth,
  getFirebaseAuth,
  getAuthSync,
  initializeFirebase,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  storage
};