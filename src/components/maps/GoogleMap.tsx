/**
 * GoogleMap Component
 * 
 * Declarative Google Maps component using @react-google-maps/api.
 * Supports ZIVO dark theme, markers, routes, and custom styling.
 * Uses DirectionsService for reliable route rendering.
 */

import { useMemo, useCallback, forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { GoogleMap as GMap, MarkerF, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { cn } from "@/lib/utils";
import ZivoPickupMarker from "./ZivoPickupMarker";
import ZivoDropoffMarker from "./ZivoDropoffMarker";
import RealDriverMarkers from "./RealDriverMarkers";

// ZIVO Dark map theme - premium, removes "Google look"
const ZIVO_DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2a44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b1220" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#061226" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7dd3fc" }] },
];

// ZIVO Light map theme - Uber-inspired clean look
const ZIVO_LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f6f7" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#111827" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f6f7" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#374151" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3b82f6" }] },
];

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type?: "pickup" | "dropoff" | "driver" | "custom";
  title?: string;
  icon?: string;
  iconSize?: number;
  label?: string;
}

export interface MapRoute {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
  color?: string;
}

export interface GoogleMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  route?: MapRoute;
  routePath?: google.maps.LatLngLiteral[];
  showControls?: boolean;
  darkMode?: boolean;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  onMarkerClick?: (markerId: string) => void;
  fitBounds?: boolean;
  // New simplified props
  pickup?: google.maps.LatLngLiteral;
  dropoff?: google.maps.LatLngLiteral;
}

export interface GoogleMapRef {
  panTo: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  fitMarkerBounds: () => void;
}

const GoogleMap = forwardRef<GoogleMapRef, GoogleMapProps>(({
  className,
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 14,
  markers = [],
  route,
  routePath,
  showControls = false,
  darkMode = true,
  onMapClick,
  onMarkerClick,
  fitBounds = true,
  pickup,
  dropoff,
}, ref) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Directions state for route rendering
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsRequested, setDirectionsRequested] = useState(false);

  // Reset directions when pickup/dropoff change
  useEffect(() => {
    if (!pickup || !dropoff) {
      setDirections(null);
      setDirectionsRequested(false);
    } else {
      // Allow new request when coordinates change
      setDirectionsRequested(false);
    }
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  // Map options
  const options = useMemo<google.maps.MapOptions>(() => ({
    styles: darkMode ? ZIVO_DARK_MAP_STYLE : ZIVO_LIGHT_MAP_STYLE,
    disableDefaultUI: !showControls,
    clickableIcons: false,
    keyboardShortcuts: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy",
    tilt: 0,
    // Disable Google's blue location dot
    myLocationButton: false,
    scrollwheel: true,
  }), [darkMode, showControls]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    panTo: (position) => mapRef.current?.panTo(position),
    setZoom: (z) => mapRef.current?.setZoom(z),
    fitMarkerBounds: () => {
      if (!mapRef.current || !window.google) return;
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend(m.position));
      if (pickup) bounds.extend(pickup);
      if (dropoff) bounds.extend(dropoff);
      mapRef.current.fitBounds(bounds, 50);
    },
  }));

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // Fit bounds on load if multiple points
    if (fitBounds && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      let pointCount = 0;
      
      markers.forEach(m => { bounds.extend(m.position); pointCount++; });
      if (pickup) { bounds.extend(pickup); pointCount++; }
      if (dropoff) { bounds.extend(dropoff); pointCount++; }
      
      if (pointCount > 1) {
        map.fitBounds(bounds, 50);
      }
    }
  }, [markers, pickup, dropoff, fitBounds]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [onMapClick]);

  // Driver marker icon (for legacy markers)
  const driverIcon = useMemo(() => ({
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: "#f59e0b",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 2,
    anchor: new google.maps.Point(12, 24),
  }), []);

  // Determine effective center
  const effectiveCenter = pickup || center;

  return (
    <div className={cn("relative", className)}>
      <GMap
        mapContainerClassName="w-full h-full"
        center={effectiveCenter}
        zoom={zoom}
        options={options}
        onLoad={onLoad}
        onClick={handleMapClick}
      >
        {/* Google Directions Service for route */}
        {pickup && dropoff && !directionsRequested && (
          <DirectionsService
            options={{
              origin: pickup,
              destination: dropoff,
              travelMode: google.maps.TravelMode.DRIVING,
            }}
            callback={(result, status) => {
              setDirectionsRequested(true);
              if (status === "OK" && result) {
                setDirections(result);
              }
            }}
          />
        )}

        {/* Render route with Uber-style dark polyline */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // We use custom markers
              polylineOptions: {
                strokeColor: "#111827", // Dark gray like Uber
                strokeOpacity: 0.9,
                strokeWeight: 6,
              },
            }}
          />
        )}

        {/* Real online drivers from database */}
        <RealDriverMarkers center={pickup ?? center} radiusMiles={10} />

        {/* Pickup marker with premium pulsing effect */}
        <ZivoPickupMarker position={pickup ?? center} />

        {/* Uber-style dropoff marker */}
        {dropoff && <ZivoDropoffMarker position={dropoff} />}

        {/* Legacy markers support - skip pickup/dropoff types as they're rendered above */}
        {markers.map(marker => {
          // Skip pickup/dropoff types - already rendered with custom overlays
          if (marker.type === "pickup" || marker.type === "dropoff") {
            return null;
          }

          let icon: google.maps.Symbol | google.maps.Icon | undefined;
          
          if (marker.icon) {
            const size = marker.iconSize || 36;
            icon = {
              url: marker.icon,
              scaledSize: new google.maps.Size(size, size),
              anchor: new google.maps.Point(size / 2, size / 2),
            };
          } else if (marker.type === "driver") {
            icon = driverIcon;
          }

          return (
            <MarkerF
              key={marker.id}
              position={marker.position}
              title={marker.title}
              icon={icon}
              onClick={() => onMarkerClick?.(marker.id)}
              label={marker.label ? {
                text: marker.label,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold",
              } : undefined}
            />
          );
        })}
      </GMap>

      {/* ZIVO gradient overlay for premium look */}
      <div className={cn(
        "pointer-events-none absolute inset-0",
        darkMode 
          ? "bg-gradient-to-b from-black/20 via-transparent to-black/60"
          : "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.04)_100%)]"
      )} />
    </div>
  );
});

GoogleMap.displayName = "GoogleMap";

export default GoogleMap;
