import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, X, Navigation, Clock, DollarSign, Star, Car, Shield, MapPin, UserCheck } from "lucide-react";
import { UnifiedOrderTimeline } from "@/components/shared/UnifiedOrderTimeline";
import { Trip } from "@/hooks/useTrips";
import { useDriverLocationRealtime } from "@/hooks/useTripRealtime";
import { useUnreadMessageCount } from "@/hooks/useTripChat";
import { useDriverProximityAlert } from "@/hooks/useDriverProximityAlert";
import { supabase } from "@/integrations/supabase/client";
import TripChatModal from "@/components/chat/TripChatModal";
import { SafetyCenterSheet } from "@/components/rider/SafetyCenterSheet";
import { cn } from "@/lib/utils";

interface TripTrackerProps {
  trip: Trip;
  onCancel?: () => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const statusSteps = [
  { status: "requested", label: "Finding driver", icon: "🔍", lucideIcon: null },
  { status: "accepted", label: "Driver assigned", icon: null, lucideIcon: UserCheck },
  { status: "en_route", label: "Driver en route", icon: "🚗", lucideIcon: null },
  { status: "arrived", label: "Driver arrived", icon: "📍", lucideIcon: null },
  { status: "in_progress", label: "Trip in progress", icon: "🛣️", lucideIcon: null },
  { status: "completed", label: "Trip completed", icon: "🎉", lucideIcon: null },
];

const TripTracker = ({ trip, onCancel }: TripTrackerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadMessageCount(trip.id, "rider");

  const currentStepIndex = statusSteps.findIndex(s => s.status === trip.status);
  const isActive = ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(trip.status || "");

  // Handle driver location updates
  const handleDriverLocationUpdate = useCallback((lat: number, lng: number) => {
    setDriverLocation({ lat, lng });

    if (driverMarker.current && map.current) {
      driverMarker.current.setLngLat([lng, lat]);

      const targetLat = trip.status === "in_progress" ? trip.dropoff_lat : trip.pickup_lat;
      const targetLng = trip.status === "in_progress" ? trip.dropoff_lng : trip.pickup_lng;

      const distance = Math.sqrt(
        Math.pow((lat - targetLat) * 111, 2) + Math.pow((lng - targetLng) * 111 * Math.cos(lat * Math.PI / 180), 2)
      );
      const etaMinutes = Math.round((distance / 30) * 60);
      setEta(etaMinutes > 0 ? etaMinutes : 1);
    }
  }, [trip.status, trip.pickup_lat, trip.pickup_lng, trip.dropoff_lat, trip.dropoff_lng]);

  useDriverLocationRealtime(trip.driver_id || undefined, handleDriverLocationUpdate);

  // Proximity alert when driver is ~3 minutes away
  useDriverProximityAlert({
    driverLocation,
    targetLocation: { lat: trip.pickup_lat, lng: trip.pickup_lng },
    tripStatus: trip.status,
    etaMinutes: eta,
    alertThresholdMinutes: 3,
  });

  useEffect(() => {
    if (!trip.driver_id) return;

    const fetchDriverLocation = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("current_lat, current_lng")
        .eq("id", trip.driver_id)
        .maybeSingle();

      if (data?.current_lat && data?.current_lng) {
        setDriverLocation({
          lat: Number(data.current_lat),
          lng: Number(data.current_lng),
        });
      }
    };

    fetchDriverLocation();
  }, [trip.driver_id]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [trip.pickup_lng, trip.pickup_lat],
      zoom: 13,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      const pickupEl = document.createElement("div");
      pickupEl.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-green-500 border-3 border-white shadow-lg flex items-center justify-center">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
      `;
      new mapboxgl.Marker(pickupEl)
        .setLngLat([trip.pickup_lng, trip.pickup_lat])
        .addTo(map.current!);

      const dropoffEl = document.createElement("div");
      dropoffEl.innerHTML = `
        <div class="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center">
          <div class="w-2.5 h-2.5 bg-gray-900 rounded-sm"></div>
        </div>
      `;
      new mapboxgl.Marker(dropoffEl)
        .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
        .addTo(map.current!);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([trip.pickup_lng, trip.pickup_lat]);
      bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
      map.current!.fitBounds(bounds, { padding: 60 });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [trip]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !driverLocation) return;

    if (!driverMarker.current) {
      const driverEl = document.createElement("div");
      driverEl.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-primary border-3 border-white shadow-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 -z-10"></div>
        </div>
      `;
      driverEl.className = "driver-marker";

      driverMarker.current = new mapboxgl.Marker(driverEl)
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(map.current);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([trip.pickup_lng, trip.pickup_lat]);
      bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
      bounds.extend([driverLocation.lng, driverLocation.lat]);
      map.current.fitBounds(bounds, { padding: 60 });
    } else {
      driverMarker.current.setLngLat([driverLocation.lng, driverLocation.lat]);
    }
  }, [driverLocation, mapLoaded, trip.pickup_lat, trip.pickup_lng, trip.dropoff_lat, trip.dropoff_lng]);

  return (
    <div className="space-y-3">
      {/* Map with Premium Overlays - Compact */}
      <div className="relative animate-in fade-in zoom-in-95 duration-300">
        <div ref={mapContainer} className="h-[200px] sm:h-[280px] rounded-2xl overflow-hidden ring-1 ring-white/10" />
        
        {/* Premium gradient overlays */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/60 via-background/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background/50 to-transparent" />
        </div>
        
        {/* ETA Overlay - Compact */}
        {eta && driverLocation && isActive && trip.status !== "arrived" && (
          <div className="absolute top-2 left-2 bg-gradient-to-br from-card/98 via-card/95 to-card/90 backdrop-blur-2xl px-3 py-2.5 rounded-xl shadow-xl shadow-black/30 border border-white/10 animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {trip.status === "in_progress" ? "Arriving" : "Driver arriving"}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                {eta}
              </span>
              <span className="text-xs text-muted-foreground font-medium">min</span>
            </div>
          </div>
        )}

        {/* Live indicator - Compact */}
        {driverLocation && isActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/25 to-emerald-500/10 backdrop-blur-2xl px-2.5 py-1.5 rounded-lg shadow-lg border border-emerald-500/30 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Live</span>
          </div>
        )}

        {/* Vehicle & Fare Card - Compact */}
        <div className="absolute bottom-2 left-2 right-2 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-150">
          <div className="flex items-center justify-between bg-gradient-to-r from-card/98 via-card/95 to-card/90 backdrop-blur-2xl rounded-xl px-3 py-2.5 shadow-xl shadow-black/20 border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold">Premium Ride</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "w-1 h-1 rounded-full",
                    trip.driver ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  )} />
                  <p className="text-[10px] text-muted-foreground">{trip.driver ? "Driver assigned" : "Finding driver..."}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                ${trip.fare_amount?.toFixed(2)}
              </p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Total fare</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Progress - Compact */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Trip Status</h3>
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={cn(
                "capitalize px-2 py-0.5 text-[10px]",
                isActive && "bg-primary/20 text-primary border border-primary/30"
              )}
            >
              {trip.status?.replace("_", " ")}
            </Badge>
          </div>
          <UnifiedOrderTimeline
            serviceType="ride"
            viewerRole="customer"
            currentStatus={trip.status}
            timestamps={{
              requested: trip.created_at,
            }}
          />
        </CardContent>
      </Card>

      {/* Driver Info - Compact */}
      {trip.driver && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  {driverLocation && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <span className="text-[7px]">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{trip.driver.full_name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">4.8</span>
                    </div>
                    <span>•</span>
                    <span>500+ trips</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9 transition-all duration-200 hover:scale-105 active:scale-95">
                    <Phone className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="relative rounded-full w-9 h-9 transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trip Details - Compact */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-500/20" />
                <div className="w-0.5 h-6 bg-gradient-to-b from-green-500 to-muted" />
                <div className="w-2.5 h-2.5 rounded-sm bg-foreground ring-2 ring-foreground/20" />
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Pickup</p>
                  <p className="text-xs font-medium mt-0.5 truncate">{trip.pickup_address}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Dropoff</p>
                  <p className="text-xs font-medium mt-0.5 truncate">{trip.dropoff_address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Navigation className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Distance</p>
                  <p className="font-semibold text-[11px]">{((trip.distance_km || 0) * 0.621371).toFixed(1)} mi</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Duration</p>
                  <p className="font-semibold text-[11px]">{trip.duration_minutes} min</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-primary">${trip.fare_amount?.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Banner - Compact */}
      {isActive && (
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent" />
          <div className="relative flex items-center gap-2.5 p-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-500">Safety active</p>
              <p className="text-[10px] text-muted-foreground truncate">Trip monitored • Share with loved ones</p>
            </div>
            <SafetyCenterSheet
              tripId={trip.id}
              tripType="ride"
              trigger={
                <Button variant="ghost" size="sm" className="text-[10px] px-2 h-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 shrink-0">
                  Share
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* Floating Safety Button */}
      {isActive && (
        <div className="fixed bottom-28 right-4 z-40 animate-in fade-in zoom-in-90 duration-300">
          <SafetyCenterSheet
            tripId={trip.id}
            tripType="ride"
            trigger={
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Shield className="w-5 h-5 text-white" />
              </Button>
            }
          />
        </div>
      )}

      {/* Cancel Button - Compact */}
      {isActive && trip.status !== "in_progress" && onCancel && (
        <Button 
          variant="outline" 
          className="w-full h-10 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-200 active:scale-[0.98] text-sm" 
          onClick={onCancel}
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          Cancel Trip
        </Button>
      )}

      {/* Chat Modal */}
      {trip.driver && (
        <TripChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          tripId={trip.id}
          userType="rider"
          otherPartyName={trip.driver.full_name}
          otherPartyAvatar={trip.driver.avatar_url}
        />
      )}
    </div>
  );
};

export default TripTracker;
