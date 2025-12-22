"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
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

// MUST only run on client
if (typeof window === "undefined") {
  console.warn("⚠ Firebase skipped on server");
}

const getFirebaseConfig = () => {
  // Try to get config from window object (set by server)
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) {
    return (window as any).__FIREBASE_CONFIG__;
  }

  // Fallback to process.env (for development)
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Log configuration for debugging
  if (typeof window !== "undefined") {
    console.log("🔧 Firebase Environment Check:", {
      hasApiKey: !!config.apiKey,
      hasAuthDomain: !!config.authDomain,
      hasProjectId: !!config.projectId,
      apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'undefined',
      authDomain: config.authDomain || 'undefined',
      projectId: config.projectId || 'undefined',
      windowConfig: !!(window as any).__FIREBASE_CONFIG__,
    });
  }

  return config;
};

const firebaseConfig = getFirebaseConfig();

let auth: Auth | null = null;

// Only initialize Firebase on client side and if config is valid
if (typeof window !== "undefined") {
  // Validate required config
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    console.error("❌ Firebase configuration is incomplete. Authentication will be disabled.");
    console.error("Missing config:", {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
    });
  } else {
    try {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);

      console.log("🔥 Firebase initialized successfully (client)");
      console.log("Firebase Config Check:", {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
      });
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
    }
  }
}

export {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};
