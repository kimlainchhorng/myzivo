/**
 * GoogleMapProvider
 * 
 * Central Google Maps context provider that loads the Maps JavaScript API
 * and provides it to child components.
 */

/// <reference types="@types/google.maps" />

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapProviderProps {
  children: ReactNode;
  apiKey?: string;
}

// Store the loading promise to prevent multiple loads
let loadingPromise: Promise<void> | null = null;

export function GoogleMapProvider({ children, apiKey }: GoogleMapProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const loadGoogleMaps = async () => {
      // Get API key from props or environment
      const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!key) {
        setLoadError("Google Maps API key not configured");
        return;
      }

      // Return existing promise if already loading
      if (loadingPromise) {
        await loadingPromise;
        setIsLoaded(true);
        return;
      }

      loadingPromise = new Promise<void>((resolve, reject) => {
        // Create callback function
        const callbackName = `googleMapsCallback_${Date.now()}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)[callbackName] = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (window as any)[callbackName];
          resolve();
        };

        // Create script element
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (window as any)[callbackName];
          loadingPromise = null;
          reject(new Error("Failed to load Google Maps"));
        };

        document.head.appendChild(script);
      });

      try {
        await loadingPromise;
        setIsLoaded(true);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Failed to load Google Maps");
      }
    };

    loadGoogleMaps();
  }, [apiKey]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export default GoogleMapProvider;
