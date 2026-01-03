// Firebase configuration that gets environment variables at runtime
// For client-side, config should be fetched from /api/config/firebase

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// This is for server-side usage only
export const getServerFirebaseConfig = (): FirebaseConfig => ({
  apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
});

// Deprecated: Use getServerFirebaseConfig() or fetch from /api/config/firebase
export const firebaseConfig = getServerFirebaseConfig();

// Debug function to check configuration
export const checkFirebaseConfig = () => {
  const config = getServerFirebaseConfig();
  if (typeof window !== 'undefined') {
    console.log("🔧 Firebase Config Check:", {
      hasApiKey: !!config.apiKey,
      hasAuthDomain: !!config.authDomain,
      hasProjectId: !!config.projectId,
      apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'undefined',
      authDomain: config.authDomain || 'undefined',
      projectId: config.projectId || 'undefined',
    });
  }
  return config;
};
