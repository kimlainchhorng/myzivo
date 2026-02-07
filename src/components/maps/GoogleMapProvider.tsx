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

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-background/50 text-muted-foreground text-sm">
        Failed to load Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-background/50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-background/50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !apiKey) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-background/50 text-muted-foreground text-sm">
        {error || "Missing Google Maps API key"}
      </div>
    );
  }

  return (
    <GoogleMapProviderInner apiKey={apiKey}>
      {children}
    </GoogleMapProviderInner>
  );
}

export default GoogleMapProvider;
