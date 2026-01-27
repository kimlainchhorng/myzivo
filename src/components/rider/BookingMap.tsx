import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Location } from "@/hooks/useRiderBooking";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Locate, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingMapProps {
  pickup: Location | null;
  dropoff: Location | null;
  routeGeometry?: any;
  className?: string;
  showControls?: boolean;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const BookingMap = ({ pickup, dropoff, routeGeometry, className, showControls = true }: BookingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.006, 40.7128],
      zoom: 12,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      
      // Add glow effect source for route
      map.current!.addSource("route-glow", {
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

      // Add glow layer (wider, more transparent)
      map.current!.addLayer({
        id: "route-glow",
        type: "line",
        source: "route-glow",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#22c55e",
          "line-width": 12,
          "line-opacity": 0.2,
          "line-blur": 4,
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
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      // Add animated dash layer on top
      map.current!.addLayer({
        id: "route-dash",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#4ade80",
          "line-width": 3,
          "line-dasharray": [0, 4, 3],
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
        <div class="relative group">
          <div class="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
          <div class="relative w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-3 border-white shadow-lg shadow-emerald-500/50 flex items-center justify-center">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
          <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            Pickup
          </div>
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
        <div class="relative group">
          <div class="relative w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-lg shadow-black/30 flex items-center justify-center border-2 border-white">
            <div class="w-2.5 h-2.5 bg-white rounded-sm"></div>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 border-r-2 border-b-2 border-white -z-10"></div>
          <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/95 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            Dropoff
          </div>
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
    const glowSource = map.current.getSource("route-glow") as mapboxgl.GeoJSONSource;
    
    if (routeGeometry && source && glowSource) {
      const data = {
        type: "Feature" as const,
        properties: {},
        geometry: routeGeometry,
      };
      source.setData(data);
      glowSource.setData(data);
    } else if (source && glowSource) {
      const emptyData = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [],
        },
      };
      source.setData(emptyData);
      glowSource.setData(emptyData);
    }

    // Fit bounds
    if (pickup && dropoff) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickup.lng, pickup.lat]);
      bounds.extend([dropoff.lng, dropoff.lat]);
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    } else if (pickup) {
      map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14 });
    } else if (dropoff) {
      map.current.flyTo({ center: [dropoff.lng, dropoff.lat], zoom: 14 });
    }
  }, [pickup, dropoff, routeGeometry, mapLoaded]);

  // Map control handlers
  const handleZoomIn = () => {
    map.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    map.current?.zoomOut({ duration: 300 });
  };

  const handleLocate = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 15,
          duration: 1000,
        });
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const handleToggleStyle = () => {
    const newStyle = mapStyle === "dark" ? "satellite" : "dark";
    setMapStyle(newStyle);
    map.current?.setStyle(
      newStyle === "dark" 
        ? "mapbox://styles/mapbox/dark-v11" 
        : "mapbox://styles/mapbox/satellite-streets-v12"
    );
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Gradient overlays for premium look */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/50 to-transparent" />
      </div>

      {/* Map Controls */}
      <AnimatePresence>
        {showControls && mapLoaded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-3 top-3 flex flex-col gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="w-9 h-9 rounded-lg bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="w-9 h-9 rounded-lg bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLocate}
              disabled={isLocating}
              className="w-9 h-9 rounded-lg bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
            >
              <Locate className={cn("w-4 h-4", isLocating && "animate-pulse text-primary")} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleStyle}
              className="w-9 h-9 rounded-lg bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg"
            >
              <Layers className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Info Badge */}
      <AnimatePresence>
        {pickup && dropoff && routeGeometry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Route active</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 text-xs">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">Optimized path</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state indicator */}
      <AnimatePresence>
        {!pickup && !dropoff && mapLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Enter your locations</p>
              <p className="text-xs text-muted-foreground mt-1">to see your route</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingMap;
