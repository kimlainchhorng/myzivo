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
      
      // Add SVG icon based on type
      const svgIcon = marker.type === "driver"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
        : marker.type === "pickup"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;
      el.innerHTML = svgIcon;

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
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
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
