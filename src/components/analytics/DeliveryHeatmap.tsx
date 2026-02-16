/**
 * Delivery Heatmap Component
 * Mapbox-based heatmap showing pickup and delivery locations
 */

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { hasMapboxToken } from "@/services/mapbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useHeatmapLocations } from "@/hooks/useAdminAnalytics";
import type { DateRange, HeatmapLocation } from "@/lib/analytics";

interface DeliveryHeatmapProps {
  dateRange: DateRange;
  className?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

type ViewMode = "all" | "pickup" | "delivery";

const DeliveryHeatmap = ({ dateRange, className = "" }: DeliveryHeatmapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const { data: locations, isLoading } = useHeatmapLocations(dateRange);

  // Filter locations based on view mode
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (viewMode === "all") return locations;
    return locations.filter((l) => l.type === viewMode);
  }, [locations, viewMode]);

  // Convert to GeoJSON
  const geoJSON = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: filteredLocations.map((loc) => ({
        type: "Feature" as const,
        properties: { type: loc.type, weight: loc.weight },
        geometry: {
          type: "Point" as const,
          coordinates: [loc.lng, loc.lat],
        },
      })),
    };
  }, [filteredLocations]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !hasMapboxToken()) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
      center: [-73.9857, 40.7128], // NYC default
      zoom: 10,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setIsLoaded(true);

      // Add heatmap source (empty initially)
      map.current!.addSource("heatmap-data", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Add heatmap layer
      map.current!.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-data",
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 3],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,255,0)",
            0.2, "rgba(0,255,255,0.5)",
            0.4, "rgba(0,255,0,0.7)",
            0.6, "rgba(255,255,0,0.8)",
            0.8, "rgba(255,128,0,0.9)",
            1, "rgba(255,0,0,1)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 12, 20],
          "heatmap-opacity": 0.8,
        },
      });

      // Add point layer for zoomed in view
      map.current!.addLayer({
        id: "points-layer",
        type: "circle",
        source: "heatmap-data",
        minzoom: 12,
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "match",
            ["get", "type"],
            "pickup", "#3b82f6",
            "delivery", "#22c55e",
            "#ffffff"
          ],
          "circle-opacity": 0.8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update heatmap data when locations change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource("heatmap-data") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoJSON);

      // Fit bounds if we have data
      if (filteredLocations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        filteredLocations.forEach((loc) => {
          bounds.extend([loc.lng, loc.lat]);
        });
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
      }
    }
  }, [geoJSON, isLoaded, filteredLocations]);

  // Fallback if no token
  if (!hasMapboxToken()) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center rounded-xl">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <p className="text-muted-foreground text-sm">Map key not set</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Add VITE_MAPBOX_ACCESS_TOKEN to enable maps</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="bg-background/80 backdrop-blur-sm">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pickup">Pickups</TabsTrigger>
            <TabsTrigger value="delivery">Deliveries</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-3">
        <p className="text-sm font-medium">{filteredLocations.length} locations</p>
        <p className="text-xs text-muted-foreground">
          {viewMode === "all" ? "All orders" : viewMode === "pickup" ? "Pickup points" : "Drop-off points"}
        </p>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-20 rounded-xl">
          <Skeleton className="w-full h-full absolute inset-0 rounded-xl" />
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-3">
        <p className="text-xs font-medium mb-2">Order Density</p>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded-sm bg-cyan-500/50" />
          <div className="w-4 h-3 rounded-sm bg-green-500/70" />
          <div className="w-4 h-3 rounded-sm bg-yellow-500/80" />
          <div className="w-4 h-3 rounded-sm bg-orange-500/90" />
          <div className="w-4 h-3 rounded-sm bg-red-500" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full rounded-xl" />
    </div>
  );
};

export default DeliveryHeatmap;
