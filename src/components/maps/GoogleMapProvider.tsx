/**
 * GoogleMapProvider
 * 
 * Central Google Maps context provider that loads the Maps JavaScript API
 * and provides it to child components. Fetches API key from edge function.
 */

/// <reference types="@types/google.maps" />

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google?: typeof google;
  }
}

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: string | null;
  apiKey: string | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
  apiKey: null,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapProviderProps {
  children: ReactNode;
  apiKey?: string;
}

// Store the loading promise to prevent multiple loads
let loadingPromise: Promise<void> | null = null;
let cachedApiKey: string | null = null;

export function GoogleMapProvider({ children, apiKey: propApiKey }: GoogleMapProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(propApiKey || cachedApiKey);

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const loadGoogleMaps = async () => {
      // Get API key from props, cache, environment, or edge function
      let key = propApiKey || cachedApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      // If no key yet, try to fetch from edge function
      if (!key) {
        try {
          const { data, error } = await supabase.functions.invoke("maps-api-key");
          if (error) {
            console.error("[GoogleMapProvider] Edge function error:", error);
          } else if (data?.ok && data?.apiKey) {
            key = data.apiKey;
            cachedApiKey = key;
            setApiKey(key);
          }
        } catch (e) {
          console.error("[GoogleMapProvider] Failed to fetch API key:", e);
        }
      }
      
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
  }, [propApiKey]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export default GoogleMapProvider;
