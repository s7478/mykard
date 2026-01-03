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

// Firebase config interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Global state for Firebase
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
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
      console.error("❌ Firebase config not available");
      return null;
    }

    // Validate required config
    if (!config.apiKey || !config.authDomain || !config.projectId) {
      return null;
    }

    try {
      firebaseApp = !getApps().length ? initializeApp(config) : getApp();
      auth = getAuth(firebaseApp);
      isInitialized = true;

      return auth;
    } catch (error) {
      return null;
    }
  })();

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
  signInWithEmailAndPassword
};
