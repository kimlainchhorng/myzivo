/**
 * RideMap - Google Maps component for ride booking
 * Fetches API key from edge function, shows pickup/dropoff markers and route
 */
/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_CENTER = { lat: 40.7128, lng: -73.9857 };

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

interface RideMapProps {
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  routePolyline?: { lat: number; lng: number }[] | null;
  className?: string;
}

// Singleton script loader to prevent "different options" error
let googleMapsPromise: Promise<void> | null = null;
let googleMapsLoaded = false;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsLoaded && (window as any).google?.maps) {
    return Promise.resolve();
  }
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) {
      googleMapsLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

export default function RideMap({ pickupCoords, dropoffCoords, routePolyline, className }: RideMapProps) {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let key = apiKey;

      // Fetch key from edge function if not available
      if (!key) {
        try {
          const { data } = await supabase.functions.invoke("maps-api-key");
          if (!cancelled && data?.key) {
            key = data.key;
            setApiKey(key);
          }
        } catch {
          if (!cancelled) setFailed(true);
          return;
        }
      }

      if (!key) {
        if (!cancelled) setFailed(true);
        return;
      }

      // Load script via singleton
      try {
        await loadGoogleMapsScript(key);
        if (!cancelled) setIsReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) {
    return <MapFallback pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} className={className} />;
  }

  if (!isReady) {
    return (
      <div className={`bg-gradient-to-b from-muted/80 to-background flex items-center justify-center ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <NativeGoogleMap pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} routePolyline={routePolyline} className={className} />;
}

// Renders the map using the global google.maps API (no useJsApiLoader)
function NativeGoogleMap({ pickupCoords, dropoffCoords, routePolyline, className }: RideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: pickupCoords || DEFAULT_CENTER,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: false,
      styles: darkMapStyle,
      gestureHandling: "greedy",
    });
  }, []);

  // Update markers and bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (pickupCoords) {
      markersRef.current.push(new google.maps.Marker({
        position: pickupCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      }));
    }

    if (dropoffCoords) {
      markersRef.current.push(new google.maps.Marker({
        position: dropoffCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      }));
    }

    // Fit bounds
    if (pickupCoords && dropoffCoords) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropoffCoords);
      map.fitBounds(bounds, 60);
    } else if (pickupCoords) {
      map.panTo(pickupCoords);
      map.setZoom(15);
    } else if (dropoffCoords) {
      map.panTo(dropoffCoords);
      map.setZoom(15);
    }
  }, [pickupCoords, dropoffCoords]);

  // Update polyline
  useEffect(() => {
    const map = mapRef.current;
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (map && routePolyline && routePolyline.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: routePolyline,
        strokeColor: "#22c55e",
        strokeWeight: 4,
        strokeOpacity: 0.8,
        map,
      });
    }
  }, [routePolyline]);

  return <div ref={mapContainerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}

// Styled fallback when map is unavailable
function MapFallback({ pickupCoords, dropoffCoords, className }: Pick<RideMapProps, "pickupCoords" | "dropoffCoords" | "className">) {
  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary)/0.15)] via-[hsl(var(--muted)/0.5)] to-background">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-primary/20" />
        <div className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-primary/20" />
        <div className="absolute top-0 bottom-0 right-1/4 w-[2px] bg-primary/15" />
        <div className="absolute bottom-1/4 left-0 right-0 h-[2px] bg-primary/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 animate-pulse" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary/30 animate-ping" />
        </div>
      </div>
    </div>
  );
}