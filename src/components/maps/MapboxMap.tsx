/**
 * MapboxMap Component
 * 
 * Reusable Mapbox GL map with markers and route rendering.
 * Falls back to placeholder if token is missing.
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { hasMapboxToken } from "@/services/mapbox";

export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type: "pickup" | "dropoff" | "driver";
  title?: string;
}

export interface MapboxMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routeCoordinates?: [number, number][]; // [lng, lat] pairs from Mapbox
  showControls?: boolean;
  fitBounds?: boolean;
  onMapLoad?: (map: mapboxgl.Map) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// Dark map style matching ZIVO theme
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

// Marker colors
const MARKER_COLORS = {
  pickup: "#3b82f6", // primary blue
  dropoff: "#10b981", // emerald
  driver: "#f97316", // orange
};

const MapboxMap = ({
  className = "",
  center = { lat: 30.4515, lng: -91.1871 },
  zoom = 14,
  markers = [],
  routeCoordinates,
  showControls = false,
  fitBounds = true,
  onMapLoad,
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !hasMapboxToken()) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setIsLoaded(true);
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }
    });

    if (showControls && map.current) {
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "mapbox-custom-marker";
      el.style.cssText = `
        width: ${marker.type === "driver" ? "40px" : "32px"};
        height: ${marker.type === "driver" ? "40px" : "32px"};
        background-color: ${MARKER_COLORS[marker.type]};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${marker.type === "driver" ? "18px" : "14px"};
      `;
      
      // Add icon based on type
      if (marker.type === "driver") {
        el.innerHTML = "🚗";
      } else if (marker.type === "pickup") {
        el.innerHTML = "📍";
      } else {
        el.innerHTML = "🏁";
      }

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.position.lng, marker.position.lat])
        .addTo(map.current!);

      if (marker.title) {
        mapboxMarker.setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText(marker.title)
        );
      }

      markersRef.current.push(mapboxMarker);
    });

    // Fit bounds to markers
    if (fitBounds && markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((m) => {
        bounds.extend([m.position.lng, m.position.lat]);
      });
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 200, left: 50, right: 50 },
        maxZoom: 15,
      });
    }
  }, [markers, isLoaded, fitBounds]);

  // Update route
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const sourceId = "route";
    const layerId = "route-line";

    // Remove existing route
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Add new route
    if (routeCoordinates && routeCoordinates.length > 1) {
      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.current.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 5,
          "line-opacity": 0.8,
        },
      });
    }
  }, [routeCoordinates, isLoaded]);

  // Update center when it changes
  useEffect(() => {
    if (map.current && isLoaded && !fitBounds) {
      map.current.setCenter([center.lng, center.lat]);
    }
  }, [center, isLoaded, fitBounds]);

  // Fallback if no token
  if (!hasMapboxToken()) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-white/60 text-sm">Map key not set</p>
            <p className="text-white/40 text-xs mt-1">Add VITE_MAPBOX_ACCESS_TOKEN to enable maps</p>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};

export default MapboxMap;
