/**
 * GoogleMap Component
 * 
 * A reusable Google Maps component that replaces Mapbox across the app.
 * Supports markers, routes, and custom styling.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useGoogleMaps } from "./GoogleMapProvider";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type?: "pickup" | "dropoff" | "driver" | "custom";
  title?: string;
  icon?: string;           // URL to custom SVG/PNG icon
  iconSize?: number;       // Size in pixels (default: 36)
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
  showControls?: boolean;
  darkMode?: boolean;
  mapId?: string;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  onMarkerClick?: (markerId: string) => void;
  fitBounds?: boolean;
}

export interface GoogleMapRef {
  panTo: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  fitMarkerBounds: () => void;
}

// Dark mode map styles (similar to Mapbox dark-v11)
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

const GoogleMap = forwardRef<GoogleMapRef, GoogleMapProps>(({
  className,
  center = { lat: 40.7128, lng: -74.006 }, // NYC default
  zoom = 13,
  markers = [],
  route,
  showControls = true,
  darkMode = true,
  mapId,
  onMapClick,
  onMarkerClick,
  fitBounds = true,
}, ref) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersInstanceRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    panTo: (position) => {
      mapInstanceRef.current?.panTo(position);
    },
    setZoom: (z) => {
      mapInstanceRef.current?.setZoom(z);
    },
    fitMarkerBounds: () => {
      if (!mapInstanceRef.current || markers.length === 0 || !window.google) return;
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach(m => bounds.extend(m.position));
      mapInstanceRef.current.fitBounds(bounds, 50);
    },
  }));

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current || !window.google) return;

    const resolvedMapId = mapId || import.meta.env.VITE_GOOGLE_MAP_ID;
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapId: resolvedMapId || undefined,
      styles: resolvedMapId ? undefined : (darkMode ? darkMapStyles : undefined),
      disableDefaultUI: !showControls,
      zoomControl: showControls,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
      clickableIcons: false,
    });

    if (onMapClick) {
      mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });
    }

    setMapReady(true);

    return () => {
      // Cleanup
      markersInstanceRef.current.forEach(m => m.setMap(null));
      markersInstanceRef.current = [];
      directionsRendererRef.current?.setMap(null);
    };
  }, [isLoaded, darkMode, showControls]);

  // Update markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersInstanceRef.current.forEach(m => m.setMap(null));
    markersInstanceRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    markers.forEach(marker => {
      // Create marker icon based on type
      let icon: google.maps.Symbol | google.maps.Icon | undefined;
      
      // Use custom icon if provided (highest priority)
      if (marker.icon) {
        const size = marker.iconSize || 36;
        icon = {
          url: marker.icon,
          scaledSize: new window.google.maps.Size(size, size),
          anchor: new window.google.maps.Point(size / 2, size / 2),
        };
      } else if (marker.type === "pickup") {
        // Blue circle with pulsing effect for pickup
        icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 12,
        };
      } else if (marker.type === "dropoff") {
        // Black square pin for destination (more visible contrast)
        icon = {
          path: "M-6,-6 L6,-6 L6,6 L-6,6 Z", // Square path
          fillColor: "#000000",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 1,
        };
      } else if (marker.type === "driver") {
        icon = {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
          fillColor: "#f59e0b",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 2,
          anchor: new window.google.maps.Point(12, 24),
        };
      }

      const gMarker = new window.google.maps.Marker({
        position: marker.position,
        map: mapInstanceRef.current!,
        title: marker.title,
        icon,
        label: marker.label ? {
          text: marker.label,
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "bold",
        } : undefined,
        animation: marker.type === "driver" ? window.google.maps.Animation.DROP : undefined,
      });

      if (onMarkerClick) {
        gMarker.addListener("click", () => onMarkerClick(marker.id));
      }

      markersInstanceRef.current.push(gMarker);
      bounds.extend(marker.position);
    });

    // Fit bounds if we have markers
    if (fitBounds && markers.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, 50);
    } else if (markers.length === 1) {
      mapInstanceRef.current.setCenter(markers[0].position);
    }
  }, [markers, mapReady, fitBounds, onMarkerClick]);

  // Update center when prop changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    mapInstanceRef.current.panTo(center);
  }, [center.lat, center.lng, mapReady]);

  // Update zoom when prop changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    mapInstanceRef.current.setZoom(zoom);
  }, [zoom, mapReady]);

  // Update route
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.google) return;

    // If no route, clear the directions renderer
    if (!route) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      return;
    }

    // Initialize directions renderer if needed
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We handle our own markers
        polylineOptions: {
          strokeColor: route.color || "#3b82f6",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: route.origin,
        destination: route.destination,
        waypoints: route.waypoints?.map(wp => ({ location: wp, stopover: false })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result);
        }
      }
    );
  }, [route, mapReady]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className={cn("relative flex items-center justify-center bg-background/50", className)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className={cn("relative flex items-center justify-center bg-background/50", className)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <span className="text-sm">{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={cn("relative", className)} 
      style={{ minHeight: "200px" }}
    />
  );
});

GoogleMap.displayName = "GoogleMap";

export default GoogleMap;
