/**
 * GoogleMapProvider
 * 
 * Central Google Maps context provider using @react-google-maps/api.
 * Uses useJsApiLoader hook for proper React integration.
 */

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapProviderProps {
  children: ReactNode;
}

// Inner component that uses the loader hook
function GoogleMapProviderInner({ 
  children, 
  apiKey 
}: { 
  children: ReactNode; 
  apiKey: string;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // Always render children — map components check isLoaded themselves
  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function GoogleMapProvider({ children }: GoogleMapProviderProps) {
  const [apiKey, setApiKey] = useState<string | null>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null
  );
  const [loading, setLoading] = useState(!apiKey);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have a key from env, don't fetch
    if (apiKey) {
      setLoading(false);
      return;
    }

    const fetchApiKey = async () => {
      try {
        // Check if user is authenticated before calling protected edge function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Authentication required for maps");
          return;
        }
        const { data, error: fnError } = await supabase.functions.invoke("maps-api-key");
        if (fnError) {
          console.error("[GoogleMapProvider] Edge function error:", fnError);
          setError("Failed to load Google Maps configuration");
        } else if (data?.ok && data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setError("Google Maps API key not configured");
        }
      } catch (e) {
        console.error("[GoogleMapProvider] Failed to fetch API key:", e);
        setError("Failed to load Google Maps");
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [apiKey]);

  if (!apiKey) {
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: undefined }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <GoogleMapProviderInner apiKey={apiKey}>
      {children}
    </GoogleMapProviderInner>
  );
}

export default GoogleMapProvider;
