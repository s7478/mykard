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
        console.log("🔧 Firebase config injected into window (from props):", {
          hasApiKey: !!config.apiKey,
          hasAuthDomain: !!config.authDomain,
          hasProjectId: !!config.projectId,
        });
        setIsConfigLoaded(true);
      } else {
        // Fetch config from API (runtime environment variables)
        try {
          console.log("🔧 Fetching Firebase config from API...");
          const response = await fetch('/api/config/firebase');
          if (response.ok) {
            const fetchedConfig = await response.json();
            (window as any).__FIREBASE_CONFIG__ = fetchedConfig;
            console.log("🔧 Firebase config injected into window (from API):", {
              hasApiKey: !!fetchedConfig.apiKey,
              hasAuthDomain: !!fetchedConfig.authDomain,
              hasProjectId: !!fetchedConfig.projectId,
            });
          } else {
            console.error("❌ Failed to fetch Firebase config:", response.status);
          }
        } catch (error) {
          console.error("❌ Error fetching Firebase config:", error);
        }
        setIsConfigLoaded(true);
      }
    };

    loadConfig();
  }, [config]);

  return <>{children}</>;
}
