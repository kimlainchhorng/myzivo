/**
 * DispatchLiveMap Component
 * 
 * Real-time map showing online drivers and order locations
 * with interactive assignment capabilities.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  MapPin,
  Truck,
  Package,
  RefreshCw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import { useDispatchDrivers, DispatchDriver } from "@/hooks/useDispatchDrivers";
import { cn } from "@/lib/utils";

interface DispatchLiveMapProps {
  selectedOrderId?: string;
  selectedOrder?: {
    id: string;
    pickup_lat?: number | null;
    pickup_lng?: number | null;
    delivery_lat?: number | null;
    delivery_lng?: number | null;
  } | null;
  onDriverClick?: (driverId: string) => void;
  onAssignDriver?: (driverId: string, orderId: string) => void;
  className?: string;
}

// Default center: Baton Rouge, LA
const DEFAULT_CENTER = { lat: 30.4515, lng: -91.1871 };
const DEFAULT_ZOOM = 12;

// Dark mode map styles
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255763" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
];

export function DispatchLiveMap({
  selectedOrderId,
  selectedOrder,
  onDriverClick,
  onAssignDriver,
  className,
}: DispatchLiveMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const { data: drivers, isLoading: driversLoading, refetch } = useDispatchDrivers(true);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDrivers, setShowDrivers] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      styles: DARK_MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    infoWindowRef.current = new google.maps.InfoWindow();

    return () => {
      mapRef.current = null;
    };
  }, [isLoaded]);

  // Update driver markers
  useEffect(() => {
    if (!mapRef.current || !drivers || !showDrivers) {
      // Clear driver markers if disabled
      markersRef.current.forEach((marker, key) => {
        if (key.startsWith("driver-")) {
          marker.setMap(null);
          markersRef.current.delete(key);
        }
      });
      return;
    }

    const currentDriverIds = new Set<string>();

    drivers.forEach((driver) => {
      if (driver.current_lat == null || driver.current_lng == null) return;

      const markerId = `driver-${driver.id}`;
      currentDriverIds.add(markerId);

      let marker = markersRef.current.get(markerId);

      if (marker) {
        // Update existing marker position
        marker.setPosition({
          lat: driver.current_lat,
          lng: driver.current_lng,
        });
      } else {
        // Create new marker
        marker = new google.maps.Marker({
          position: { lat: driver.current_lat, lng: driver.current_lng },
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: driver.is_online ? "#22c55e" : "#6b7280",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: driver.full_name,
        });

        marker.addListener("click", () => {
          handleDriverMarkerClick(driver);
        });

        markersRef.current.set(markerId, marker);
      }
    });

    // Remove markers for drivers no longer in the list
    markersRef.current.forEach((marker, key) => {
      if (key.startsWith("driver-") && !currentDriverIds.has(key)) {
        marker.setMap(null);
        markersRef.current.delete(key);
      }
    });
  }, [drivers, showDrivers]);

  // Update order markers and route
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear order markers
    markersRef.current.forEach((marker, key) => {
      if (key.startsWith("order-")) {
        marker.setMap(null);
        markersRef.current.delete(key);
      }
    });

    // Clear route polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!showOrders || !selectedOrder) return;

    const { pickup_lat, pickup_lng, delivery_lat, delivery_lng } = selectedOrder;

    // Pickup marker
    if (pickup_lat != null && pickup_lng != null) {
      const pickupMarker = new google.maps.Marker({
        position: { lat: pickup_lat, lng: pickup_lng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Pickup",
      });
      markersRef.current.set("order-pickup", pickupMarker);
    }

    // Dropoff marker
    if (delivery_lat != null && delivery_lng != null) {
      const dropoffMarker = new google.maps.Marker({
        position: { lat: delivery_lat, lng: delivery_lng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Dropoff",
      });
      markersRef.current.set("order-dropoff", dropoffMarker);
    }

    // Draw route line
    if (
      pickup_lat != null &&
      pickup_lng != null &&
      delivery_lat != null &&
      delivery_lng != null
    ) {
      polylineRef.current = new google.maps.Polyline({
        path: [
          { lat: pickup_lat, lng: pickup_lng },
          { lat: delivery_lat, lng: delivery_lng },
        ],
        geodesic: true,
        strokeColor: "#8b5cf6",
        strokeOpacity: 0.8,
        strokeWeight: 3,
      });
      polylineRef.current.setMap(mapRef.current);

      // Fit bounds to show both markers
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: pickup_lat, lng: pickup_lng });
      bounds.extend({ lat: delivery_lat, lng: delivery_lng });
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [selectedOrder, showOrders]);

  const handleDriverMarkerClick = useCallback(
    (driver: DispatchDriver) => {
      if (!mapRef.current || !infoWindowRef.current) return;

      setActiveInfoWindow(driver.id);
      onDriverClick?.(driver.id);

      const content = document.createElement("div");
      content.className = "p-2 min-w-[200px]";

      const nameDiv = document.createElement("div");
      nameDiv.className = "font-semibold text-foreground";
      nameDiv.textContent = driver.full_name;
      content.appendChild(nameDiv);

      const vehicleDiv = document.createElement("div");
      vehicleDiv.className = "text-sm text-muted-foreground";
      vehicleDiv.textContent = driver.vehicle_type;
      content.appendChild(vehicleDiv);

      const statusDiv = document.createElement("div");
      statusDiv.className = "text-xs text-muted-foreground mt-1";
      statusDiv.textContent = driver.activeOrder ? `Active: ${driver.activeOrder.restaurant_name}` : "Available";
      content.appendChild(statusDiv);

      if (selectedOrderId && !driver.activeOrder) {
        const assignBtn = document.createElement("button");
        assignBtn.id = `assign-${driver.id}`;
        assignBtn.className = "mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded";
        assignBtn.textContent = "Assign to Order";
        content.appendChild(assignBtn);
      }

      infoWindowRef.current.setContent(content);
      
      const marker = markersRef.current.get(`driver-${driver.id}`);
      if (marker) {
        infoWindowRef.current.open(mapRef.current, marker);
      }

      // Add click handler for assign button
      setTimeout(() => {
        const assignBtn = document.getElementById(`assign-${driver.id}`);
        if (assignBtn && selectedOrderId) {
          assignBtn.onclick = () => {
            onAssignDriver?.(driver.id, selectedOrderId);
            infoWindowRef.current?.close();
          };
        }
      }, 100);
    },
    [selectedOrderId, onDriverClick, onAssignDriver]
  );

  if (loadError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-destructive">Failed to load map</p>
        </CardContent>
      </Card>
    );
  }

  const onlineCount = drivers?.filter((d) => d.is_online).length ?? 0;

  return (
    <Card className={cn(isExpanded && "fixed inset-4 z-50", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Live Map
          <Badge variant="secondary" className="ml-2">
            {onlineCount} drivers
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Layer toggles */}
        <div className="flex items-center gap-4 px-4 pb-2">
          <div className="flex items-center gap-2">
            <Switch
              id="show-drivers"
              checked={showDrivers}
              onCheckedChange={setShowDrivers}
            />
            <Label htmlFor="show-drivers" className="text-xs flex items-center gap-1">
              <Truck className="h-3 w-3" /> Drivers
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-orders"
              checked={showOrders}
              onCheckedChange={setShowOrders}
            />
            <Label htmlFor="show-orders" className="text-xs flex items-center gap-1">
              <Package className="h-3 w-3" /> Orders
            </Label>
          </div>
        </div>

        {/* Map container */}
        <div
          ref={mapContainerRef}
          className={cn(
            "w-full bg-muted relative",
            isExpanded ? "h-[calc(100vh-12rem)]" : "h-64"
          )}
        >
          {(!isLoaded || driversLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DispatchLiveMap;
