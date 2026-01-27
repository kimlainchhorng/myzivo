import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Location } from "@/hooks/useRiderBooking";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Locate, ZoomIn, ZoomOut, Layers, Compass, Route } from "lucide-react";
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
  const [bearing, setBearing] = useState(0);

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
      pitch: 45,
      bearing: 0,
    });

    map.current.on("rotate", () => {
      setBearing(map.current?.getBearing() || 0);
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
          zoom: 16,
          pitch: 60,
          duration: 1500,
          essential: true,
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

  const handleResetBearing = () => {
    map.current?.easeTo({ bearing: 0, pitch: 45, duration: 500 });
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Premium gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/50 via-background/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/60 via-background/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background/20 to-transparent" />
        
        {/* Subtle corner vignettes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-radial-gradient from-primary/5 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-radial-gradient from-teal-500/5 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Map Controls - Premium glassmorphism */}
      <AnimatePresence>
        {showControls && mapLoaded && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-3 top-3 flex flex-col gap-1.5"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl shadow-black/20">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <div className="bg-card/80 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl shadow-black/20">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLocate}
                  disabled={isLocating}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Locate className={cn("w-4 h-4", isLocating && "animate-pulse text-primary")} />
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                style={{ rotate: -bearing }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetBearing}
                  className={cn(
                    "w-8 h-8 rounded-lg hover:bg-white/10 transition-colors",
                    bearing !== 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Compass className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleStyle}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Info Badge - Premium */}
      <AnimatePresence>
        {pickup && dropoff && routeGeometry && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="relative flex items-center gap-3 bg-card/90 backdrop-blur-2xl rounded-2xl px-4 py-3.5 shadow-2xl shadow-black/20 border border-white/10 overflow-hidden">
              {/* Animated background shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">Route active</span>
              </div>
              
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <Route className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Optimized</span>
                </div>
              </div>
              
              <div className="relative flex items-center gap-1.5 text-xs">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Navigation className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="font-semibold">Live</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state indicator - Premium */}
      <AnimatePresence>
        {!pickup && !dropoff && mapLoaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative text-center bg-card/85 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-black/30 border border-white/10 overflow-hidden">
              {/* Decorative gradient orbs */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl" />
              
              <motion.div 
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4 border border-white/10"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MapPin className="w-7 h-7 text-primary" />
              </motion.div>
              
              <p className="relative text-base font-semibold mb-1">Where to?</p>
              <p className="relative text-xs text-muted-foreground">Enter pickup & destination</p>
              
              {/* Decorative dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/50"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingMap;
