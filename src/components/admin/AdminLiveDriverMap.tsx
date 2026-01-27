import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Ban
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useOnlineDrivers, OnlineDriver } from "@/hooks/useOnlineDrivers";
import { cn } from "@/lib/utils";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface AdminLiveDriverMapProps {
  onDriverSelect?: (driver: OnlineDriver) => void;
  onSendMessage?: (driver: OnlineDriver) => void;
  onSuspendDriver?: (driver: OnlineDriver) => void;
}

const AdminLiveDriverMap = ({ onDriverSelect, onSendMessage, onSuspendDriver }: AdminLiveDriverMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<OnlineDriver | null>(null);
  
  const { data: onlineDrivers, isLoading, refetch } = useOnlineDrivers();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNtOG9oYXNoYTAyamQya3EzMHhrMHJndHEifQ.x3FGTQ-IqMuZ6A8-XvlXcQ";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.006, 40.7128], // NYC default
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when drivers change
  useEffect(() => {
    if (!map.current || !onlineDrivers) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each online driver
    onlineDrivers.forEach((driver) => {
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
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedDriver(driver);
        onDriverSelect?.(driver);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([driver.current_lng, driver.current_lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all drivers
    if (onlineDrivers.length > 0) {
      const coords = onlineDrivers
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
  }, [onlineDrivers, onDriverSelect]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Driver Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${onlineDrivers?.length || 0} drivers online`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-500 border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
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
              ) : !onlineDrivers?.length ? (
                <div className="p-8 text-center">
                  <WifiOff className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No drivers online</p>
                </div>
              ) : (
                onlineDrivers.map((driver) => (
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
                          <Car className="h-3 w-3" />
                          <span>{driver.vehicle_type}</span>
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
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLiveDriverMap;
