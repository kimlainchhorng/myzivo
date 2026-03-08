/**
 * RideMap - Google Maps component for ride booking
 * Fetches API key from edge function, shows pickup/dropoff markers and route.
 */
/// <reference types="google.maps" />
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { decodePolyline } from "@/services/mapsApi";

const DEFAULT_CENTER = { lat: 40.7128, lng: -73.9857 };
const MAP_INIT_TIMEOUT_MS = 5000;

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
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#555555" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e8e8e8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d4d4d4" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e8f0" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#8ab4c8" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e8f0e4" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dce8d4" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#d8d8d8" }] },
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
  /** Fires with center lat/lng when the map stops moving (idle event) */
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

// Singleton script loader
let googleMapsPromise: Promise<void> | null = null;
let googleMapsLoaded = false;
let googleMapsAuthFailed = false;
let authFailRetryTimer: ReturnType<typeof setTimeout> | null = null;

(window as any).gm_authFailure = () => {
  googleMapsAuthFailed = true;
  console.error("[RideMap] Google Maps auth failure. Check API key restrictions, Maps JavaScript API enablement, and billing.");
  window.dispatchEvent(new CustomEvent("gmaps-auth-failure"));

  if (!authFailRetryTimer) {
    authFailRetryTimer = setTimeout(() => {
      googleMapsAuthFailed = false;
      googleMapsPromise = null;
      googleMapsLoaded = false;
      authFailRetryTimer = null;
      window.dispatchEvent(new CustomEvent("gmaps-auth-retry"));
    }, 10_000);
  }
};

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsAuthFailed) return Promise.reject(new Error("Google Maps auth failed"));
  if (googleMapsLoaded && (window as any).google?.maps) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      setTimeout(() => {
        if (googleMapsAuthFailed) {
          reject(new Error("Google Maps auth failed"));
        } else {
          resolve();
        }
      }, 350);
    };
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export default function RideMap({ pickupCoords, dropoffCoords, routePolyline, driverCoords, userLocation, className, onMapReady, onCenterChanged }: RideMapProps) {
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failedReason, setFailedReason] = useState<string>("");
  const [mapInitialized, setMapInitialized] = useState(false);

  const handleFailure = useCallback((reason: string, err?: unknown) => {
    if (err) {
      console.error("[RideMap]", reason, err);
    } else {
      console.error("[RideMap]", reason);
    }
    setFailedReason(reason);
    setFailed(true);
  }, []);

  useEffect(() => {
    const handleAuthFail = () => {
      setFailedReason("Google Maps authentication failed. Verify key restrictions and billing.");
      setFailed(true);
    };
    const handleAuthRetry = () => {
      setFailed(false);
      setFailedReason("");
      setIsReady(false);
      setMapInitialized(false);
    };

    window.addEventListener("gmaps-auth-failure", handleAuthFail);
    window.addEventListener("gmaps-auth-retry", handleAuthRetry);
    return () => {
      window.removeEventListener("gmaps-auth-failure", handleAuthFail);
      window.removeEventListener("gmaps-auth-retry", handleAuthRetry);
    };
  }, []);

  useEffect(() => {
    if (failed) return;
    let cancelled = false;

    (async () => {
      const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
      let key = "";

      // Prefer existing secure backend key first
      try {
        const { data, error } = await supabase.functions.invoke("maps-api-key");
        if (!cancelled && !error && data?.key) {
          key = data.key;
        }
      } catch (err) {
        console.warn("[RideMap] maps-api-key edge function unavailable, trying fallback key.", err);
      }

      if (!key && envKey) {
        key = envKey;
      }

      if (!key) {
        if (!cancelled) handleFailure("Google Maps key is missing. Configure maps-api-key edge function or VITE_GOOGLE_MAPS_API_KEY.");
        return;
      }

      try {
        await loadGoogleMapsScript(key);
        if (!cancelled && !googleMapsAuthFailed) {
          setIsReady(true);
        } else if (!cancelled) {
          handleFailure("Google Maps authentication failed after script load.");
        }
      } catch (err) {
        if (!cancelled) {
          handleFailure("Google Maps script failed to initialize.", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [failed, handleFailure]);

  useEffect(() => {
    if (!isReady || failed) return;
    const timer = setTimeout(() => {
      if (!mapInitialized) {
        console.warn("[RideMap] Map not initialized after timeout — container may have 0 dimensions, will keep retrying");
      }
    }, MAP_INIT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isReady, failed, mapInitialized]);

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      setMapInitialized(true);
      onMapReady?.(map);
    },
    [onMapReady]
  );

  // Forward onCenterChanged to NativeGoogleMap via passthrough

  if (failed) {
    return (
      <MapFallback
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        className={className}
        reason={failedReason || "Unable to load Google Maps"}
      />
    );
  }

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
      onMapReady={handleMapReady}
      onCenterChanged={onCenterChanged}
    />
  );
}

function NativeGoogleMap({ pickupCoords, dropoffCoords, routePolyline, driverCoords, userLocation, className, onMapReady, onCenterChanged }: RideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const decodedRoute = useMemo(() => {
    if (!routePolyline) return null;
    if (typeof routePolyline === "string") return decodePolyline(routePolyline);
    return routePolyline;
  }, [routePolyline]);

  // Clear any existing route visuals
  const clearRoute = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
  }, []);

  // ─── Map init ───
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let cancelled = false;
    let frameCount = 0;

    const initMap = () => {
      if (cancelled) return;
      const container = mapContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if ((rect.width === 0 || rect.height === 0) && frameCount < 600) {
        frameCount += 1;
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

      map.addListener("idle", () => {
        const c = map.getCenter();
        if (c && onCenterChanged) {
          onCenterChanged({ lat: c.lat(), lng: c.lng() });
        }
      });

      setTimeout(() => {
        if (!mapRef.current) return;
        google.maps.event.trigger(mapRef.current, "resize");
        mapRef.current.setCenter(center);
      }, 300);
    };

    requestAnimationFrame(initMap);

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Resize observer ───
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!mapRef.current) return;
      google.maps.event.trigger(mapRef.current, "resize");
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ─── Markers + fit bounds ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (pickupCoords) {
      markersRef.current.push(
        new google.maps.Marker({
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
        })
      );
    }

    if (dropoffCoords) {
      markersRef.current.push(
        new google.maps.Marker({
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
        })
      );
    }

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

  // ─── Route rendering: encoded polyline OR Directions Service fallback ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    clearRoute();

    // Case 1: We have a decoded polyline from the API
    if (decodedRoute && decodedRoute.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: decodedRoute,
        strokeColor: "#10b981",
        strokeWeight: 5,
        strokeOpacity: 0.85,
        geodesic: true,
        map,
      });
      return;
    }

    // Case 2: No polyline but we have both coords — use Directions Service
    if (pickupCoords && dropoffCoords) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const renderer = new google.maps.DirectionsRenderer({
              map,
              directions: result,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#10b981",
                strokeWeight: 5,
                strokeOpacity: 0.85,
              },
            });
            directionsRendererRef.current = renderer;
          } else {
            // Last resort: draw a straight dashed line
            polylineRef.current = new google.maps.Polyline({
              path: [pickupCoords, dropoffCoords],
              strokeColor: "#10b981",
              strokeWeight: 3,
              strokeOpacity: 0.6,
              geodesic: true,
              icons: [{
                icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
                offset: "0",
                repeat: "15px",
              }],
              map,
            });
          }
        }
      );
    }
  }, [decodedRoute, pickupCoords, dropoffCoords, clearRoute]);

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

  return <div ref={mapContainerRef} className={`w-full h-full min-h-[200px] ${className || ""}`} />;
}

function MapFallback({
  pickupCoords,
  dropoffCoords,
  className,
  reason,
}: Pick<RideMapProps, "pickupCoords" | "dropoffCoords" | "className"> & { reason: string }) {
  return (
    <div className={`relative overflow-hidden w-full h-full ${className || ""}`}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(160 40% 12%), hsl(200 30% 14%), hsl(160 30% 10%))" }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="zg" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#zg)"/>
        </svg>

        {dropoffCoords && (
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <line x1="42%" y1="38%" x2="62%" y2="58%" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="8,4" opacity="0.4" />
          </svg>
        )}

        <div className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute -inset-3 rounded-full bg-primary/15 animate-ping" />
          <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-pulse" />
          <div className="w-4 h-4 rounded-full bg-primary border-2 border-background relative z-10" />
        </div>

        <div className="absolute top-3 left-3 right-3 z-20 rounded-xl bg-background/90 border border-border/50 p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold text-foreground">Map unavailable</p>
          <p className="text-[11px] text-muted-foreground mt-1">{reason}</p>
        </div>

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
