/**
 * GoogleMapProvider
 * 
 * Central Google Maps context provider using @react-google-maps/api.
 * Uses useJsApiLoader hook for proper React integration.
 * Listens to auth state changes to re-fetch API key when user signs in.
 */

import { createContext, useContext, ReactNode, useEffect, useState, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";

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
  const fetchAttemptedRef = useRef(false);

  // Fetch the API key from edge function (requires auth)
  const fetchApiKey = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Not authenticated yet — wait for auth change

      const { data, error: fnError } = await supabase.functions.invoke("maps-api-key");
      if (fnError) {
        console.error("[GoogleMapProvider] Edge function error:", fnError);
      } else if (data?.ok && data?.apiKey) {
        setApiKey(data.apiKey);
        fetchAttemptedRef.current = true;
      }
    } catch (e) {
      console.error("[GoogleMapProvider] Failed to fetch API key:", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + listen for auth state changes to retry
  useEffect(() => {
    if (apiKey) {
      setLoading(false);
      return;
    }

    // Try fetching immediately
    fetchApiKey();

    // Listen for sign-in events to re-attempt
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && !fetchAttemptedRef.current) {
        fetchApiKey();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
