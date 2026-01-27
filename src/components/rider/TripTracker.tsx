import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, X, Navigation, Clock, DollarSign, Star, Car, Shield, MapPin } from "lucide-react";
import { Trip } from "@/hooks/useTrips";
import { useDriverLocationRealtime } from "@/hooks/useTripRealtime";
import { useUnreadMessageCount } from "@/hooks/useTripChat";
import { supabase } from "@/integrations/supabase/client";
import TripChatModal from "@/components/chat/TripChatModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TripTrackerProps {
  trip: Trip;
  onCancel?: () => void;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const statusSteps = [
  { status: "requested", label: "Finding driver", icon: "🔍" },
  { status: "accepted", label: "Driver assigned", icon: "✅" },
  { status: "en_route", label: "Driver en route", icon: "🚗" },
  { status: "arrived", label: "Driver arrived", icon: "📍" },
  { status: "in_progress", label: "Trip in progress", icon: "🛣️" },
  { status: "completed", label: "Trip completed", icon: "🎉" },
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
    <div className="space-y-4">
      {/* Map with Premium Overlays */}
      <div className="relative">
        <div ref={mapContainer} className="h-[280px] rounded-2xl overflow-hidden" />
        
        {/* ETA Overlay */}
        <AnimatePresence>
          {eta && driverLocation && isActive && trip.status !== "arrived" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 bg-card/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border/50"
            >
              <p className="text-xs text-muted-foreground font-medium">
                {trip.status === "in_progress" ? "Arriving in" : "Driver arriving"}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{eta}</span>
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live indicator */}
        {driverLocation && isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/95 backdrop-blur-md px-3 py-2 rounded-full shadow-xl border border-border/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold">Live</span>
          </div>
        )}
      </div>

      {/* Status Progress - Enhanced */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg">Trip Status</h3>
            <Badge 
              variant={isActive ? "default" : "secondary"} 
              className={cn(
                "capitalize px-3 py-1",
                isActive && "bg-primary/20 text-primary border border-primary/30"
              )}
            >
              {trip.status?.replace("_", " ")}
            </Badge>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-muted" />
            <motion.div 
              className="absolute left-[15px] top-0 w-0.5 bg-primary"
              initial={{ height: 0 }}
              animate={{ height: `${Math.min((currentStepIndex / (statusSteps.length - 1)) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            
            <div className="space-y-4">
              {statusSteps.slice(0, 5).map((step, index) => (
                <motion.div 
                  key={step.status} 
                  className="flex items-center gap-4 relative"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300",
                    index < currentStepIndex 
                      ? "bg-primary text-primary-foreground" 
                      : index === currentStepIndex
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {index < currentStepIndex ? (
                      <span className="text-sm">✓</span>
                    ) : index === currentStepIndex ? (
                      <span className="text-sm animate-pulse">{step.icon}</span>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "font-medium transition-colors",
                    index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info - Enhanced */}
      {trip.driver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  {driverLocation && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <span className="text-[8px]">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{trip.driver.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">4.8</span>
                    </div>
                    <span>•</span>
                    <span>500+ trips</span>
                  </div>
                  {driverLocation && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-green-500 font-medium">Tracking active</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full w-11 h-11">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="relative rounded-full w-11 h-11"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Trip Details - Enhanced */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-muted" />
                <div className="w-3 h-3 rounded-sm bg-foreground ring-4 ring-foreground/20" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pickup</p>
                  <p className="text-sm font-medium mt-0.5">{trip.pickup_address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Dropoff</p>
                  <p className="text-sm font-medium mt-0.5">{trip.dropoff_address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-semibold">{trip.distance_km?.toFixed(1)} km</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{trip.duration_minutes} min</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Fare</p>
              <p className="text-2xl font-bold text-primary">${trip.fare_amount?.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Banner */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20"
        >
          <Shield className="w-5 h-5 text-green-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-500">Safety features active</p>
            <p className="text-xs text-muted-foreground">Trip is being monitored for your safety</p>
          </div>
        </motion.div>
      )}

      {/* Cancel Button */}
      {isActive && trip.status !== "in_progress" && onCancel && (
        <Button variant="outline" className="w-full h-12" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
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
