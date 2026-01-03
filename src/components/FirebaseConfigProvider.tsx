"use client";

import { useEffect, useState } from 'react';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface FirebaseConfigProviderProps {
  children: React.ReactNode;
  config: FirebaseConfig;
}

export default function FirebaseConfigProvider({ children, config }: FirebaseConfigProviderProps) {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      // Check if provided config has valid values
      const hasValidConfig = config.apiKey && config.apiKey !== '';
      
      if (hasValidConfig) {
        // Use the provided config
        (window as any).__FIREBASE_CONFIG__ = config;
        setIsConfigLoaded(true);
      } else {
        // Fetch config from API (runtime environment variables)
        try {
          const response = await fetch('/api/config/firebase');
          if (response.ok) {
            const fetchedConfig = await response.json();
            (window as any).__FIREBASE_CONFIG__ = fetchedConfig;
          }
        } catch (error) {
          // Silently fail - Firebase will handle missing config
        }
        setIsConfigLoaded(true);
      }
    };

    loadConfig();
  }, [config]);

  return <>{children}</>;
}
