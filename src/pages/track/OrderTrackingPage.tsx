/**
 * OrderTrackingPage
 * 
 * Customer-facing order tracking with live driver location
 */

import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  MapPin,
  Clock,
  Phone,
  ChevronLeft,
  CheckCircle,
  Circle,
  Truck,
} from "lucide-react";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Status configuration
const STATUS_CONFIG = {
  pending: { label: "Order Placed", icon: Circle, color: "text-yellow-500" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-blue-500" },
  preparing: { label: "Preparing", icon: Clock, color: "text-orange-500" },
  ready_for_pickup: { label: "Ready for Pickup", icon: CheckCircle, color: "text-purple-500" },
  in_progress: { label: "Out for Delivery", icon: Truck, color: "text-primary" },
  completed: { label: "Delivered", icon: CheckCircle, color: "text-green-500" },
  cancelled: { label: "Cancelled", icon: Circle, color: "text-destructive" },
};

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "ready_for_pickup",
  "in_progress",
  "completed",
];

// Dark map styles
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, driverLocation, isLoading, error } = useOrderTracking(orderId);
  const { isLoaded: mapsLoaded } = useGoogleMaps();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const [eta, setEta] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: { lat: 30.4515, lng: -91.1871 },
      zoom: 13,
      styles: DARK_MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
    });
  }, [mapsLoaded]);

  // Update markers when order/driver changes
  useEffect(() => {
    if (!mapRef.current || !order) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    // Pickup marker (restaurant)
    if (order.pickup_lat && order.pickup_lng) {
      const pickupMarker = new google.maps.Marker({
        position: { lat: order.pickup_lat, lng: order.pickup_lng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: order.restaurant_name,
      });
      markersRef.current.set("pickup", pickupMarker);
      bounds.extend({ lat: order.pickup_lat, lng: order.pickup_lng });
      hasPoints = true;
    }

    // Dropoff marker (customer)
    if (order.delivery_lat && order.delivery_lng) {
      const dropoffMarker = new google.maps.Marker({
        position: { lat: order.delivery_lat, lng: order.delivery_lng },
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Delivery Location",
      });
      markersRef.current.set("dropoff", dropoffMarker);
      bounds.extend({ lat: order.delivery_lat, lng: order.delivery_lng });
      hasPoints = true;
    }

    // Driver marker
    if (driverLocation?.driver_lat && driverLocation?.driver_lng) {
      const driverMarker = new google.maps.Marker({
        position: { lat: driverLocation.driver_lat, lng: driverLocation.driver_lng },
        map: mapRef.current,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#8b5cf6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1,
          scale: 1.5,
          anchor: new google.maps.Point(12, 24),
        },
        title: driverLocation.driver_name,
      });
      markersRef.current.set("driver", driverMarker);
      bounds.extend({ lat: driverLocation.driver_lat, lng: driverLocation.driver_lng });
      hasPoints = true;
    }

    // Draw route line
    const routePoints: google.maps.LatLngLiteral[] = [];
    if (order.pickup_lat && order.pickup_lng) {
      routePoints.push({ lat: order.pickup_lat, lng: order.pickup_lng });
    }
    if (order.delivery_lat && order.delivery_lng) {
      routePoints.push({ lat: order.delivery_lat, lng: order.delivery_lng });
    }

    if (routePoints.length >= 2) {
      polylineRef.current = new google.maps.Polyline({
        path: routePoints,
        geodesic: true,
        strokeColor: "#8b5cf6",
        strokeOpacity: 0.6,
        strokeWeight: 3,
      });
      polylineRef.current.setMap(mapRef.current);
    }

    if (hasPoints) {
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [order, driverLocation]);

  // Calculate ETA
  useEffect(() => {
    if (!order) return;

    if (order.status === "completed") {
      setEta("Delivered");
    } else if (order.status === "cancelled") {
      setEta("Cancelled");
    } else if (order.estimated_delivery_at) {
      const estDate = new Date(order.estimated_delivery_at);
      setEta(formatDistanceToNow(estDate, { addSuffix: true }));
    } else if (order.duration_minutes > 0) {
      setEta(`~${order.duration_minutes} min`);
    } else {
      setEta(null);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <p className="text-destructive mb-4">{error || "Order not found"}</p>
        <Button asChild>
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">Track Order</h1>
            <p className="text-xs text-muted-foreground">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          {eta && (
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {eta}
            </Badge>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="w-full h-64 bg-muted" />

      {/* Content */}
      <div className="container py-6 space-y-6">
        {/* Status Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <statusConfig.icon className={cn("h-5 w-5", statusConfig.color)} />
              {statusConfig.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {STATUS_ORDER.slice(0, -1).map((status, index) => (
                <div key={status} className="flex items-center">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      index <= currentStatusIndex
                        ? "bg-primary"
                        : "bg-muted/50"
                    )}
                  />
                  {index < STATUS_ORDER.length - 2 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 mx-1",
                        index < currentStatusIndex
                          ? "bg-primary"
                          : "bg-muted/50"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Placed</span>
              <span>Confirmed</span>
              <span>Ready</span>
              <span>Delivering</span>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        {driverLocation && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={driverLocation.driver_avatar_url || undefined} />
                  <AvatarFallback>
                    {driverLocation.driver_name?.charAt(0) || "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{driverLocation.driver_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {driverLocation.driver_vehicle_type || "Driver"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(driverLocation.last_updated), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-sm text-muted-foreground">
                  {order.restaurant_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.restaurant_address}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Delivery</p>
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address}
                </p>
              </div>
            </div>
            {order.distance_miles > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance</span>
                  <span>{order.distance_miles.toFixed(1)} mi</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Order Placed</span>
              <span className="ml-auto">
                {format(new Date(order.created_at), "h:mm a")}
              </span>
            </div>
            {order.assigned_at && (
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Driver Assigned</span>
                <span className="ml-auto">
                  {format(new Date(order.assigned_at), "h:mm a")}
                </span>
              </div>
            )}
            {order.picked_up_at && (
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Picked Up</span>
                <span className="ml-auto">
                  {format(new Date(order.picked_up_at), "h:mm a")}
                </span>
              </div>
            )}
            {order.delivered_at && (
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Delivered</span>
                <span className="ml-auto">
                  {format(new Date(order.delivered_at), "h:mm a")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderTrackingPage;
