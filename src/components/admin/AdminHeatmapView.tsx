import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Flame,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Layers,
  Zap,
  Car,
  Utensils,
  Users,
  DollarSign,
  Clock,
  Target,
  Plus,
  Settings,
  Eye,
  Map,
  Globe,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface Zone {
  id: string;
  name: string;
  type: "demand" | "service" | "surge";
  demand_level: "high" | "medium" | "low";
  coordinates: { lat: number; lng: number };
  radius_km: number;
  active_drivers: number;
  pending_requests: number;
  avg_wait_time: number;
  surge_multiplier: number;
  revenue_today: number;
  trend: number;
}

interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
}

// TODO: Fetch zones and heat points from database
const emptyHeatPoints: HeatPoint[] = [];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const AdminHeatmapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [layerType, setLayerType] = useState<"heatmap" | "zones" | "drivers">("heatmap");
  const [showSurgeZones, setShowSurgeZones] = useState(true);
  const [timeRange, setTimeRange] = useState("live");
  const queryClient = useQueryClient();

  const { data: zones, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-zones", timeRange],
    queryFn: async () => {
      // TODO: Query real zone data from database
      return [] as Zone[];
    },
    refetchInterval: 30000,
  });

  const { data: drivers } = useQuery({
    queryKey: ["online-drivers-map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, current_lat, current_lng, vehicle_type, is_online")
        .eq("is_online", true)
        .not("current_lat", "is", null);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-73.98, 40.73],
        zoom: 11,
        pitch: 45,
        bearing: -17.6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);

        // Add heatmap source
        map.current?.addSource("demand-heat", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: emptyHeatPoints.map((point) => ({
              type: "Feature" as const,
              properties: { weight: point.weight },
              geometry: {
                type: "Point" as const,
                coordinates: [point.lng, point.lat],
              },
            })),
          },
        });

        // Add heatmap layer
        map.current?.addLayer({
          id: "demand-heatmap",
          type: "heatmap",
          source: "demand-heat",
          paint: {
            "heatmap-weight": ["get", "weight"],
            "heatmap-intensity": 1,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(0, 0, 255, 0)",
              0.2, "rgba(0, 255, 255, 0.5)",
              0.4, "rgba(0, 255, 0, 0.6)",
              0.6, "rgba(255, 255, 0, 0.7)",
              0.8, "rgba(255, 128, 0, 0.8)",
              1, "rgba(255, 0, 0, 0.9)",
            ],
            "heatmap-radius": 30,
            "heatmap-opacity": 0.7,
          },
        });
      });
    } catch (err) {
      console.error("Map init error:", err);
      setMapError("Failed to initialize map");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Toggle heatmap visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const visibility = layerType === "heatmap" ? "visible" : "none";
    if (map.current.getLayer("demand-heatmap")) {
      map.current.setLayoutProperty("demand-heatmap", "visibility", visibility);
    }
  }, [layerType, mapLoaded]);

  // Add driver markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !drivers || layerType !== "drivers") return;

    // Remove existing markers
    document.querySelectorAll(".driver-marker").forEach(el => el.remove());

    drivers.forEach((driver) => {
      if (!driver.current_lat || !driver.current_lng) return;

      const el = document.createElement("div");
      el.className = "driver-marker";
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary/90 border-2 border-white shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.5-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([driver.current_lng, driver.current_lat])
        .addTo(map.current!);
    });
  }, [drivers, layerType, mapLoaded]);

  const totalDrivers = zones?.reduce((acc, z) => acc + z.active_drivers, 0) || 0;
  const totalRequests = zones?.reduce((acc, z) => acc + z.pending_requests, 0) || 0;
  const totalRevenue = zones?.reduce((acc, z) => acc + z.revenue_today, 0) || 0;
  const highDemandCount = zones?.filter(z => z.demand_level === "high").length || 0;

  const getDemandStyle = (level: string) => {
    switch (level) {
      case "high": return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" };
      case "medium": return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" };
      case "low": return { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" };
      default: return { color: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 shadow-lg"
          >
            <Flame className="h-6 w-6 text-orange-500" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Geographic Insights
              <Badge className="ml-2 bg-red-500/20 text-red-500">{highDemandCount} Hot Zones</Badge>
            </h1>
            <p className="text-muted-foreground">Real-time demand visualization & zone management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <Flame className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highDemandCount}</p>
                <p className="text-sm text-muted-foreground">High Demand Zones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <Car className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDrivers}</p>
                <p className="text-sm text-muted-foreground">Active Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRequests}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Map + Zones Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Demand Heatmap
              </CardTitle>
              <Tabs value={layerType} onValueChange={(v) => setLayerType(v as any)}>
                <TabsList className="h-8 bg-muted/50">
                  <TabsTrigger value="heatmap" className="text-xs h-6 px-2 gap-1">
                    <Flame className="h-3 w-3" />
                    Heat
                  </TabsTrigger>
                  <TabsTrigger value="zones" className="text-xs h-6 px-2 gap-1">
                    <Target className="h-3 w-3" />
                    Zones
                  </TabsTrigger>
                  <TabsTrigger value="drivers" className="text-xs h-6 px-2 gap-1">
                    <Car className="h-3 w-3" />
                    Drivers
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[400px]">
              {mapError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                  <div className="text-center p-6">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <p className="font-medium">{mapError}</p>
                    <p className="text-sm text-muted-foreground mt-1">Configure VITE_MAPBOX_ACCESS_TOKEN</p>
                  </div>
                </div>
              ) : (
                <>
                  <div ref={mapContainer} className="w-full h-full" />
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/80">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                        <span>Loading map...</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-card/90 backdrop-blur-sm border border-border/50">
                <p className="text-xs font-medium mb-2">Demand Intensity</p>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-3 rounded bg-blue-500/50" />
                  <div className="w-6 h-3 rounded bg-cyan-500/60" />
                  <div className="w-6 h-3 rounded bg-green-500/70" />
                  <div className="w-6 h-3 rounded bg-yellow-500/80" />
                  <div className="w-6 h-3 rounded bg-orange-500/80" />
                  <div className="w-6 h-3 rounded bg-red-500/90" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone List */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              Active Zones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-4 pb-4">
              <div className="space-y-2">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))
                ) : (
                  zones?.map((zone, index) => {
                    const style = getDemandStyle(zone.demand_level);
                    return (
                      <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedZone(zone)}
                        className={cn(
                          "p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                          style.bg, style.border,
                          selectedZone?.id === zone.id && "ring-2 ring-primary"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className={cn("h-4 w-4", style.color)} />
                            <span className="font-medium text-sm">{zone.name}</span>
                          </div>
                          {zone.surge_multiplier > 1 && (
                            <Badge className="bg-amber-500/20 text-amber-500 text-xs">
                              {zone.surge_multiplier}x
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Car className="h-3 w-3" />
                            {zone.active_drivers}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {zone.avg_wait_time}m
                          </div>
                          <div className={cn("flex items-center gap-1", zone.trend >= 0 ? "text-green-500" : "text-red-500")}>
                            {zone.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(zone.trend)}%
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Zone Details */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      getDemandStyle(selectedZone.demand_level).bg
                    )}>
                      <MapPin className={cn("h-5 w-5", getDemandStyle(selectedZone.demand_level).color)} />
                    </div>
                    <div>
                      <CardTitle>{selectedZone.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">{selectedZone.type} zone</Badge>
                        <Badge className={cn(getDemandStyle(selectedZone.demand_level).bg, getDemandStyle(selectedZone.demand_level).color)}>
                          {selectedZone.demand_level} demand
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">Active Drivers</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedZone.active_drivers}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Pending Requests</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedZone.pending_requests}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Avg Wait Time</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedZone.avg_wait_time} min</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Revenue Today</span>
                    </div>
                    <p className="text-2xl font-bold">${selectedZone.revenue_today.toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedZone.surge_multiplier > 1 && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium text-amber-600">Surge Pricing Active</p>
                        <p className="text-sm text-muted-foreground">
                          Current multiplier: {selectedZone.surge_multiplier}x • High demand detected
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminHeatmapView;
