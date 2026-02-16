import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RideBottomNav from "@/components/ride/RideBottomNav";
import RideReceiptModal from "@/components/ride/RideReceiptModal";
import RideStatusBanner from "@/components/ride/RideStatusBanner";
import TripMapView from "@/components/ride/TripMapView";
import { interpolateRoutePosition } from "@/services/googleMaps";
import { useRideStore } from "@/stores/rideStore";
import { useRideRealtime } from "@/hooks/useRideRealtime";
import { useRideStatusNotifications } from "@/hooks/useRideStatusNotifications";
import { useDriverLocationRealtime } from "@/hooks/useTripRealtime";
import DemoModeBanner from "@/components/ride/DemoModeBanner";
import { updateRideStatusInDb } from "@/lib/supabaseRide";
import { haversineMiles } from "@/services/mapsApi";
import { toast } from "sonner";

import { DEFAULT_PICKUP_COORDS, DEFAULT_DROPOFF_COORDS } from "@/data/mockLocations";

const DEFAULT_PICKUP = DEFAULT_PICKUP_COORDS;
const DEFAULT_DESTINATION = DEFAULT_DROPOFF_COORDS;

// 100 meters = 0.0621 miles
const ARRIVAL_THRESHOLD_MILES = 0.0621;

const RideTripPage = () => {
  const navigate = useNavigate();
  const { state, updateElapsed, completeRide, clearRide } = useRideStore();
  const [showReceipt, setShowReceipt] = useState(false);
  const [tripProgress, setTripProgress] = useState(0);
  const [isEndingTrip, setIsEndingTrip] = useState(false);
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Subscribe to realtime updates
  const { isDemoMode } = useRideRealtime({
    tripId: state.tripId,
  });

  // Subscribe to status notifications
  const { activeNotification, showBanner, dismissBanner } = useRideStatusNotifications();

  // Redirect if no active ride
  useEffect(() => {
    if (state.status === 'idle' || !state.rideId) {
      navigate("/ride");
    }
  }, [state.status, state.rideId, navigate]);

  // Get coordinates from state or use defaults
  const pickupLocation = state.pickupCoords || DEFAULT_PICKUP;
  const destinationLocation = state.dropoffCoords || DEFAULT_DESTINATION;
  const routeCoordinates = state.routeCoordinates || [];
  const tripDuration = state.duration || 8;

  // Ref to track auto-complete to prevent duplicate calls
  const autoCompleteTriggeredRef = useRef(false);

  // Handle end trip - wrapped in useCallback for dependency tracking
  const handleEndTrip = useCallback(async () => {
    if (isEndingTrip || autoCompleteTriggeredRef.current) return;
    setIsEndingTrip(true);
    autoCompleteTriggeredRef.current = true;
    
    if (state.tripId) {
      const result = await updateRideStatusInDb(state.tripId, "completed");
      
      if (!result.success && result.error) {
        setIsEndingTrip(false);
        autoCompleteTriggeredRef.current = false;
        toast.error("Failed to complete trip", {
          description: result.error.userMessage,
        });
        return;
      }
    }
    
    completeRide();
    setShowReceipt(true);
  }, [isEndingTrip, state.tripId, completeRide]);

  // Driver location update handler - calculates real progress
  const handleDriverLocationUpdate = useCallback((lat: number, lng: number) => {
    setDriverLocation({ lat, lng });
    
    // Calculate total trip distance
    const totalDistance = haversineMiles(
      pickupLocation.lat, pickupLocation.lng,
      destinationLocation.lat, destinationLocation.lng
    );
    
    // Prevent division by zero
    if (totalDistance <= 0) {
      setTripProgress(0);
      return;
    }
    
    // Calculate remaining distance to destination
    const remainingDistance = haversineMiles(
      lat, lng,
      destinationLocation.lat, destinationLocation.lng
    );
    
    // Calculate progress (0 to 1)
    const newProgress = Math.max(0, Math.min(1, 1 - (remainingDistance / totalDistance)));
    setTripProgress(newProgress);
    
    // Auto-complete check - driver within 100m of destination
    if (remainingDistance <= ARRIVAL_THRESHOLD_MILES && !hasAutoCompleted && !autoCompleteTriggeredRef.current) {
      setHasAutoCompleted(true);
      toast.success("You've arrived at your destination!");
      handleEndTrip();
    }
  }, [pickupLocation, destinationLocation, hasAutoCompleted, handleEndTrip]);

  // Subscribe to driver location updates (only if not demo mode and driver ID exists)
  useDriverLocationRealtime(
    isDemoMode ? undefined : state.driver?.id,
    handleDriverLocationUpdate
  );

  // Calculate car position based on progress (use driver location if available, otherwise interpolate)
  const carPosition = driverLocation
    ? driverLocation
    : routeCoordinates.length > 0
      ? interpolateRoutePosition(routeCoordinates, tripProgress)
      : {
          lat: pickupLocation.lat + (destinationLocation.lat - pickupLocation.lat) * tripProgress,
          lng: pickupLocation.lng + (destinationLocation.lng - pickupLocation.lng) * tripProgress,
        };

  // Elapsed time counting up
  const [elapsed, setElapsed] = useState(state.tripElapsed || 0);
  const canEndTrip = elapsed >= 60; // Must wait 60 seconds before ending

  // Elapsed timer
  useEffect(() => {
    if (state.status !== 'in_trip') return;

    const interval = setInterval(() => {
      setElapsed(prev => {
        const newElapsed = prev + 1;
        updateElapsed(newElapsed);
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, updateElapsed]);

  // Fallback: Animate trip progress based on elapsed time (demo mode or no driver tracking)
  useEffect(() => {
    if (isDemoMode || !state.driver?.id) {
      // Simulate trip taking ~2 minutes (120 seconds)
      const simulatedDuration = 120;
      const newProgress = Math.min(1, elapsed / simulatedDuration);
      setTripProgress(newProgress);
    }
  }, [isDemoMode, state.driver?.id, elapsed]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining ETA
  const etaMinutes = Math.max(0, Math.ceil(tripDuration * (1 - tripProgress)));
  const isArrived = tripProgress >= 1;

  // handleEndTrip is defined above via useCallback

  const handleReceiptDone = () => {
    setShowReceipt(false);
    clearRide();
    navigate("/ride");
  };

  if (state.status === 'idle' || !state.rideId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Status Banner for in_trip and completed */}
      {activeNotification && ["in_trip", "completed"].includes(activeNotification.status) && (
        <RideStatusBanner
          status={activeNotification.status}
          message={activeNotification.message}
          subMessage={activeNotification.subMessage}
          isVisible={showBanner}
          onDismiss={dismissBanner}
        />
      )}

      {/* Demo Mode Banner */}
      {isDemoMode && <DemoModeBanner />}
      {/* Mapbox Map View */}
      <TripMapView
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        carPosition={carPosition}
        isArrived={isArrived}
        routeCoordinates={routeCoordinates}
      />

      {/* Trip Status Card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative -mt-8 px-4"
      >
        <Card className="bg-zinc-900/95 backdrop-blur-xl border-white/10">
          <CardContent className="p-5 space-y-4">
            {/* Status Banner */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isArrived ? 'arrived' : 'on_way'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex items-center justify-center gap-3 py-4 rounded-xl border ${
                  isArrived
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-primary/10 border-primary/20"
                }`}
              >
                {!isArrived ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="text-lg font-bold text-white">On the way to destination</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </motion.div>
                    <span className="text-lg font-bold text-green-400">You have arrived!</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Trip Timer */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-lg font-mono font-bold text-white">
                {formatTime(elapsed)}
              </span>
              <span className="text-sm text-white/60">elapsed</span>
            </div>

            {/* Progress Bar */}
            {!isArrived && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Trip Progress</span>
                  <span>{Math.round(tripProgress * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${tripProgress * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            )}

            {/* Destination Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50">Destination</p>
                  <p className="font-medium text-white truncate">{state.destination}</p>
                </div>
              </div>

              {!isArrived && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center justify-center gap-2 text-white/60"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">ETA: {etaMinutes} min</span>
                </motion.div>
              )}
            </div>

            {/* Trip Summary */}
            <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm text-white/60">{state.rideName}</p>
                <p className="text-xs text-white/40">{state.paymentMethod}</p>
              </div>
              <p className="font-bold text-primary text-lg">${state.price.toFixed(2)}</p>
            </div>

            {/* End Trip Button */}
            <Button
              onClick={handleEndTrip}
              disabled={!canEndTrip || isEndingTrip}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isEndingTrip ? 'Completing...' : canEndTrip ? 'END TRIP' : `Wait ${60 - elapsed}s to end trip`}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receipt Modal */}
      <RideReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        tripElapsed={elapsed}
        distance={state.distance}
        price={state.price}
        rideName={state.rideName}
        onDone={handleReceiptDone}
        tripId={state.tripId || undefined}
      />

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideTripPage;
