import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRideStore, DEFAULT_MOCK_DRIVER } from "@/stores/rideStore";
import { useRideRealtime } from "@/hooks/useRideRealtime";
import { useRideStatusNotifications } from "@/hooks/useRideStatusNotifications";
import DemoModeBanner from "@/components/ride/DemoModeBanner";
import ConnectionErrorBanner from "@/components/ride/ConnectionErrorBanner";
import RideStatusBanner from "@/components/ride/RideStatusBanner";
import { cancelRideInDb, fetchTripById } from "@/lib/supabaseRide";
import { NoDriversAvailable } from "@/components/ride/NoDriversAvailable";

const SEARCH_TIMEOUT = 60000; // 60 seconds

// Status messages with timing thresholds (based on progress %)
const statusMessages = [
  { threshold: 0, text: "Finding nearby drivers...", subtext: "Searching in your area" },
  { threshold: 40, text: "Sending requests...", subtext: "Contacting available drivers" },
  { threshold: 75, text: "Waiting for driver...", subtext: "Almost there!" },
];

const RideSearchingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, assignDriver, cancelRide, setStatus, createRide, setTripId } = useRideStore();
  const [progress, setProgress] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Restore state from URL param (returning from payments app)
  useEffect(() => {
    const rideIdFromUrl = searchParams.get("rideId");
    
    if (rideIdFromUrl && (!state.tripId || state.tripId !== rideIdFromUrl)) {
      setIsRestoring(true);
      
      // Try to restore from localStorage first (faster)
      const pendingRide = localStorage.getItem('zivo_pending_ride');
      if (pendingRide) {
        try {
          const parsed = JSON.parse(pendingRide);
          if (parsed.tripId === rideIdFromUrl) {
            // Restore state from localStorage
            createRide({
              pickup: parsed.pickup,
              destination: parsed.destination,
              rideType: parsed.rideType || 'standard',
              rideName: parsed.rideName,
              rideImage: parsed.rideImage || '',
              price: parsed.price,
              distance: parsed.distance || 0,
              duration: parsed.duration || 0,
              paymentMethod: parsed.paymentMethod || 'card',
            });
            setTripId(rideIdFromUrl);
            localStorage.removeItem('zivo_pending_ride');
            setIsRestoring(false);
            console.log("[RideSearching] Restored ride from localStorage:", rideIdFromUrl);
            return;
          }
        } catch (e) {
          console.warn("[RideSearching] Failed to parse pending ride:", e);
        }
      }
      
      // Fallback: fetch from database
      fetchTripById(rideIdFromUrl).then((trip) => {
        if (trip) {
          createRide({
            pickup: trip.pickup_address,
            destination: trip.dropoff_address,
            rideType: trip.ride_type || 'standard',
            rideName: trip.ride_type || 'Standard',
            rideImage: '',
            price: trip.fare_amount || 0,
            distance: (trip.distance_km || 0) / 1.60934, // km to miles
            duration: trip.duration_minutes || 0,
            paymentMethod: 'card',
          });
          setTripId(rideIdFromUrl);
          console.log("[RideSearching] Restored ride from database:", rideIdFromUrl);
        } else {
          toast.error("Could not find ride details");
          navigate("/ride");
        }
        setIsRestoring(false);
      });
    }
  }, [searchParams, state.tripId, createRide, setTripId, navigate]);

  // Subscribe to realtime updates if we have a tripId
  const { isDemoMode, isRealtime, connectionError, isReconnecting, reconnect } = useRideRealtime({
    tripId: state.tripId,
    enableMockFallback: false, // We handle mock in this component
  });

  // Subscribe to status notifications
  const { activeNotification, showBanner, dismissBanner } = useRideStatusNotifications();

  // Redirect if no active ride (only if not restoring)
  useEffect(() => {
    if (isRestoring) return;
    if (state.status === 'idle' || !state.rideId) {
      navigate("/ride");
    }
  }, [state.status, state.rideId, navigate, isRestoring]);

  // Get current status message based on progress
  const currentStatus = statusMessages.reduce((acc, msg) => {
    if (progress >= msg.threshold) return msg;
    return acc;
  }, statusMessages[0]);

  // Progress animation - 0 to 100 over 5 seconds
  useEffect(() => {
    const duration = 5000; // 5 seconds per user request
    const interval = 50;
    const increment = (100 * interval) / duration;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // When progress completes in demo mode, assign mock driver and navigate
  useEffect(() => {
    // Only run mock simulation if NOT using realtime
    if (isRealtime) return;
    
    if (progress >= 100 && state.status === 'searching') {
      // Assign the mock driver
      assignDriver(DEFAULT_MOCK_DRIVER);
      
      // Brief delay then navigate - status is already 'assigned' from assignDriver
      const timeout = setTimeout(() => {
        navigate("/ride/driver");
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [progress, state.status, assignDriver, navigate, isRealtime]);

  // If realtime status changes to assigned, navigate (handled by hook but also here for safety)
  useEffect(() => {
    if (state.status === 'assigned' && state.driver) {
      navigate("/ride/driver");
    }
  }, [state.status, state.driver, navigate]);

  // Timeout for realtime mode - show "no drivers" after 60 seconds
  useEffect(() => {
    if (!isRealtime || state.status !== 'searching') return;
    
    const timer = setTimeout(() => {
      if (state.status === 'searching') {
        setTimedOut(true);
      }
    }, SEARCH_TIMEOUT);
    
    return () => clearTimeout(timer);
  }, [isRealtime, state.status]);

  const handleRetrySearch = () => {
    setIsRetrying(true);
    setTimedOut(false);
    setProgress(0);
    
    // Simulate a new search cycle
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    
    // Cancel in database if we have a tripId
    if (state.tripId) {
      const result = await cancelRideInDb(state.tripId);
      
      if (!result.success && result.error) {
        setIsCancelling(false);
        toast.error("Failed to cancel", {
          description: result.error.userMessage,
        });
        return; // Don't navigate if cancel failed
      }
    }
    
    cancelRide();
    toast.error("Ride cancelled");
    navigate("/ride");
  };

  if (state.status === 'idle' || !state.rideId) {
    return null;
  }

  // Show loading while restoring state from payments redirect
  if (isRestoring) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/60">Resuming your ride...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-6">
      {/* Status Banner */}
      {activeNotification && activeNotification.status === "assigned" && (
        <RideStatusBanner
          status={activeNotification.status}
          message={activeNotification.message}
          subMessage={activeNotification.subMessage}
          isVisible={showBanner}
          onDismiss={dismissBanner}
        />
      )}

      {/* Connection Error Banner */}
      <AnimatePresence>
        {connectionError && (
          <ConnectionErrorBanner
            error={connectionError}
            onRetry={reconnect}
            isRetrying={isReconnecting}
          />
        )}
      </AnimatePresence>

      {/* Demo Mode Banner (only show if no connection error) */}
      {isDemoMode && !connectionError && !timedOut && <DemoModeBanner />}
      
      {/* Timed Out - No Drivers Available */}
      {timedOut ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <NoDriversAvailable
            onRetry={handleRetrySearch}
            onCancel={() => {
              cancelRide();
              navigate("/ride");
            }}
            isRetrying={isRetrying}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          {/* Animated Car Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Car className="w-12 h-12 text-primary" />
            </motion.div>
          </motion.div>

          {/* Heading with animated status */}
          <motion.div
            key={currentStatus.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentStatus.text}
            </h2>
            <p className="text-white/60 text-sm mb-8">
              {currentStatus.subtext}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-2 bg-white/10" />
            <p className="text-sm text-white/50">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Ride Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <p className="text-sm text-white/60">Looking for</p>
            <p className="font-semibold text-white">{state.rideName}</p>
            <p className="text-primary font-bold text-lg mt-1">
              ${state.price.toFixed(2)}
            </p>
          </motion.div>

          {/* Cancel Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleCancel}
            disabled={isCancelling}
            className="mt-6 text-white/50 hover:text-white/80 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default RideSearchingPage;
