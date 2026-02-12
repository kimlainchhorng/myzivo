import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MessageCircle, X, Star, Clock, Car, Navigation, WifiOff, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RideBottomNav from "@/components/ride/RideBottomNav";
import RideStatusBanner from "@/components/ride/RideStatusBanner";
import { toast } from "sonner";
import DriverMapView from "@/components/ride/DriverMapView";
import { interpolateRoutePosition } from "@/services/googleMaps";
import { useRideStore, DEFAULT_MOCK_DRIVER } from "@/stores/rideStore";
import { useRideRealtime } from "@/hooks/useRideRealtime";
import { useRideStatusNotifications } from "@/hooks/useRideStatusNotifications";
import { useLiveDriverTracking } from "@/hooks/useLiveDriverTracking";
import DemoModeBanner from "@/components/ride/DemoModeBanner";
import PassengerTrustBadge from "@/components/driver/PassengerTrustBadge";
import { cancelRideInDb, updateRideStatusInDb } from "@/lib/supabaseRide";

// Default coordinates for Baton Rouge
const DEFAULT_PICKUP = { lat: 30.4515, lng: -91.1871 };
const DEFAULT_DRIVER_START = { lat: 30.4615, lng: -91.1971 };

const RideDriverPage = () => {
  const navigate = useNavigate();
  const { state, updateEta, setStatus, startTrip, cancelRide } = useRideStore();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isStartingTrip, setIsStartingTrip] = useState(false);

  // Subscribe to realtime updates
  const { isDemoMode } = useRideRealtime({
    tripId: state.tripId,
  });

  // Subscribe to status notifications
  const { activeNotification, showBanner, dismissBanner } = useRideStatusNotifications();

  // Get driver info from store or fallback
  const driver = state.driver || DEFAULT_MOCK_DRIVER;
  const driverId = driver.id;
  
  // Get coordinates from state or use defaults
  const pickupLocation = state.pickupCoords || DEFAULT_PICKUP;
  const routeCoordinates = state.routeCoordinates || [];

  // Use comprehensive live driver tracking
  const {
    driverLocation: liveDriverLocation,
    etaSeconds: liveEtaSeconds,
    distanceToPickup,
    hasArrived: liveHasArrived,
    isConnected,
    isReconnecting,
    formatETA,
  } = useLiveDriverTracking({
    tripId: state.tripId,
    driverId: isDemoMode ? undefined : driverId,
    pickupLocation,
    arrivalThresholdMiles: 0.1,
  });

  // Update store ETA from live tracking
  useEffect(() => {
    if (liveEtaSeconds > 0 && !isDemoMode) {
      updateEta(liveEtaSeconds);
    }
  }, [liveEtaSeconds, updateEta, isDemoMode]);

  // Update status when driver arrives
  useEffect(() => {
    if (liveHasArrived && state.status !== 'arrived' && !isDemoMode) {
      setStatus('arrived');
      toast.success("Driver has arrived!");
    }
  }, [liveHasArrived, state.status, setStatus, isDemoMode]);

  // Redirect if no active ride
  useEffect(() => {
    if (state.status === 'idle' || !state.rideId) {
      navigate("/ride");
    }
  }, [state.status, state.rideId, navigate]);

  // Calculate driver progress based on ETA (300 seconds = 0%, 0 seconds = 100%)
  const driverProgress = Math.min(1, 1 - (state.eta / 300));
  
  // Simulate driver route from a point before pickup
  const driverRouteToPickup: [number, number][] = routeCoordinates.length > 0
    ? routeCoordinates.slice(0, Math.ceil(routeCoordinates.length * 0.3)).reverse()
    : [[DEFAULT_DRIVER_START.lng, DEFAULT_DRIVER_START.lat], [pickupLocation.lng, pickupLocation.lat]];

  // Calculate driver position - use realtime location if available, otherwise interpolate
  const driverLocation = liveDriverLocation 
    ? { lat: liveDriverLocation.lat, lng: liveDriverLocation.lng }
    : interpolateRoutePosition(driverRouteToPickup, driverProgress);

  // ETA countdown timer (fallback for demo mode or when no realtime updates)
  useEffect(() => {
    // Skip countdown if we have realtime driver location (ETA is calculated from distance)
    if (!isDemoMode && driverId && liveDriverLocation) return;
    
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
  }, [state.eta, state.status, updateEta, setStatus, isDemoMode, driverId, liveDriverLocation]);

  // Format ETA for display
  const etaMinutes = Math.ceil(state.eta / 60);
  const hasArrived = state.status === 'arrived' || state.eta === 0 || liveHasArrived;
  const isArrivingSoon = state.eta > 0 && state.eta < 60; // Less than 1 minute

  const handleCall = () => {
    toast.info("Calling driver...", { duration: 2000 });
  };

  const handleMessage = () => {
    toast.info("Opening chat...", { duration: 2000 });
  };

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    
    if (state.tripId) {
      const result = await cancelRideInDb(state.tripId);
      
      if (!result.success && result.error) {
        setIsCancelling(false);
        toast.error("Failed to cancel", {
          description: result.error.userMessage,
        });
        return;
      }
    }
    
    cancelRide();
    toast.error("Ride cancelled");
    navigate("/ride");
  };

  const handleStartTrip = async () => {
    if (isStartingTrip) return;
    setIsStartingTrip(true);
    
    if (state.tripId) {
      const result = await updateRideStatusInDb(state.tripId, "in_trip");
      
      if (!result.success && result.error) {
        setIsStartingTrip(false);
        toast.error("Failed to start trip", {
          description: result.error.userMessage,
        });
        return;
      }
    }
    
    startTrip();
    navigate("/ride/trip");
  };

  if (state.status === 'idle' || !state.rideId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Status Banner */}
      {activeNotification && activeNotification.status === "arrived" && (
        <RideStatusBanner
          status={activeNotification.status}
          message={activeNotification.message}
          subMessage={activeNotification.subMessage}
          isVisible={showBanner}
          onDismiss={dismissBanner}
        />
      )}

      {/* Connection Status */}
      {(!isConnected || isReconnecting) && !isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          {isReconnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="text-sm font-medium text-white">Reconnecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Connection lost</span>
            </>
          )}
        </motion.div>
      )}

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
        <Card className="bg-zinc-900/95 backdrop-blur-xl border-white/10 overflow-hidden">
          {/* Arrival Banner */}
          {hasArrived && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500 text-white text-center py-3 px-4 font-semibold text-base flex items-center justify-center gap-2"
            >
              <Car className="w-5 h-5" />
              <span>Your driver has arrived</span>
            </motion.div>
          )}

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

            {/* Passenger Trust Badge */}
            <PassengerTrustBadge tripId={state.tripId} />

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

            {/* Live Distance Tracking */}
            {!hasArrived && distanceToPickup > 0 && !isDemoMode && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Navigation className="w-4 h-4" />
                <span>{distanceToPickup.toFixed(1)} miles away</span>
                <motion.div
                  className="w-1.5 h-1.5 bg-green-500 rounded-full ml-auto"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs text-green-500">Live</span>
              </div>
            )}

            {/* ETA Display */}
            {!hasArrived && (
              <motion.div
                animate={isArrivingSoon ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.5, repeat: isArrivingSoon ? Infinity : 0, repeatDelay: 1 }}
                className={`flex items-center justify-center gap-3 py-4 rounded-xl border ${
                  isArrivingSoon
                    ? "bg-yellow-500/20 border-yellow-500/40"
                    : "bg-primary/10 border-primary/20"
                }`}
              >
                <Clock className={`w-5 h-5 ${isArrivingSoon ? "text-yellow-400" : "text-primary"}`} />
                <span className={`text-lg font-bold ${isArrivingSoon ? "text-yellow-400" : "text-white"}`}>
                  {isArrivingSoon ? "Arriving now" : `Arriving in ${etaMinutes} min`}
                </span>
              </motion.div>
            )}

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
                disabled={isCancelling}
                className="flex flex-col items-center gap-1 py-4 h-auto border-destructive/50 bg-destructive/10 hover:bg-destructive/20 text-destructive disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                <span className="text-xs">{isCancelling ? "..." : "Cancel"}</span>
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
                  disabled={isStartingTrip}
                  className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 mt-4 disabled:opacity-50"
                >
                  {isStartingTrip ? "Starting..." : "START TRIP"}
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
