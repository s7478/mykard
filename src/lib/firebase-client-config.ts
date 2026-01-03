// Firebase configuration - fetched dynamically from API at runtime
// This file is kept for backwards compatibility but the actual config
// should be fetched from /api/config/firebase or accessed via window.__FIREBASE_CONFIG__

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Fetch config from API (for client-side runtime)
export const fetchFirebaseConfig = async (): Promise<FirebaseConfig | null> => {
  if (typeof window === 'undefined') return null;
  
  // Check if already cached in window
  if ((window as any).__FIREBASE_CONFIG__?.apiKey) {
    return (window as any).__FIREBASE_CONFIG__;
  }
  
  try {
    const response = await fetch('/api/config/firebase');
    if (!response.ok) throw new Error('Failed to fetch config');
    const config = await response.json();
    (window as any).__FIREBASE_CONFIG__ = config;
    return config;
  } catch (error) {
    console.error('Failed to fetch Firebase config:', error);
    return null;
  }
};

// For backwards compatibility - returns empty config (use fetchFirebaseConfig instead)
export const firebaseConfig: FirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

// Debug function to check configuration
export const checkFirebaseConfig = () => {
  if (typeof window !== 'undefined') {
    const config = (window as any).__FIREBASE_CONFIG__ || firebaseConfig;
    console.log("🔧 Firebase Config Check:", {
      hasApiKey: !!config.apiKey,
      hasAuthDomain: !!config.authDomain,
      hasProjectId: !!config.projectId,
      apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'undefined',
      authDomain: config.authDomain || 'undefined',
      projectId: config.projectId || 'undefined',
    });
    return config;
  }
  return firebaseConfig;
};
