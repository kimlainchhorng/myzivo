/**
 * GoogleMap Component
 * 
 * Declarative Google Maps component using @react-google-maps/api.
 * Supports ZIVO dark theme, markers, routes, and custom styling.
 */

import { useMemo, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import { GoogleMap as GMap, MarkerF, PolylineF } from "@react-google-maps/api";
import { cn } from "@/lib/utils";
import ZivoPickupMarker from "./ZivoPickupMarker";

// ZIVO Dark map theme - premium, removes "Google look"
const ZIVO_MAP_STYLE: google.maps.MapTypeStyle[] = [
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

  // Map options
  const options = useMemo<google.maps.MapOptions>(() => ({
    styles: darkMode ? ZIVO_MAP_STYLE : undefined,
    disableDefaultUI: !showControls,
    clickableIcons: false,
    keyboardShortcuts: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy",
    tilt: 0,
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

  // Dropoff marker icon
  const dropoffIcon = useMemo(() => ({
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: "#000000",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  }), []);

  // Driver marker icon
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

  // Build route path for polyline
  const polylinePath = routePath || (route ? undefined : undefined);

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
        {/* Pickup marker with premium pulsing effect - always show, fall back to center */}
        <ZivoPickupMarker position={pickup ?? center} />

        {/* Dropoff marker */}
        {dropoff && (
          <MarkerF
            position={dropoff}
            icon={dropoffIcon}
          />
        )}

        {/* Legacy markers support - skip pickup types as they're rendered above */}
        {markers.map(marker => {
          // Skip pickup type - already rendered above with ZivoPickupMarker
          if (marker.type === "pickup") {
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
          } else if (marker.type === "dropoff") {
            icon = dropoffIcon;
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

        {/* Route polyline */}
        {polylinePath && polylinePath.length > 0 && (
          <PolylineF
            path={polylinePath}
            options={{
              strokeColor: route?.color || "#3b82f6",
              strokeOpacity: 0.9,
              strokeWeight: 5,
            }}
          />
        )}
      </GMap>

      {/* ZIVO gradient overlay for premium look */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
});

GoogleMap.displayName = "GoogleMap";

export default GoogleMap;
