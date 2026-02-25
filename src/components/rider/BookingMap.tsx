import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Location } from "@/hooks/useRiderBooking";
import { OnlineDriver } from "@/hooks/useOnlineDrivers";
import { MapPin, Navigation, Locate, ZoomIn, ZoomOut, Layers, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingMapProps {
  pickup: Location | null;
  dropoff: Location | null;
  routeGeometry?: any;
  className?: string;
  showControls?: boolean;
  onlineDrivers?: OnlineDriver[];
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const BookingMap = ({ pickup, dropoff, routeGeometry, className, showControls = true, onlineDrivers = [] }: BookingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const bearingRaf = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [bearing, setBearing] = useState(0);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Check for valid token before initializing
    if (!MAPBOX_TOKEN) {
      setMapError("Map unavailable - configuration needed");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-74.006, 40.7128],
        zoom: 12,
        attributionControl: false,
        pitch: 45,
        bearing: 0,
        // Performance optimizations
        fadeDuration: 0,
        trackResize: false,
        renderWorldCopies: false,
        maxTileCacheSize: 50,
        collectResourceTiming: false,
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        if ((e.error as any)?.status === 401) {
          setMapError("Invalid map configuration");
        }
      });

      // Throttle bearing updates: Mapbox can emit rotate events at very high frequency.
      // Updating React state on every event causes FPS drops on mobile.
      map.current.on("rotate", () => {
        if (!showControls) return;
        if (bearingRaf.current != null) return;

        bearingRaf.current = window.requestAnimationFrame(() => {
          bearingRaf.current = null;
          // Quantize to reduce pointless renders from tiny float deltas.
          const next = Math.round(map.current?.getBearing() || 0);
          setBearing(next);
        });
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
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setMapError("Failed to load map");
    }

    return () => {
      if (bearingRaf.current != null) {
        window.cancelAnimationFrame(bearingRaf.current);
        bearingRaf.current = null;
      }
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
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
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
        <div class="relative">
          <div class="w-8 h-8 bg-slate-800 rounded-lg shadow-md border-2 border-white flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-sm"></div>
          </div>
        </div>
      `;

      dropoffMarker.current = new mapboxgl.Marker(el)
        .setLngLat([dropoff.lng, dropoff.lat])
        .addTo(map.current);
    }
  }, [dropoff, mapLoaded]);

  // Update route only (no camera moves). Camera animations are expensive and can feel laggy
  // if they run every time the route geometry updates.
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;
    const glowSource = map.current.getSource("route-glow") as mapboxgl.GeoJSONSource;
    if (!source || !glowSource) return;

    if (routeGeometry) {
      const data = {
        type: "Feature" as const,
        properties: {},
        geometry: routeGeometry,
      };
      source.setData(data);
      glowSource.setData(data);
      return;
    }

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
  }, [routeGeometry, mapLoaded]);

  // Update driver markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentDriverIds = new Set(onlineDrivers.map(d => d.id));
    
    // Remove markers for drivers no longer online
    driverMarkers.current.forEach((marker, driverId) => {
      if (!currentDriverIds.has(driverId)) {
        marker.remove();
        driverMarkers.current.delete(driverId);
      }
    });

    // Add or update driver markers
    onlineDrivers.forEach((driver) => {
      if (driver.current_lat == null || driver.current_lng == null) return;

      const existingMarker = driverMarkers.current.get(driver.id);
      
      if (existingMarker) {
        // Update position smoothly
        existingMarker.setLngLat([driver.current_lng, driver.current_lat]);
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-teal-400 border-2 border-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([driver.current_lng, driver.current_lat])
          .addTo(map.current!);

        driverMarkers.current.set(driver.id, marker);
      }
    });
  }, [onlineDrivers, mapLoaded]);

  // Viewport updates only when pickup/dropoff changes (not on every route update)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (pickup && dropoff) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickup.lng, pickup.lat]);
      bounds.extend([dropoff.lng, dropoff.lat]);
      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14,
        // Faster / less janky than default for frequent interactions
        duration: 0,
      });
      return;
    }

    if (pickup) {
      map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14, duration: 0 });
      return;
    }

    if (dropoff) {
      map.current.flyTo({ center: [dropoff.lng, dropoff.lat], zoom: 14, duration: 0 });
    }
  }, [pickup, dropoff, mapLoaded]);

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

  // Error fallback UI
  if (mapError) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-card/50", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-card/85 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-black/30 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <MapPin className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold mb-1">Map Preview</p>
            <p className="text-xs text-muted-foreground">{mapError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl [&_.mapboxgl-ctrl-logo]:hidden [&_.mapboxgl-ctrl-attrib]:hidden", className)}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Minimal edge fade */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/50 to-transparent" />
      </div>

      {/* Map Controls - Premium glassmorphism */}
      {showControls && mapLoaded && (
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <div className="bg-card/80 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl shadow-black/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-xl border border-white/10 p-1.5 shadow-2xl shadow-black/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLocate}
              disabled={isLocating}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Locate className={cn("w-4 h-4", isLocating && "animate-pulse text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetBearing}
              className={cn(
                "w-8 h-8 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation",
                bearing !== 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              style={{ transform: `rotate(${-bearing}deg)` }}
            >
              <Compass className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleStyle}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Route Info Badge - Premium */}
      {pickup && dropoff && routeGeometry && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 bg-card/90 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground font-medium">Route active</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-xs">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="font-semibold">Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state indicator - Premium */}
      {!pickup && !dropoff && mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-card/85 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mx-auto mb-3 border border-white/10">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold mb-1">Where to?</p>
            <p className="text-xs text-muted-foreground">Enter pickup & destination</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingMap;
