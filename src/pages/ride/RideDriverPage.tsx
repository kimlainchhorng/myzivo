import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MessageCircle, X, Star, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RideBottomNav from "@/components/ride/RideBottomNav";
import { toast } from "sonner";
import DriverMapView from "@/components/ride/DriverMapView";
import { interpolateRoutePosition } from "@/services/googleMaps";
import { useRideStore, DEFAULT_MOCK_DRIVER } from "@/stores/rideStore";
import { useRideRealtime } from "@/hooks/useRideRealtime";
import DemoModeBanner from "@/components/ride/DemoModeBanner";
import { cancelRideInDb, updateRideStatusInDb } from "@/lib/supabaseRide";

// Default coordinates for Baton Rouge
const DEFAULT_PICKUP = { lat: 30.4515, lng: -91.1871 };
const DEFAULT_DRIVER_START = { lat: 30.4615, lng: -91.1971 };

const RideDriverPage = () => {
  const navigate = useNavigate();
  const { state, updateEta, setStatus, startTrip, cancelRide } = useRideStore();

  // Subscribe to realtime updates
  const { isDemoMode } = useRideRealtime({
    tripId: state.tripId,
  });

  // Redirect if no active ride
  useEffect(() => {
    if (state.status === 'idle' || !state.rideId) {
      navigate("/ride");
    }
  }, [state.status, state.rideId, navigate]);

  // Get driver info from store or fallback
  const driver = state.driver || DEFAULT_MOCK_DRIVER;
  
  // Get coordinates from state or use defaults
  const pickupLocation = state.pickupCoords || DEFAULT_PICKUP;
  const routeCoordinates = state.routeCoordinates || [];
  
  // Calculate driver progress based on ETA (300 seconds = 0%, 0 seconds = 100%)
  const driverProgress = Math.min(1, 1 - (state.eta / 300));
  
  // Simulate driver route from a point before pickup
  const driverRouteToPickup: [number, number][] = routeCoordinates.length > 0
    ? routeCoordinates.slice(0, Math.ceil(routeCoordinates.length * 0.3)).reverse()
    : [[DEFAULT_DRIVER_START.lng, DEFAULT_DRIVER_START.lat], [pickupLocation.lng, pickupLocation.lat]];

  // Calculate driver position based on progress
  const driverLocation = interpolateRoutePosition(driverRouteToPickup, driverProgress);

  // ETA countdown timer (from 300 seconds = 5 min)
  useEffect(() => {
    if (state.eta <= 0 || state.status === 'arrived') return;

    const interval = setInterval(() => {
      const newEta = Math.max(0, state.eta - 1);
      updateEta(newEta);

      if (newEta === 0) {
        setStatus('arrived');
        toast.success("Driver has arrived!");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.eta, state.status, updateEta, setStatus]);

  // Format ETA for display
  const etaMinutes = Math.ceil(state.eta / 60);
  const hasArrived = state.status === 'arrived' || state.eta === 0;

  const handleCall = () => {
    toast.info("Calling driver...", { duration: 2000 });
  };

  const handleMessage = () => {
    toast.info("Opening chat...", { duration: 2000 });
  };

  const handleCancel = async () => {
    if (state.tripId) {
      await cancelRideInDb(state.tripId);
    }
    cancelRide();
    toast.error("Ride cancelled");
    navigate("/ride");
  };

  const handleStartTrip = async () => {
    if (state.tripId) {
      await updateRideStatusInDb(state.tripId, "in_trip");
    }
    startTrip();
    navigate("/ride/trip");
  };

  if (state.status === 'idle' || !state.rideId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Demo Mode Banner */}
      {isDemoMode && <DemoModeBanner />}

      {/* Mapbox Map Background */}
      <DriverMapView 
        pickupLocation={pickupLocation} 
        driverLocation={driverLocation}
        hasArrived={hasArrived}
        routeCoordinates={driverRouteToPickup}
      />

      {/* Driver Card Bottom Sheet */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative -mt-6 px-4"
      >
        <Card className="bg-zinc-900/95 backdrop-blur-xl border-white/10">
          <CardContent className="p-4 space-y-4">
            {/* Driver Info Row */}
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-primary">
                <AvatarImage src={driver.avatar} alt={driver.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {driver.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{driver.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{driver.rating}</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{(driver.trips || 0).toLocaleString()} trips</span>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm text-white/60">Vehicle</p>
                <p className="font-semibold text-white">{driver.car}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Plate</p>
                <p className="font-mono font-bold text-primary">{driver.plate}</p>
              </div>
            </div>

            {/* ETA Display */}
            <motion.div
              animate={hasArrived ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5, repeat: hasArrived ? Infinity : 0, repeatDelay: 1 }}
              className={`flex items-center justify-center gap-3 py-4 rounded-xl border ${
                hasArrived
                  ? "bg-green-500/20 border-green-500/40"
                  : "bg-primary/10 border-primary/20"
              }`}
            >
              <Clock className={`w-5 h-5 ${hasArrived ? "text-green-400" : "text-primary"}`} />
              <span className={`text-lg font-bold ${hasArrived ? "text-green-400" : "text-white"}`}>
                {hasArrived ? "Driver has arrived!" : `Arriving in ${etaMinutes} min`}
              </span>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleCall}
                className="flex flex-col items-center gap-1 py-4 h-auto border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs">Call</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleMessage}
                className="flex flex-col items-center gap-1 py-4 h-auto border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-xs">Message</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex flex-col items-center gap-1 py-4 h-auto border-destructive/50 bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <X className="w-5 h-5" />
                <span className="text-xs">Cancel</span>
              </Button>
            </div>

            {/* Trip Summary */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">{state.rideName}</span>
                <span className="font-bold text-primary">${state.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Start Trip Button - only shows when driver has arrived */}
            {hasArrived && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleStartTrip}
                  className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 mt-4"
                >
                  START TRIP
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideDriverPage;
