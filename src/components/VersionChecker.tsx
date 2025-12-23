"use client";

import { useEffect } from 'react';

export function VersionChecker() {
  useEffect(() => {
    // Check for new version every 5 minutes
    const checkVersion = async () => {
      try {
        const response = await fetch('/api/version', { 
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();
        
        // Get stored version from localStorage
        const storedVersion = localStorage.getItem('app-version');
        
        if (storedVersion && storedVersion !== data.version) {
          console.log('🔄 New version detected, reloading...');
          // Show notification to user (optional)
          if (confirm('New update available! Click OK to refresh.')) {
            localStorage.setItem('app-version', data.version);
            window.location.reload();
          }
        } else if (!storedVersion) {
          // First time, just store the version
          localStorage.setItem('app-version', data.version);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      }
    };

    // Check immediately
    checkVersion();
    
    // Then check every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
