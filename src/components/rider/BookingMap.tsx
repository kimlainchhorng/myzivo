import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Location } from "@/hooks/useRiderBooking";

interface BookingMapProps {
  pickup: Location | null;
  dropoff: Location | null;
  routeGeometry?: any;
  className?: string;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const BookingMap = ({ pickup, dropoff, routeGeometry, className }: BookingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      
      // Add route source
      map.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      // Add route layer
      map.current!.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#22c55e",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update pickup marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (pickupMarker.current) {
      pickupMarker.current.remove();
      pickupMarker.current = null;
    }

    if (pickup) {
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `;

      pickupMarker.current = new mapboxgl.Marker(el)
        .setLngLat([pickup.lng, pickup.lat])
        .addTo(map.current);
    }
  }, [pickup, mapLoaded]);

  // Update dropoff marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (dropoffMarker.current) {
      dropoffMarker.current.remove();
      dropoffMarker.current = null;
    }

    if (dropoff) {
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="w-6 h-6 bg-foreground rounded-sm shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-background rounded-sm"></div>
        </div>
      `;

      dropoffMarker.current = new mapboxgl.Marker(el)
        .setLngLat([dropoff.lng, dropoff.lat])
        .addTo(map.current);
    }
  }, [dropoff, mapLoaded]);

  // Update route and fit bounds
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;
    
    if (routeGeometry && source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: routeGeometry,
      });
    } else if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      });
    }

    // Fit bounds
    if (pickup && dropoff) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickup.lng, pickup.lat]);
      bounds.extend([dropoff.lng, dropoff.lat]);
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    } else if (pickup) {
      map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14 });
    } else if (dropoff) {
      map.current.flyTo({ center: [dropoff.lng, dropoff.lat], zoom: 14 });
    }
  }, [pickup, dropoff, routeGeometry, mapLoaded]);

  return (
    <div ref={mapContainer} className={className} />
  );
};

export default BookingMap;
