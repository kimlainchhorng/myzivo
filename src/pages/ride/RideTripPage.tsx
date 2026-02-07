import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RideBottomNav from "@/components/ride/RideBottomNav";
import RideReceiptModal from "@/components/ride/RideReceiptModal";
import { RideOption } from "@/components/ride/RideCard";
import TripMapView from "@/components/ride/TripMapView";
import { interpolateRoutePosition } from "@/services/googleMaps";
import { TripDetails } from "@/lib/tripCalculator";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  paymentMethod: string;
  tripDetails?: TripDetails;
  routeCoordinates?: [number, number][];
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
}

// Default coordinates for Baton Rouge
const DEFAULT_PICKUP = { lat: 30.4515, lng: -91.1871 };
const DEFAULT_DESTINATION = { lat: 30.4315, lng: -91.1671 };

type TripStatus = "on_the_way" | "arrived";

const RideTripPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as LocationState | null;
  
  // Try to get state from route or localStorage
  const [state, setState] = useState<LocationState | null>(routeState);
  const [tripStatus, setTripStatus] = useState<TripStatus>("on_the_way");
  const [tripProgress, setTripProgress] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Get coordinates from state or use defaults
  const pickupLocation = state?.pickupCoords || DEFAULT_PICKUP;
  const destinationLocation = state?.dropoffCoords || DEFAULT_DESTINATION;
  const routeCoordinates = state?.routeCoordinates || [];
  const tripDuration = state?.tripDetails?.duration || 8;

  // Calculate car position based on progress
  const carPosition = routeCoordinates.length > 0
    ? interpolateRoutePosition(routeCoordinates, tripProgress)
    : {
        lat: pickupLocation.lat + (destinationLocation.lat - pickupLocation.lat) * tripProgress,
        lng: pickupLocation.lng + (destinationLocation.lng - pickupLocation.lng) * tripProgress,
      };

  // Calculate remaining ETA
  const etaMinutes = Math.max(0, Math.ceil(tripDuration * (1 - tripProgress)));

  // Load from localStorage if route state is missing
  useEffect(() => {
    if (!routeState?.ride) {
      try {
        const stored = localStorage.getItem("zivo_active_ride");
        if (stored) {
          const parsed = JSON.parse(stored);
          setState(parsed);
          return;
        }
      } catch {}
      navigate("/ride");
    }
  }, [routeState, navigate]);

  // Animate trip progress
  useEffect(() => {
    if (tripStatus === "arrived") return;

    const interval = setInterval(() => {
      setTripProgress((prev) => {
        const newProgress = prev + 0.015; // Move ~1.5% per interval
        if (newProgress >= 1) {
          clearInterval(interval);
          setTripStatus("arrived");
          return 1;
        }
        return newProgress;
      });
    }, 200); // Update every 200ms for smooth animation

    return () => clearInterval(interval);
  }, [tripStatus]);

  const handleEndTrip = () => {
    setShowReceipt(true);
  };

  const handleReceiptDone = () => {
    setShowReceipt(false);
    navigate("/ride");
  };

  if (!state?.ride) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Mapbox Map View */}
      <TripMapView
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        carPosition={carPosition}
        isArrived={tripStatus === "arrived"}
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
                key={tripStatus}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex items-center justify-center gap-3 py-4 rounded-xl border ${
                  tripStatus === "arrived"
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-primary/10 border-primary/20"
                }`}
              >
                {tripStatus === "on_the_way" ? (
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

            {/* Progress Bar */}
            {tripStatus === "on_the_way" && (
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

              {tripStatus === "on_the_way" && (
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
                <p className="text-sm text-white/60">{state.ride.name}</p>
                <p className="text-xs text-white/40">{state.paymentMethod}</p>
              </div>
              <p className="font-bold text-primary text-lg">${state.ride.price.toFixed(2)}</p>
            </div>

            {/* End Trip Button */}
            <Button
              onClick={handleEndTrip}
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90"
            >
              END TRIP
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receipt Modal */}
      <RideReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        ride={state.ride}
        onDone={handleReceiptDone}
      />

      {/* Bottom Nav */}
      <RideBottomNav />
    </div>
  );
};

export default RideTripPage;
