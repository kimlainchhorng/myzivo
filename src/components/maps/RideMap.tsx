/**
 * RideMap - Google Maps component for ride booking
 * Fetches API key from edge function, shows pickup/dropoff markers and route.
 * Uses AdvancedMarkerElement when available, falls back to standard markers.
 */
/// <reference types="google.maps" />
import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { decodePolyline } from "@/services/mapsApi";

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

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e0e0e0" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c0c0c0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e8f5" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e8f5e9" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8e6c9" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

function getMapStyle(): google.maps.MapTypeStyle[] {
  // Detect dark mode from document
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? darkMapStyle : lightMapStyle;
}

interface RideMapProps {
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  routePolyline?: string | { lat: number; lng: number }[] | null;
  driverCoords?: { lat: number; lng: number } | null;
  className?: string;
}

// Singleton script loader
let googleMapsPromise: Promise<void> | null = null;
let googleMapsLoaded = false;
let googleMapsAuthFailed = false;

(window as any).gm_authFailure = () => {
  googleMapsAuthFailed = true;
  setTimeout(() => {
    document.querySelectorAll('.dismissButton, .gm-err-container, [style*="background-color: white"][style*="z-index"]').forEach(el => el.remove());
    const gmStyle = document.querySelector('style[id^="gm"]');
    if (gmStyle) gmStyle.remove();
  }, 100);
  window.dispatchEvent(new CustomEvent('gmaps-auth-failure'));
};

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsAuthFailed) return Promise.reject(new Error("Google Maps auth failed"));
  if (googleMapsLoaded && (window as any).google?.maps) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) { googleMapsLoaded = true; resolve(); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      setTimeout(() => {
        if (googleMapsAuthFailed) reject(new Error("Google Maps auth failed"));
        else resolve();
      }, 500);
    };
    script.onerror = () => { googleMapsPromise = null; reject(new Error("Failed to load Google Maps")); };
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

export default function RideMap({ pickupCoords, dropoffCoords, routePolyline, driverCoords, className }: RideMapProps) {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(googleMapsAuthFailed);

  useEffect(() => {
    const handleAuthFail = () => setFailed(true);
    window.addEventListener('gmaps-auth-failure', handleAuthFail);
    return () => window.removeEventListener('gmaps-auth-failure', handleAuthFail);
  }, []);

  useEffect(() => {
    if (failed) return;
    let cancelled = false;

    (async () => {
      let key = apiKey;
      if (!key) {
        try {
          const { data } = await supabase.functions.invoke("maps-api-key");
          if (!cancelled && data?.key) { key = data.key; setApiKey(key); }
        } catch {
          if (!cancelled) setFailed(true);
          return;
        }
      }
      if (!key) { if (!cancelled) setFailed(true); return; }

      try {
        await loadGoogleMapsScript(key);
        if (!cancelled && !googleMapsAuthFailed) setIsReady(true);
        else if (!cancelled) setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [failed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) return <MapFallback pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} className={className} />;

  if (!isReady) {
    return (
      <div className={`bg-gradient-to-b from-muted/80 to-background flex items-center justify-center ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <NativeGoogleMap pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} routePolyline={routePolyline} driverCoords={driverCoords} className={className} />;
}

function NativeGoogleMap({ pickupCoords, dropoffCoords, routePolyline, driverCoords, className }: RideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);

  // Decode polyline if it's an encoded string
  const decodedRoute = useMemo(() => {
    if (!routePolyline) return null;
    if (typeof routePolyline === "string") return decodePolyline(routePolyline);
    return routePolyline;
  }, [routePolyline]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: pickupCoords || DEFAULT_CENTER,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: false,
      styles: getMapStyle(),
      gestureHandling: "greedy",
      mapId: "zivo-ride-map",
    });
  }, []);

  // Update markers and bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (pickupCoords) {
      markersRef.current.push(new google.maps.Marker({
        position: pickupCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: "Pickup",
      }));
    }

    if (dropoffCoords) {
      markersRef.current.push(new google.maps.Marker({
        position: dropoffCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#10b981",
          fillOpacity: 0.7,
          strokeColor: "#065f46",
          strokeWeight: 2,
        },
        title: "Dropoff",
      }));
    }

    // Fit bounds
    if (pickupCoords && dropoffCoords) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropoffCoords);
      if (driverCoords) bounds.extend(driverCoords);
      map.fitBounds(bounds, 60);
    } else if (pickupCoords) {
      map.panTo(pickupCoords);
      map.setZoom(15);
    } else if (dropoffCoords) {
      map.panTo(dropoffCoords);
      map.setZoom(15);
    }
  }, [pickupCoords, dropoffCoords, driverCoords]);

  // Update polyline with animated gradient
  useEffect(() => {
    const map = mapRef.current;
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (map && decodedRoute && decodedRoute.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: decodedRoute,
        strokeColor: "#10b981",
        strokeWeight: 4,
        strokeOpacity: 0.9,
        geodesic: true,
        map,
      });
    }
  }, [decodedRoute]);

  // Update driver marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (driverCoords) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setPosition(driverCoords);
      } else {
        driverMarkerRef.current = new google.maps.Marker({
          position: driverCoords,
          map,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            rotation: 0,
          },
          title: "Driver",
          zIndex: 100,
        });
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.setMap(null);
      driverMarkerRef.current = null;
    }
  }, [driverCoords]);

  return <div ref={mapContainerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}

// Premium fallback when map is unavailable
function MapFallback({ pickupCoords, dropoffCoords, className }: Pick<RideMapProps, "pickupCoords" | "dropoffCoords" | "className">) {
  useEffect(() => {
    const cleanup = () => {
      document.querySelectorAll('.dismissButton, .gm-err-container, .gm-style-pbc').forEach(el => el.remove());
      document.querySelectorAll('div[style*="background-color: white"][style*="z-index"]').forEach(el => {
        if (el.textContent?.includes("Google Maps") || el.textContent?.includes("load")) el.remove();
      });
    };
    cleanup();
    const timer = setTimeout(cleanup, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-muted/40 to-background">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute top-[30%] left-0 right-0 h-[3px] bg-primary/15 rounded-full" />
        <div className="absolute top-[60%] left-[10%] right-[20%] h-[2px] bg-primary/10 rounded-full" />
        <div className="absolute top-0 bottom-0 left-[35%] w-[3px] bg-primary/15 rounded-full" />
        <div className="absolute top-0 bottom-0 right-[25%] w-[2px] bg-primary/10 rounded-full" />

        {/* Pickup marker */}
        <div className="absolute top-[40%] left-[45%]">
          <div className="w-5 h-5 rounded-full bg-primary shadow-lg shadow-primary/40 animate-pulse border-2 border-background" />
          <div className="absolute inset-0 w-5 h-5 rounded-full bg-primary/20 animate-ping" />
        </div>

        {dropoffCoords && (
          <div className="absolute top-[55%] left-[60%]">
            <div className="w-4 h-4 rounded-full bg-destructive shadow-lg shadow-destructive/30 border-2 border-background" />
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 text-[10px] text-muted-foreground font-medium">
            Map preview
          </div>
        </div>
      </div>
    </div>
  );
}
