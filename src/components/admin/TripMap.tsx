import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, MapPin, Car, Maximize2, Layers, Activity, AlertCircle } from "lucide-react";
import { useOnlineDrivers, useActiveTripsWithLocations } from "@/hooks/useOnlineDrivers";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGoogleMaps } from "@/components/maps";

// Dark map styles for Google Maps
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
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
];

const TripMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"all" | "drivers" | "trips">("all");

  const { isLoaded: googleLoaded, loadError: googleError } = useGoogleMaps();
  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useOnlineDrivers();
  const { data: activeTrips, isLoading: tripsLoading, refetch: refetchTrips } = useActiveTripsWithLocations();

  // Initialize Google Map
  useEffect(() => {
    if (!googleLoaded || !mapContainer.current || mapRef.current) return;

    if (googleError) {
      setMapError(googleError);
      return;
    }

    try {
      mapRef.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: 40.7128, lng: -74.006 }, // NYC default
        zoom: 11,
        styles: darkMapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();

      mapRef.current.addListener("tilesloaded", () => {
        setMapLoaded(true);
        setMapError(null);
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError("Failed to initialize map");
    }

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [googleLoaded, googleError]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !window.google) return;

    clearMarkers();

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Add driver markers
    if (activeLayer === "all" || activeLayer === "drivers") {
      drivers?.forEach((driver) => {
        if (driver.current_lat && driver.current_lng) {
          hasPoints = true;

          const marker = new window.google.maps.Marker({
            position: { lat: driver.current_lat, lng: driver.current_lng },
            map: mapRef.current!,
            title: driver.full_name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: 12,
            },
            animation: window.google.maps.Animation.DROP,
          });

          marker.addListener("click", () => {
            infoWindowRef.current?.setContent(`
              <div style="padding: 12px; min-width: 180px; background: #1a1a1a; color: white; border-radius: 8px;">
                <p style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${driver.full_name}</p>
                <p style="font-size: 12px; color: #9ca3af; text-transform: capitalize;">${driver.vehicle_type}${driver.vehicle_model ? ` • ${driver.vehicle_model}` : ""}</p>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 6px; background: rgba(16, 185, 129, 0.1); border-radius: 6px;">
                  <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
                  <span style="font-size: 11px; color: #10b981;">Online & Available</span>
                </div>
              </div>
            `);
            infoWindowRef.current?.open(mapRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: driver.current_lat, lng: driver.current_lng });
        }
      });
    }

    // Add trip markers (pickup and dropoff)
    if (activeLayer === "all" || activeLayer === "trips") {
      activeTrips?.forEach((trip) => {
        // Pickup marker
        if (trip.pickup_lat && trip.pickup_lng) {
          hasPoints = true;

          const pickupMarker = new window.google.maps.Marker({
            position: { lat: trip.pickup_lat, lng: trip.pickup_lng },
            map: mapRef.current!,
            title: "Pickup",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#10b981",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            },
          });

          pickupMarker.addListener("click", () => {
            infoWindowRef.current?.setContent(`
              <div style="padding: 10px; background: #1a1a1a; color: white; border-radius: 8px;">
                <p style="font-weight: bold; color: #10b981; margin-bottom: 4px;">Pickup</p>
                <p style="font-size: 12px; color: #d1d5db;">${trip.pickup_address}</p>
                <p style="font-size: 10px; color: #6b7280; margin-top: 6px; text-transform: capitalize;">Status: ${trip.status?.replace("_", " ")}</p>
              </div>
            `);
            infoWindowRef.current?.open(mapRef.current, pickupMarker);
          });

          markersRef.current.push(pickupMarker);
          bounds.extend({ lat: trip.pickup_lat, lng: trip.pickup_lng });
        }

        // Dropoff marker
        if (trip.dropoff_lat && trip.dropoff_lng) {
          hasPoints = true;

          const dropoffMarker = new window.google.maps.Marker({
            position: { lat: trip.dropoff_lat, lng: trip.dropoff_lng },
            map: mapRef.current!,
            title: "Dropoff",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 8,
            },
          });

          dropoffMarker.addListener("click", () => {
            infoWindowRef.current?.setContent(`
              <div style="padding: 10px; background: #1a1a1a; color: white; border-radius: 8px;">
                <p style="font-weight: bold; color: #ef4444; margin-bottom: 4px;">Dropoff</p>
                <p style="font-size: 12px; color: #d1d5db;">${trip.dropoff_address}</p>
              </div>
            `);
            infoWindowRef.current?.open(mapRef.current, dropoffMarker);
          });

          markersRef.current.push(dropoffMarker);
          bounds.extend({ lat: trip.dropoff_lat, lng: trip.dropoff_lng });
        }
      });
    }

    // Fit bounds if we have points
    if (hasPoints && !bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      
      // Limit max zoom
      const listener = mapRef.current.addListener("idle", () => {
        if (mapRef.current && mapRef.current.getZoom()! > 14) {
          mapRef.current.setZoom(14);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [drivers, activeTrips, mapLoaded, activeLayer, clearMarkers]);

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
        {mapError || googleError ? (
          <div className="h-[450px] flex items-center justify-center bg-muted/20">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-bold text-lg mb-1">Map Unavailable</p>
              <p className="text-sm text-muted-foreground">{mapError || googleError}</p>
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
        ) : !googleLoaded ? (
          <div className="h-[450px] flex items-center justify-center bg-muted/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
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

            {/* Empty state overlay */}
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
                    <p className="font-bold text-lg mb-1">No Active Activity</p>
                    <p className="text-sm text-muted-foreground">Drivers and trips will appear here when online</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
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
