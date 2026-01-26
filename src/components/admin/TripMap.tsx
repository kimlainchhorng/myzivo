import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, MapPin, Car, Navigation } from "lucide-react";
import { useOnlineDrivers, useActiveTripsWithLocations } from "@/hooks/useOnlineDrivers";

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const TripMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useOnlineDrivers();
  const { data: activeTrips, isLoading: tripsLoading, refetch: refetchTrips } = useActiveTripsWithLocations();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
    });

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
    drivers?.forEach((driver) => {
      if (driver.current_lat && driver.current_lng) {
        hasPoints = true;
        
        const el = document.createElement("div");
        el.className = "driver-marker";
        el.innerHTML = `
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse"></div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <p class="font-semibold">${driver.full_name}</p>
            <p class="text-xs text-gray-500 capitalize">${driver.vehicle_type}${driver.vehicle_model ? ` • ${driver.vehicle_model}` : ""}</p>
            <p class="text-xs text-green-600 mt-1">● Online</p>
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

    // Add trip markers (pickup and dropoff)
    activeTrips?.forEach((trip) => {
      // Pickup marker
      if (trip.pickup_lat && trip.pickup_lng) {
        hasPoints = true;
        
        const pickupEl = document.createElement("div");
        pickupEl.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
        `;

        const pickupPopup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div class="p-2">
            <p class="font-semibold text-green-600">Pickup</p>
            <p class="text-xs">${trip.pickup_address}</p>
            <p class="text-xs text-gray-500 mt-1">Status: ${trip.status?.replace("_", " ")}</p>
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
          <div class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        const dropoffPopup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
          <div class="p-2">
            <p class="font-semibold text-red-600">Dropoff</p>
            <p class="text-xs">${trip.dropoff_address}</p>
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

    // Fit bounds if we have points
    if (hasPoints && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [drivers, activeTrips, mapLoaded]);

  const handleRefresh = () => {
    refetchDrivers();
    refetchTrips();
  };

  const onlineCount = drivers?.length || 0;
  const activeTripsCount = activeTrips?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live Map
            </CardTitle>
            <CardDescription>Real-time driver positions and active trips</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Car className="h-3 w-3" />
                {driversLoading ? "..." : `${onlineCount} online`}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Navigation className="h-3 w-3" />
                {tripsLoading ? "..." : `${activeTripsCount} active`}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(driversLoading || tripsLoading) && !mapLoaded ? (
          <Skeleton className="h-[400px] w-full rounded-lg" />
        ) : (
          <div className="relative">
            <div ref={mapContainer} className="h-[400px] w-full rounded-lg overflow-hidden" />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
              <p className="text-xs font-medium mb-2">Legend</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Car className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span>Online Driver</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span>Pickup Point</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span>Dropoff Point</span>
                </div>
              </div>
            </div>

            {onlineCount === 0 && activeTripsCount === 0 && mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium">No active drivers or trips</p>
                  <p className="text-sm text-muted-foreground">Markers will appear when drivers come online</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripMap;
