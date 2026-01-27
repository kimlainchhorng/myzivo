import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Navigation, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Locate,
  Shield,
  User,
  Sparkles
} from "lucide-react";
import { Trip, TripStatus } from "@/hooks/useTrips";
import { useUnreadMessageCount } from "@/hooks/useTripChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import TripChatModal from "@/components/chat/TripChatModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActiveTripPanelProps {
  trip: Trip;
  driverId: string;
  onUpdateStatus: (status: TripStatus) => void;
  isUpdating: boolean;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const statusFlow: { status: TripStatus; label: string; nextLabel: string; icon: React.ElementType }[] = [
  { status: "accepted", label: "Trip Accepted", nextLabel: "Start Navigation", icon: CheckCircle },
  { status: "en_route", label: "En Route to Pickup", nextLabel: "I've Arrived", icon: Navigation },
  { status: "arrived", label: "Waiting for Rider", nextLabel: "Start Trip", icon: User },
  { status: "in_progress", label: "Trip in Progress", nextLabel: "Complete Trip", icon: MapPin },
];

const ActiveTripPanel = ({ trip, driverId, onUpdateStatus, isUpdating }: ActiveTripPanelProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const watchId = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadMessageCount(trip.id, "driver");

  const currentStep = statusFlow.find(s => s.status === trip.status);
  const currentIndex = statusFlow.findIndex(s => s.status === trip.status);

  const getNextStatus = (): TripStatus | null => {
    switch (trip.status) {
      case "accepted": return "en_route";
      case "en_route": return "arrived";
      case "arrived": return "in_progress";
      case "in_progress": return "completed";
      default: return null;
    }
  };

  const getDestination = () => {
    if (["accepted", "en_route", "arrived"].includes(trip.status || "")) {
      return { 
        lat: trip.pickup_lat, 
        lng: trip.pickup_lng, 
        address: trip.pickup_address,
        label: "Pickup"
      };
    }
    return { 
      lat: trip.dropoff_lat, 
      lng: trip.dropoff_lng, 
      address: trip.dropoff_address,
      label: "Dropoff"
    };
  };

  const destination = getDestination();

  // Update driver location in database
  const updateDriverLocation = useCallback(async (lat: number, lng: number) => {
    if (!driverId) return;

    try {
      await supabase
        .from("drivers")
        .update({ current_lat: lat, current_lng: lng })
        .eq("id", driverId);
    } catch (error) {
      console.error("Failed to update driver location:", error);
    }
  }, [driverId]);

  // Start location tracking
  const startLocationTracking = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }

    setIsTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Update database with new location
        updateDriverLocation(latitude, longitude);

        // Update marker on map
        if (driverMarker.current && map.current) {
          driverMarker.current.setLngLat([longitude, latitude]);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get location");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, [updateDriverLocation]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  }, []);

  // Start tracking when trip is active
  useEffect(() => {
    if (["en_route", "in_progress"].includes(trip.status || "")) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [trip.status, startLocationTracking, stopLocationTracking]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [destination.lng, destination.lat],
      zoom: 14,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when trip changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers (except driver marker)
    const markers = document.querySelectorAll('.mapboxgl-marker:not(.driver-marker)');
    markers.forEach(m => m.remove());

    // Add pickup marker
    const pickupEl = document.createElement("div");
    pickupEl.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45"></div>
      </div>
    `;
    new mapboxgl.Marker(pickupEl)
      .setLngLat([trip.pickup_lng, trip.pickup_lat])
      .addTo(map.current);

    // Add dropoff marker
    const dropoffEl = document.createElement("div");
    dropoffEl.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-200">
          <div class="w-4 h-4 bg-gray-900 rounded-sm"></div>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-200"></div>
      </div>
    `;
    new mapboxgl.Marker(dropoffEl)
      .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
      .addTo(map.current);

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([trip.pickup_lng, trip.pickup_lat]);
    bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
    if (currentLocation) {
      bounds.extend([currentLocation.lng, currentLocation.lat]);
    }
    map.current.fitBounds(bounds, { padding: 80 });
  }, [trip, mapLoaded, currentLocation]);

  // Add/update driver marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentLocation) return;

    if (!driverMarker.current) {
      const driverEl = document.createElement("div");
      driverEl.className = "driver-marker";
      driverEl.innerHTML = `
        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-teal-400 border-3 border-white shadow-xl flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-primary to-teal-400 rotate-45 -z-10"></div>
        </div>
      `;

      driverMarker.current = new mapboxgl.Marker(driverEl)
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(map.current);
    } else {
      driverMarker.current.setLngLat([currentLocation.lng, currentLocation.lat]);
    }
  }, [currentLocation, mapLoaded]);

  const handleNextStep = () => {
    const nextStatus = getNextStatus();
    if (nextStatus) {
      onUpdateStatus(nextStatus);
    }
  };

  const openNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="relative h-[40vh] min-h-[280px]">
        <div ref={mapContainer} className="h-full" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        
        {/* Tracking indicator */}
        <AnimatePresence>
          {isTracking && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 flex items-center gap-2 bg-card/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl border border-border/50"
            >
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live tracking</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual location update */}
        {!isTracking && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 shadow-xl rounded-xl"
            onClick={startLocationTracking}
          >
            <Locate className="w-4 h-4 mr-2" />
            Enable tracking
          </Button>
        )}

        {/* ETA Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <Card className="border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    destination.label === "Pickup" 
                      ? "bg-emerald-500/20 text-emerald-500" 
                      : "bg-primary/20 text-primary"
                  )}>
                    {destination.label === "Pickup" ? (
                      <User className="w-6 h-6" />
                    ) : (
                      <MapPin className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{destination.label}</p>
                    <p className="font-semibold truncate max-w-[180px]">{destination.address.split(',')[0]}</p>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  className="rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-lg"
                  onClick={openNavigation}
                >
                  <Navigation className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trip Details */}
      <div className="flex-1 bg-card p-4 space-y-4 overflow-y-auto">
        {/* Progress Steps - Premium */}
        <div className="flex items-center gap-1">
          {statusFlow.map((step, i) => {
            const isActive = i === currentIndex;
            const isComplete = i < currentIndex;
            const StepIcon = step.icon;
            
            return (
              <div key={step.status} className="flex items-center flex-1">
                <motion.div 
                  initial={false}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isComplete ? "bg-emerald-500 text-white" :
                    isActive ? "bg-primary text-white" :
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </motion.div>
                {i < statusFlow.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 mx-1 rounded-full transition-colors",
                    i < currentIndex ? "bg-emerald-500" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Status Label */}
        <div className="flex items-center justify-between">
          <Badge className="bg-primary/10 text-primary border-primary/20 border px-3 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {currentStep?.label || trip.status}
          </Badge>
          <div className="flex items-center gap-1 text-xl font-bold text-emerald-500">
            <DollarSign className="w-5 h-5" />
            {trip.fare_amount?.toFixed(2)}
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{trip.distance_km?.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground font-medium">kilometers</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-muted/30">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{trip.duration_minutes}</p>
              <p className="text-xs text-muted-foreground font-medium">minutes</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Rider */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-2">
            <Phone className="w-4 h-4 mr-2" />
            Call Rider
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl border-2 relative"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
              >
                {unreadCount}
              </motion.span>
            )}
          </Button>
        </div>

        {/* Safety Banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Trip protected</p>
            <p className="text-xs text-muted-foreground">Insurance & safety features active</p>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className={cn(
            "w-full h-14 rounded-2xl font-bold text-base shadow-lg transition-all",
            trip.status === "in_progress" 
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30"
              : "bg-gradient-to-r from-primary to-teal-400 hover:from-primary/90 hover:to-teal-500 shadow-primary/30"
          )}
          size="lg"
          onClick={handleNextStep}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Updating...
            </>
          ) : trip.status === "in_progress" ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Trip
            </>
          ) : (
            <>
              {currentStep?.nextLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Chat Modal */}
        <TripChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          tripId={trip.id}
          userType="driver"
          otherPartyName="Rider"
          otherPartyAvatar={null}
        />
      </div>
    </div>
  );
};

export default ActiveTripPanel;
