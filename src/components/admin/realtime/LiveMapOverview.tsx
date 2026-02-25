import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Navigation, Car, Bike, Package, Users, 
  ZoomIn, ZoomOut, Maximize2, RefreshCw, WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnlineDrivers, useActiveTripsWithLocations } from "@/hooks/useOnlineDrivers";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export default function LiveMapOverview() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [mapError, setMapError] = useState<string | null>(null);

  const { data: onlineDrivers, isLoading: driversLoading, refetch: refetchDrivers } = useOnlineDrivers();
  const { data: activeTrips, isLoading: tripsLoading, refetch: refetchTrips } = useActiveTripsWithLocations();

  const isLoading = driversLoading || tripsLoading;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError("Map unavailable - configuration needed");
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-74.006, 40.7128],
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Map initialization failed:", error);
      setMapError("Failed to initialize map");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasMarkers = false;

    // Add driver markers
    if (selectedLayer === "all" || selectedLayer === "driver") {
      onlineDrivers?.forEach((driver) => {
        if (!driver.current_lat || !driver.current_lng) return;

        hasMarkers = true;
        bounds.extend([driver.current_lng, driver.current_lat]);

        const el = document.createElement("div");
        el.className = "driver-marker";
        el.innerHTML = `
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
              </svg>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse"></div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <p class="font-semibold">${driver.full_name}</p>
            <p class="text-xs text-gray-500">${driver.vehicle_type} • ${driver.vehicle_plate || 'N/A'}</p>
            <p class="text-xs text-green-600">Online</p>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([driver.current_lng, driver.current_lat])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }

    // Add trip markers (pickup and dropoff points)
    if (selectedLayer === "all" || selectedLayer === "rider") {
      activeTrips?.forEach((trip) => {
        // Pickup marker
        if (trip.pickup_lat && trip.pickup_lng) {
          hasMarkers = true;
          bounds.extend([trip.pickup_lng, trip.pickup_lat]);

          const pickupEl = document.createElement("div");
          pickupEl.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <p class="font-semibold text-xs">Pickup</p>
              <p class="text-xs text-gray-500">${trip.pickup_address}</p>
              <p class="text-xs text-blue-600">${trip.status}</p>
            </div>
          `);

          const marker = new mapboxgl.Marker(pickupEl)
            .setLngLat([trip.pickup_lng, trip.pickup_lat])
            .setPopup(popup)
            .addTo(map.current!);

          markersRef.current.push(marker);
        }

        // Dropoff marker
        if (trip.dropoff_lat && trip.dropoff_lng) {
          hasMarkers = true;
          bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);

          const dropoffEl = document.createElement("div");
          dropoffEl.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <p class="font-semibold text-xs">Dropoff</p>
              <p class="text-xs text-gray-500">${trip.dropoff_address}</p>
            </div>
          `);

          const marker = new mapboxgl.Marker(dropoffEl)
            .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
            .setPopup(popup)
            .addTo(map.current!);

          markersRef.current.push(marker);
        }
      });
    }

    // Fit bounds if we have markers
    if (hasMarkers && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [onlineDrivers, activeTrips, selectedLayer]);

  const handleRefresh = () => {
    refetchDrivers();
    refetchTrips();
  };

  const stats = {
    drivers: onlineDrivers?.length || 0,
    activeTrips: activeTrips?.length || 0,
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Map Overview</CardTitle>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${stats.drivers} drivers online, ${stats.activeTrips} active trips`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-500 border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </Badge>
            <div className="flex border rounded-xl overflow-hidden">
              {["all", "driver", "rider"].map((layer) => (
                <Button
                  key={layer}
                  variant={selectedLayer === layer ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedLayer(layer)}
                  className="rounded-none px-3 capitalize"
                >
                  {layer === "rider" ? "trips" : layer}
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px]">
          {isLoading && !map.current ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Loading map data...</p>
              </div>
            </div>
          ) : null}
          
          <div ref={mapContainer} className="h-full w-full" />

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant="secondary" className="gap-1.5 bg-background/80 backdrop-blur-sm">
              <Car className="h-3 w-3 text-emerald-500" />
              {stats.drivers} drivers
            </Badge>
            <Badge variant="secondary" className="gap-1.5 bg-background/80 backdrop-blur-sm">
              <MapPin className="h-3 w-3 text-blue-500" />
              {stats.activeTrips} trips
            </Badge>
          </div>

          {/* No data state */}
          {!isLoading && stats.drivers === 0 && stats.activeTrips === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="text-center">
                <WifiOff className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No active drivers or trips</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
