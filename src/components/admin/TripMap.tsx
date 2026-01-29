import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, MapPin, Car, Navigation, Maximize2, Layers, Activity, AlertCircle } from "lucide-react";
import { useOnlineDrivers, useActiveTripsWithLocations } from "@/hooks/useOnlineDrivers";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Get Mapbox token - check both VITE_ prefixed (client-side) and fallback
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
  "pk.eyJ1Ijoia2ltbGFpbiIsImEiOiJjbWp4aXZydHc0NmQyM2hwdnVxODBvOHFiIn0.rl7sFlnNFKJpOMC4D3sPgA";

const TripMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"all" | "drivers" | "trips">("all");

  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useOnlineDrivers();
  const { data: activeTrips, isLoading: tripsLoading, refetch: refetchTrips } = useActiveTripsWithLocations();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not configured");
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError("Failed to load map");
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError("Failed to initialize map");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasPoints = false;

    // Add driver markers
    if (activeLayer === "all" || activeLayer === "drivers") {
      drivers?.forEach((driver) => {
        if (driver.current_lat && driver.current_lng) {
          hasPoints = true;
          
          const el = document.createElement("div");
          el.className = "driver-marker";
          el.innerHTML = `
            <div class="relative group cursor-pointer">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white/20 transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                  <circle cx="7" cy="17" r="2"/>
                  <circle cx="17" cy="17" r="2"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          `;

          const popup = new mapboxgl.Popup({ 
            offset: 25,
            className: "premium-popup"
          }).setHTML(`
            <div class="p-4 min-w-[200px]">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-base">${driver.full_name}</p>
                  <p class="text-xs text-gray-400 capitalize">${driver.vehicle_type}${driver.vehicle_model ? ` • ${driver.vehicle_model}` : ""}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-xs font-medium text-emerald-400">Online & Available</span>
              </div>
            </div>
          `);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([driver.current_lng, driver.current_lat])
            .setPopup(popup)
            .addTo(map.current!);

          markersRef.current.push(marker);
          bounds.extend([driver.current_lng, driver.current_lat]);
        }
      });
    }

    // Add trip markers (pickup and dropoff)
    if (activeLayer === "all" || activeLayer === "trips") {
      activeTrips?.forEach((trip) => {
        // Pickup marker
        if (trip.pickup_lat && trip.pickup_lng) {
          hasPoints = true;
          
          const pickupEl = document.createElement("div");
          pickupEl.innerHTML = `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white/20 transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
              </div>
            </div>
          `;

          const pickupPopup = new mapboxgl.Popup({ 
            offset: 15,
            className: "premium-popup"
          }).setHTML(`
            <div class="p-3">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                </div>
                <p class="font-bold text-emerald-400 text-sm">Pickup</p>
              </div>
              <p class="text-xs text-gray-300">${trip.pickup_address}</p>
              <div class="mt-2 px-2 py-1 rounded bg-muted/50 inline-block">
                <p class="text-[10px] text-gray-400 capitalize">Status: ${trip.status?.replace("_", " ")}</p>
              </div>
            </div>
          `);

          const pickupMarker = new mapboxgl.Marker(pickupEl)
            .setLngLat([trip.pickup_lng, trip.pickup_lat])
            .setPopup(pickupPopup)
            .addTo(map.current!);

          markersRef.current.push(pickupMarker);
          bounds.extend([trip.pickup_lng, trip.pickup_lat]);
        }

        // Dropoff marker
        if (trip.dropoff_lat && trip.dropoff_lng) {
          hasPoints = true;
          
          const dropoffEl = document.createElement("div");
          dropoffEl.innerHTML = `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-white/20 transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            </div>
          `;

          const dropoffPopup = new mapboxgl.Popup({ 
            offset: 15,
            className: "premium-popup"
          }).setHTML(`
            <div class="p-3">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-400">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p class="font-bold text-red-400 text-sm">Dropoff</p>
              </div>
              <p class="text-xs text-gray-300">${trip.dropoff_address}</p>
            </div>
          `);

          const dropoffMarker = new mapboxgl.Marker(dropoffEl)
            .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
            .setPopup(dropoffPopup)
            .addTo(map.current!);

          markersRef.current.push(dropoffMarker);
          bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
        }
      });
    }

    // Fit bounds if we have points
    if (hasPoints && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [drivers, activeTrips, mapLoaded, activeLayer]);

  const handleRefresh = () => {
    refetchDrivers();
    refetchTrips();
  };

  const onlineCount = drivers?.length || 0;
  const activeTripsCount = activeTrips?.length || 0;

  return (
    <Card className={cn(
      "border-0 bg-gradient-to-br from-card/90 to-card shadow-2xl overflow-hidden transition-all duration-300",
      isFullscreen && "fixed inset-4 z-50"
    )}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <MapPin className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-bold">Live Map</CardTitle>
              <CardDescription>Real-time driver positions and active trips</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Layer toggles */}
            <div className="flex items-center bg-muted/30 rounded-xl p-1">
              {[
                { id: "all", label: "All" },
                { id: "drivers", label: "Drivers" },
                { id: "trips", label: "Trips" },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as typeof activeLayer)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeLayer === layer.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {layer.label}
                </button>
              ))}
            </div>
            
            {/* Stats badges */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-primary/10 border-primary/20 text-primary">
                <Car className="h-3.5 w-3.5" />
                <span className="font-bold">{driversLoading ? "..." : onlineCount}</span>
                <span className="text-xs opacity-70">online</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 bg-amber-500/10 border-amber-500/20 text-amber-500">
                <Activity className="h-3.5 w-3.5" />
                <span className="font-bold">{tripsLoading ? "..." : activeTripsCount}</span>
                <span className="text-xs opacity-70">active</span>
              </Badge>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                className="rounded-xl h-9 w-9"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="rounded-xl h-9 w-9"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {mapError ? (
          <div className="h-[450px] flex items-center justify-center bg-muted/20">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-bold text-lg mb-1">Map Unavailable</p>
              <p className="text-sm text-muted-foreground">{mapError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : (driversLoading || tripsLoading) && !mapLoaded ? (
          <Skeleton className="h-[450px] w-full" />
        ) : (
          <div className="relative">
            <div 
              ref={mapContainer} 
              className={cn(
                "w-full",
                isFullscreen ? "h-[calc(100vh-200px)]" : "h-[450px]"
              )} 
            />
            
            {/* Premium Legend */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-5 left-5 bg-card/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-border/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Legend</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-md shadow-primary/30">
                    <Car className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">Online Driver</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-500/30" />
                  <span className="font-medium">Pickup Point</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-md shadow-red-500/30" />
                  <span className="font-medium">Dropoff Point</span>
                </div>
              </div>
            </motion.div>

            {/* Empty state overlay - only show when no data AND map is loaded */}
            <AnimatePresence>
              {onlineCount === 0 && activeTripsCount === 0 && mapLoaded && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                >
                  <div className="text-center p-8">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto mb-4"
                    >
                      <MapPin className="h-10 w-10 text-muted-foreground" />
                    </motion.div>
                    <p className="font-bold text-lg">No active drivers or trips</p>
                    <p className="text-sm text-muted-foreground mt-1">Markers will appear when drivers come online</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripMap;
