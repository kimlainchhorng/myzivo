import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Navigation, Car, Bike, Package, Users, 
  ZoomIn, ZoomOut, Maximize2, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MapMarker {
  id: string;
  type: "driver" | "rider" | "delivery";
  lat: number;
  lng: number;
  status: "active" | "idle" | "busy";
  heading?: number;
  label: string;
}

export default function LiveMapOverview() {
  const [markers, setMarkers] = useState<MapMarker[]>([
    { id: "d1", type: "driver", lat: 40.7128, lng: -74.0060, status: "active", heading: 45, label: "Driver A" },
    { id: "d2", type: "driver", lat: 40.7180, lng: -74.0100, status: "busy", heading: 180, label: "Driver B" },
    { id: "d3", type: "driver", lat: 40.7080, lng: -74.0020, status: "idle", heading: 90, label: "Driver C" },
    { id: "r1", type: "rider", lat: 40.7150, lng: -74.0080, status: "active", label: "Rider 1" },
    { id: "r2", type: "rider", lat: 40.7100, lng: -74.0050, status: "active", label: "Rider 2" },
    { id: "p1", type: "delivery", lat: 40.7140, lng: -74.0030, status: "busy", label: "Package 1" },
  ]);

  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [zoom, setZoom] = useState(12);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkers(prev => prev.map(marker => ({
        ...marker,
        lat: marker.lat + (Math.random() * 0.002 - 0.001),
        lng: marker.lng + (Math.random() * 0.002 - 0.001),
        heading: marker.heading ? (marker.heading + Math.random() * 20 - 10) % 360 : undefined,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredMarkers = selectedLayer === "all" 
    ? markers 
    : markers.filter(m => m.type === selectedLayer);

  const stats = {
    drivers: markers.filter(m => m.type === "driver").length,
    activeDrivers: markers.filter(m => m.type === "driver" && m.status === "active").length,
    riders: markers.filter(m => m.type === "rider").length,
    deliveries: markers.filter(m => m.type === "delivery").length,
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "driver": return Car;
      case "rider": return Users;
      case "delivery": return Package;
      default: return MapPin;
    }
  };

  const getMarkerColor = (type: string, status: string) => {
    if (status === "busy") return "text-amber-500 bg-amber-500/20";
    if (status === "idle") return "text-muted-foreground bg-muted";
    switch (type) {
      case "driver": return "text-emerald-500 bg-emerald-500/20";
      case "rider": return "text-primary bg-primary/20";
      case "delivery": return "text-orange-500 bg-orange-500/20";
      default: return "text-primary bg-primary/20";
    }
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
                {filteredMarkers.length} active entities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg overflow-hidden">
              {["all", "driver", "rider", "delivery"].map((layer) => (
                <Button
                  key={layer}
                  variant={selectedLayer === layer ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedLayer(layer)}
                  className="rounded-none px-3 capitalize"
                >
                  {layer}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map placeholder with simulated markers */}
        <div className="relative h-[400px] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Simulated road network */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" />
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="white" strokeWidth="2" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="white" strokeWidth="2" />
            <line x1="0" y1="30%" x2="100%" y2="70%" stroke="white" strokeWidth="1" />
          </svg>

          {/* Animated markers */}
          {filteredMarkers.map((marker, index) => {
            const Icon = getMarkerIcon(marker.type);
            const colorClass = getMarkerColor(marker.type, marker.status);
            // Convert lat/lng to approximate screen position
            const x = 20 + (index % 4) * 20 + Math.random() * 10;
            const y = 20 + Math.floor(index / 4) * 30 + Math.random() * 10;
            
            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center",
                  colorClass,
                  marker.status === "active" && "animate-pulse"
                )}>
                  <Icon className="h-5 w-5" style={{ 
                    transform: marker.heading ? `rotate(${marker.heading}deg)` : undefined 
                  }} />
                  {marker.status === "busy" && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                  <Badge variant="secondary" className="text-[10px] py-0">
                    {marker.label}
                  </Badge>
                </div>
              </div>
            );
          })}

          {/* Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(18, z + 1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(8, z - 1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Car className="h-3 w-3 text-emerald-500" />
              {stats.activeDrivers}/{stats.drivers} drivers
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3 w-3 text-primary" />
              {stats.riders} riders
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <Package className="h-3 w-3 text-orange-500" />
              {stats.deliveries} deliveries
            </Badge>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4">
            <Badge variant="secondary">Zoom: {zoom}x</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
