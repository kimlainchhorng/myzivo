/**
 * RideMap - Google Maps component for ride booking
 * Fetches API key from edge function, shows pickup/dropoff markers and route
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_CENTER = { lat: 40.7128, lng: -73.9857 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

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

// Hook to fetch Google Maps API key
function useGoogleMapsApiKey() {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  const [isKeyLoading, setIsKeyLoading] = useState(!apiKey);

  useEffect(() => {
    if (apiKey) return;
    
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("maps-api-key");
        if (!cancelled && data?.key) {
          setApiKey(data.key);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setIsKeyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiKey]);

  return { apiKey, isKeyLoading };
}

export default function RideMap({ pickupCoords, dropoffCoords, routePolyline, className }: RideMapProps) {
  const { apiKey, isKeyLoading } = useGoogleMapsApiKey();

  if (isKeyLoading) {
    return (
      <div className={`bg-gradient-to-b from-muted/80 to-background flex items-center justify-center ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!apiKey) {
    return <MapFallback pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} className={className} />;
  }

  return <GoogleMapView apiKey={apiKey} pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} routePolyline={routePolyline} className={className} />;
}

// Actual Google Map (only rendered when apiKey is available)
function GoogleMapView({ apiKey, pickupCoords, dropoffCoords, routePolyline, className }: RideMapProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey });
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (pickupCoords && dropoffCoords) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropoffCoords);
      mapRef.current.fitBounds(bounds, 60);
    } else if (pickupCoords) {
      mapRef.current.panTo(pickupCoords);
      mapRef.current.setZoom(15);
    } else if (dropoffCoords) {
      mapRef.current.panTo(dropoffCoords);
      mapRef.current.setZoom(15);
    }
  }, [pickupCoords, dropoffCoords]);

  if (loadError) return <MapFallback pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} className={className} />;
  if (!isLoaded) {
    return (
      <div className={`bg-gradient-to-b from-muted/80 to-background flex items-center justify-center animate-pulse ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={pickupCoords || DEFAULT_CENTER}
        zoom={13}
        onLoad={onLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          styles: darkMapStyle,
          gestureHandling: "greedy",
        }}
      >
        {pickupCoords && (
          <Marker
            position={pickupCoords}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
          />
        )}
        {dropoffCoords && (
          <Marker
            position={dropoffCoords}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
          />
        )}
        {routePolyline && routePolyline.length > 1 && (
          <Polyline
            path={routePolyline}
            options={{ strokeColor: "#22c55e", strokeWeight: 4, strokeOpacity: 0.8 }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

// Styled fallback when map is unavailable
function MapFallback({ pickupCoords, dropoffCoords, className }: Pick<RideMapProps, "pickupCoords" | "dropoffCoords" | "className">) {
  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      {/* Styled grid background simulating a map */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary)/0.15)] via-[hsl(var(--muted)/0.5)] to-background">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Simulated roads */}
        <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-primary/20" />
        <div className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-primary/20" />
        <div className="absolute top-0 bottom-0 right-1/4 w-[2px] bg-primary/15" />
        <div className="absolute bottom-1/4 left-0 right-0 h-[2px] bg-primary/15" />
        {/* Pickup dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 animate-pulse" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary/30 animate-ping" />
        </div>
      </div>
    </div>
  );
}
