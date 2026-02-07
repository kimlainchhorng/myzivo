import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RideOption } from "@/components/ride/RideCard";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  paymentMethod: string;
}

// Status messages with timing thresholds (based on progress %)
const statusMessages = [
  { threshold: 0, text: "Contacting nearby drivers...", subtext: "Searching in your area" },
  { threshold: 35, text: "Driver responding...", subtext: "Found a match nearby" },
  { threshold: 80, text: "Driver confirmed!", subtext: "Preparing your ride" },
];

const RideSearchingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as LocationState | null;
  const [progress, setProgress] = useState(0);

  // Try to get state from route or localStorage
  const [state, setState] = useState<LocationState | null>(routeState);

  // Validate localStorage data structure
  const validateRideState = (data: unknown): data is LocationState => {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    if (!d.ride || typeof d.ride !== 'object') return false;
    const ride = d.ride as Record<string, unknown>;
    return (
      typeof ride.id === 'string' &&
      typeof ride.name === 'string' &&
      typeof ride.price === 'number' &&
      !isNaN(ride.price)
    );
  };

  useEffect(() => {
    if (!routeState?.ride) {
      try {
        const stored = localStorage.getItem("zivo_active_ride");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (validateRideState(parsed)) {
            setState(parsed);
            return;
          }
        }
      } catch {}
      navigate("/ride");
    }
  }, [routeState, navigate]);

  // Get current status message based on progress
  const currentStatus = statusMessages.reduce((acc, msg) => {
    if (progress >= msg.threshold) return msg;
    return acc;
  }, statusMessages[0]);

  // Progress animation - 0 to 100 over 6 seconds
  useEffect(() => {
    const duration = 6000; // 6 seconds
    const interval = 60; // Update every 60ms
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

  // Auto-navigate when progress completes
  useEffect(() => {
    if (progress >= 100 && state) {
      const timeout = setTimeout(() => {
        navigate("/ride/driver", { state });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress, navigate, state]);

  if (!state?.ride) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-6">
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
          <p className="font-semibold text-white">{state.ride.name}</p>
          <p className="text-primary font-bold text-lg mt-1">
            ${state.ride.price.toFixed(2)}
          </p>
        </motion.div>

        {/* Cancel Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/ride")}
          className="mt-6 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RideSearchingPage;
