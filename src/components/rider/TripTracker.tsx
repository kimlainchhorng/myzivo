import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, X, Navigation, Clock, DollarSign, Star, Car } from "lucide-react";
import { Trip } from "@/hooks/useTrips";
import { useDriverLocationRealtime } from "@/hooks/useTripRealtime";
import { useUnreadMessageCount } from "@/hooks/useTripChat";
import { supabase } from "@/integrations/supabase/client";
import TripChatModal from "@/components/chat/TripChatModal";

interface TripTrackerProps {
  trip: Trip;
  onCancel?: () => void;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const statusSteps = [
  { status: "requested", label: "Finding driver" },
  { status: "accepted", label: "Driver assigned" },
  { status: "en_route", label: "Driver en route" },
  { status: "arrived", label: "Driver arrived" },
  { status: "in_progress", label: "Trip in progress" },
  { status: "completed", label: "Trip completed" },
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

    // Update marker position smoothly
    if (driverMarker.current && map.current) {
      driverMarker.current.setLngLat([lng, lat]);

      // Calculate ETA to pickup or dropoff
      const targetLat = trip.status === "in_progress" ? trip.dropoff_lat : trip.pickup_lat;
      const targetLng = trip.status === "in_progress" ? trip.dropoff_lng : trip.pickup_lng;

      // Simple distance-based ETA calculation (approx 30 km/h average city speed)
      const distance = Math.sqrt(
        Math.pow((lat - targetLat) * 111, 2) + Math.pow((lng - targetLng) * 111 * Math.cos(lat * Math.PI / 180), 2)
      );
      const etaMinutes = Math.round((distance / 30) * 60);
      setEta(etaMinutes > 0 ? etaMinutes : 1);
    }
  }, [trip.status, trip.pickup_lat, trip.pickup_lng, trip.dropoff_lat, trip.dropoff_lng]);

  // Subscribe to driver location updates
  useDriverLocationRealtime(trip.driver_id || undefined, handleDriverLocationUpdate);

  // Fetch initial driver location
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

  // Initialize map
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

      // Add pickup marker
      const pickupEl = document.createElement("div");
      pickupEl.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `;
      new mapboxgl.Marker(pickupEl)
        .setLngLat([trip.pickup_lng, trip.pickup_lat])
        .addTo(map.current!);

      // Add dropoff marker
      const dropoffEl = document.createElement("div");
      dropoffEl.innerHTML = `
        <div class="w-6 h-6 bg-white rounded-sm shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-gray-900 rounded-sm"></div>
        </div>
      `;
      new mapboxgl.Marker(dropoffEl)
        .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
        .addTo(map.current!);

      // Fit bounds
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

  // Add/update driver marker when location changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !driverLocation) return;

    if (!driverMarker.current) {
      // Create driver marker
      const driverEl = document.createElement("div");
      driverEl.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-primary border-3 border-white shadow-lg flex items-center justify-center animate-pulse">
            <svg class="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-4-8v16"></path>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 -z-10"></div>
        </div>
      `;
      driverEl.className = "driver-marker";

      driverMarker.current = new mapboxgl.Marker(driverEl)
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(map.current);

      // Expand bounds to include driver
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([trip.pickup_lng, trip.pickup_lat]);
      bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
      bounds.extend([driverLocation.lng, driverLocation.lat]);
      map.current.fitBounds(bounds, { padding: 60 });
    } else {
      // Animate marker to new position
      driverMarker.current.setLngLat([driverLocation.lng, driverLocation.lat]);
    }
  }, [driverLocation, mapLoaded, trip.pickup_lat, trip.pickup_lng, trip.dropoff_lat, trip.dropoff_lng]);

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="relative">
        <div ref={mapContainer} className="h-[250px] rounded-xl overflow-hidden" />
        
        {/* ETA Overlay */}
        {eta && driverLocation && isActive && trip.status !== "arrived" && (
          <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
            <p className="text-xs text-muted-foreground">
              {trip.status === "in_progress" ? "Arriving in" : "Driver arriving in"}
            </p>
            <p className="text-lg font-bold">{eta} min</p>
          </div>
        )}

        {/* Live indicator */}
        {driverLocation && isActive && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Trip Status</h3>
            <Badge variant={isActive ? "default" : "secondary"} className="capitalize">
              {trip.status?.replace("_", " ")}
            </Badge>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />
            <div 
              className="absolute left-3 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ height: `${Math.min((currentStepIndex / (statusSteps.length - 1)) * 100, 100)}%` }}
            />
            
            <div className="space-y-4">
              {statusSteps.slice(0, 5).map((step, index) => (
                <div key={step.status} className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    index <= currentStepIndex 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index < currentStepIndex ? (
                      <span className="text-xs">✓</span>
                    ) : index === currentStepIndex ? (
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className={index <= currentStepIndex ? "font-medium" : "text-muted-foreground"}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info (if assigned) */}
      {trip.driver && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Car className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{trip.driver.full_name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span>4.8</span>
                  {driverLocation && (
                    <span className="ml-2 text-green-500">• Location tracking active</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Details */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{trip.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-sm bg-foreground mt-1.5" />
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="text-sm font-medium">{trip.dropoff_address}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-muted-foreground" />
                <span>{trip.distance_km?.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{trip.duration_minutes} min</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>{trip.fare_amount?.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Button (if applicable) */}
      {isActive && trip.status !== "in_progress" && onCancel && (
        <Button variant="outline" className="w-full" onClick={onCancel}>
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
