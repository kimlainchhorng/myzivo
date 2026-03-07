/**
 * RideMap - Google Maps component for ride booking
 * Fetches API key from edge function, shows pickup/dropoff markers and route.
 */
/// <reference types="google.maps" />
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { decodePolyline } from "@/services/mapsApi";

const DEFAULT_CENTER = { lat: 40.7128, lng: -73.9857 };

const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const lightMapStyle: google.maps.MapTypeStyle[] = [
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
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? darkMapStyle : lightMapStyle;
}

interface RideMapProps {
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  routePolyline?: string | { lat: number; lng: number }[] | null;
  driverCoords?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  onMapReady?: (map: google.maps.Map) => void;
}

// Singleton script loader
let googleMapsPromise: Promise<void> | null = null;
let googleMapsLoaded = false;
let googleMapsAuthFailed = false;
let authFailRetryTimer: ReturnType<typeof setTimeout> | null = null;

(window as any).gm_authFailure = () => {
  googleMapsAuthFailed = true;
  setTimeout(() => {
    document.querySelectorAll('.dismissButton, .gm-err-container, [style*="background-color: white"][style*="z-index"]').forEach(el => el.remove());
    const gmStyle = document.querySelector('style[id^="gm"]');
    if (gmStyle) gmStyle.remove();
  }, 100);
  window.dispatchEvent(new CustomEvent('gmaps-auth-failure'));

  // Auto-retry after 10s — reset the singleton so next render retries
  if (!authFailRetryTimer) {
    authFailRetryTimer = setTimeout(() => {
      googleMapsAuthFailed = false;
      googleMapsPromise = null;
      googleMapsLoaded = false;
      authFailRetryTimer = null;
      window.dispatchEvent(new CustomEvent('gmaps-auth-retry'));
    }, 10_000);
  }
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

export default function RideMap({ pickupCoords, dropoffCoords, routePolyline, driverCoords, userLocation, className, onMapReady }: RideMapProps) {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(googleMapsAuthFailed);

  useEffect(() => {
    const handleAuthFail = () => setFailed(true);
    const handleAuthRetry = () => setFailed(false);
    window.addEventListener('gmaps-auth-failure', handleAuthFail);
    window.addEventListener('gmaps-auth-retry', handleAuthRetry);
    return () => {
      window.removeEventListener('gmaps-auth-failure', handleAuthFail);
      window.removeEventListener('gmaps-auth-retry', handleAuthRetry);
    };
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
      <div className={`w-full h-full bg-gradient-to-b from-muted/80 to-background flex items-center justify-center ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <NativeGoogleMap
      pickupCoords={pickupCoords}
      dropoffCoords={dropoffCoords}
      routePolyline={routePolyline}
      driverCoords={driverCoords}
      userLocation={userLocation}
      className={className}
      onMapReady={onMapReady}
    />
  );
}

function NativeGoogleMap({ pickupCoords, dropoffCoords, routePolyline, driverCoords, userLocation, className, onMapReady }: RideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const decodedRoute = useMemo(() => {
    if (!routePolyline) return null;
    if (typeof routePolyline === "string") return decodePolyline(routePolyline);
    return routePolyline;
  }, [routePolyline]);

  // Initialize map — use requestAnimationFrame to ensure container has layout
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = () => {
      const container = mapContainerRef.current;
      if (!container) return;

      // Ensure container has dimensions before init
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        // Retry on next frame
        requestAnimationFrame(initMap);
        return;
      }

      const center = pickupCoords || userLocation || DEFAULT_CENTER;
      const map = new google.maps.Map(container, {
        center,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: false,
        styles: getMapStyle(),
        gestureHandling: "greedy",
      });
      mapRef.current = map;
      onMapReady?.(map);

      // Trigger resize after short delay to ensure tiles load
      setTimeout(() => {
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
      }, 300);
    };

    requestAnimationFrame(initMap);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ResizeObserver — trigger map resize when container dimensions change
  useEffect(() => {
    const container = mapContainerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const observer = new ResizeObserver(() => {
      google.maps.event.trigger(map, "resize");
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [mapRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Update polyline
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

  // User location blue dot
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation && !pickupCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(userLocation);
      } else {
        userMarkerRef.current = new google.maps.Marker({
          position: userLocation,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2.5,
          },
          title: "You",
          zIndex: 50,
        });
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
  }, [userLocation, pickupCoords]);

  return <div ref={mapContainerRef} className={`w-full h-full ${className || ""}`} />;
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
    <div className={`relative overflow-hidden w-full h-full ${className || ""}`}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(160 40% 12%), hsl(200 30% 14%), hsl(160 30% 10%))' }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="zg" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#zg)"/>
        </svg>
        <div className="absolute top-[35%] left-0 right-0 h-[5px] rounded-full" style={{background:'rgba(255,255,255,0.12)'}}/>
        <div className="absolute top-[55%] left-[5%] right-[15%] h-[3px] rounded-full" style={{background:'rgba(255,255,255,0.08)'}}/>
        <div className="absolute top-[72%] left-[10%] right-[5%] h-[4px] rounded-full" style={{background:'rgba(255,255,255,0.1)'}}/>
        <div className="absolute top-0 bottom-0 left-[40%] w-[5px] rounded-full" style={{background:'rgba(255,255,255,0.12)'}}/>
        <div className="absolute top-[10%] bottom-[20%] left-[65%] w-[3px] rounded-full" style={{background:'rgba(255,255,255,0.08)'}}/>
        <div className="absolute top-[5%] bottom-[10%] left-[20%] w-[3px] rounded-full" style={{background:'rgba(255,255,255,0.07)'}}/>
        <div className="absolute top-[15%] left-[10%] w-[45%] h-[3px] rounded-full origin-left rotate-[25deg]" style={{background:'rgba(255,255,255,0.06)'}}/>
        <div className="absolute bottom-0 right-0 w-[35%] h-[25%] rounded-tl-[3rem]" style={{background:'rgba(16,185,129,0.12)'}}/>

        <div className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute -inset-3 rounded-full bg-primary/15 animate-ping" />
          <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-pulse" />
          <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 border-2 border-background relative z-10" />
        </div>

        {dropoffCoords && (
          <div className="absolute top-[58%] left-[62%] -translate-x-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 rounded-full bg-primary/70 shadow-md border-2 border-background" />
          </div>
        )}

        {dropoffCoords && (
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <line x1="42%" y1="38%" x2="62%" y2="58%" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="8,4" opacity="0.4" />
          </svg>
        )}

        {[
          { top: "28%", left: "55%" },
          { top: "45%", left: "25%" },
          { top: "65%", left: "50%" },
        ].map((pos, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-primary/40" style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.5}s` }}>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '3s', animationDelay: `${i * 0.7}s` }} />
          </div>
        ))}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/30 shadow-sm">
            <span className="text-[10px] font-bold text-primary">ZIVO</span>
            <span className="text-[10px] text-muted-foreground ml-1">Map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
