import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  RefreshCw, 
  Navigation, 
  Users, 
  Car,
  WifiOff,
  Star,
  MessageSquare,
  MoreVertical,
  Ban,
  Search,
  Filter,
  Bike,
  Truck,
  Zap,
  Circle,
  MapPinned
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useOnlineDrivers, OnlineDriver } from "@/hooks/useOnlineDrivers";
import { useActiveTrips, ActiveTrip } from "@/hooks/useActiveTrips";
import { cn } from "@/lib/utils";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface AdminLiveDriverMapProps {
  onDriverSelect?: (driver: OnlineDriver) => void;
  onSendMessage?: (driver: OnlineDriver) => void;
  onSuspendDriver?: (driver: OnlineDriver) => void;
  regionId?: string | null;
}

const AdminLiveDriverMap = ({ onDriverSelect, onSendMessage, onSuspendDriver, regionId }: AdminLiveDriverMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const tripMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<OnlineDriver | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<ActiveTrip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("_all");
  const [showActiveTrips, setShowActiveTrips] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const { data: onlineDrivers, isLoading, refetch } = useOnlineDrivers();
  const { data: activeTrips, isLoading: tripsLoading, refetch: refetchTrips } = useActiveTrips(regionId);

  // Filter drivers based on search and vehicle type
  const filteredDrivers = onlineDrivers?.filter(driver => {
    const matchesSearch = driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVehicle = vehicleFilter === "_all" || driver.vehicle_type === vehicleFilter;
    return matchesSearch && matchesVehicle;
  }) || [];

  // Get vehicle type icon
  const getVehicleIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "bike": return Bike;
      case "truck": return Truck;
      default: return Car;
    }
  };

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
        center: [-74.006, 40.7128], // NYC default
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

  // Update driver markers when drivers change
  useEffect(() => {
    if (!map.current || !filteredDrivers) return;

    // Clear existing driver markers
    driverMarkersRef.current.forEach(marker => marker.remove());
    driverMarkersRef.current = [];

    // Add markers for each filtered driver
    filteredDrivers.forEach((driver) => {
      if (!driver.current_lat || !driver.current_lng) return;

      const el = document.createElement("div");
      el.className = "driver-marker";
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
            </svg>
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedDriver(driver);
        setSelectedTrip(null);
        onDriverSelect?.(driver);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([driver.current_lng, driver.current_lat])
        .addTo(map.current!);

      driverMarkersRef.current.push(marker);
    });

    // Fit bounds to show all drivers
    if (filteredDrivers.length > 0) {
      const coords = filteredDrivers
        .filter(d => d.current_lat && d.current_lng)
        .map(d => [d.current_lng!, d.current_lat!] as [number, number]);

      if (coords.length > 0) {
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [filteredDrivers, onDriverSelect]);

  // Update trip markers when active trips change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing trip markers
    tripMarkersRef.current.forEach(marker => marker.remove());
    tripMarkersRef.current = [];

    if (!showActiveTrips || !activeTrips) return;

    // Add pickup and dropoff markers for each active trip
    activeTrips.forEach((trip) => {
      // Pickup marker (green)
      if (trip.pickup_lat && trip.pickup_lng) {
        const pickupEl = document.createElement("div");
        pickupEl.className = "pickup-marker";
        pickupEl.innerHTML = `
          <div class="relative cursor-pointer hover:scale-110 transition-transform">
            <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div class="absolute -top-1 -left-1 w-10 h-10 rounded-full border-2 border-emerald-500 opacity-50 animate-ping"></div>
          </div>
        `;

        pickupEl.addEventListener("click", () => {
          setSelectedTrip(trip);
          setSelectedDriver(null);
        });

        const pickupMarker = new mapboxgl.Marker(pickupEl)
          .setLngLat([trip.pickup_lng, trip.pickup_lat])
          .addTo(map.current!);

        tripMarkersRef.current.push(pickupMarker);
      }

      // Dropoff marker (red)
      if (trip.dropoff_lat && trip.dropoff_lng) {
        const dropoffEl = document.createElement("div");
        dropoffEl.className = "dropoff-marker";
        dropoffEl.innerHTML = `
          <div class="relative cursor-pointer hover:scale-110 transition-transform">
            <div class="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg border-2 border-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
        `;

        dropoffEl.addEventListener("click", () => {
          setSelectedTrip(trip);
          setSelectedDriver(null);
        });

        const dropoffMarker = new mapboxgl.Marker(dropoffEl)
          .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
          .addTo(map.current!);

        tripMarkersRef.current.push(dropoffMarker);
      }
    });
  }, [activeTrips, showActiveTrips]);

  const handleRefresh = () => {
    refetch();
    refetchTrips();
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Driver Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${onlineDrivers?.length || 0} drivers online`}
                {activeTrips && activeTrips.length > 0 && ` • ${activeTrips.length} active trips`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Show Active Trips Toggle */}
            <div className="flex items-center gap-2">
              <Switch 
                id="show-trips" 
                checked={showActiveTrips} 
                onCheckedChange={setShowActiveTrips}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="show-trips" className="text-xs text-muted-foreground cursor-pointer">
                Show Trips
              </Label>
            </div>
            <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading || tripsLoading}>
              <RefreshCw className={cn("h-4 w-4", (isLoading || tripsLoading) && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Map Legend */}
        {showActiveTrips && (
          <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Driver</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Pickup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Dropoff</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 h-9"
            />
          </div>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-36 h-9 bg-background/50">
              <Filter className="h-3 w-3 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Vehicles</SelectItem>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Map */}
          <div ref={mapContainer} className="h-[400px] lg:h-[500px] flex-1" />
          
          {/* Driver List Sidebar */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/50 max-h-[400px] lg:max-h-[500px] overflow-auto">
            <div className="p-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Online Drivers</span>
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-1" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : !filteredDrivers?.length ? (
                <div className="p-8 text-center">
                  <WifiOff className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || vehicleFilter !== "_all" ? "No matching drivers" : "No drivers online"}
                  </p>
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const VehicleIcon = getVehicleIcon(driver.vehicle_type);
                  return (
                  <div
                    key={driver.id}
                    className={cn(
                      "p-3 hover:bg-muted/30 transition-colors cursor-pointer",
                      selectedDriver?.id === driver.id && "bg-primary/5"
                    )}
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarImage src={driver.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20">
                            {driver.full_name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                      </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{driver.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <VehicleIcon className="h-3 w-3" />
                            <span className="capitalize">{driver.vehicle_type}</span>
                            {driver.rating && (
                              <>
                                <span>•</span>
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{Number(driver.rating).toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onDriverSelect?.(driver)}>
                            <Navigation className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSendMessage?.(driver)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onSuspendDriver?.(driver)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend Driver
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLiveDriverMap;
