import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRideStore, DEFAULT_MOCK_DRIVER } from "@/stores/rideStore";

// Status messages with timing thresholds (based on progress %)
const statusMessages = [
  { threshold: 0, text: "Finding nearby drivers...", subtext: "Searching in your area" },
  { threshold: 40, text: "Sending requests...", subtext: "Contacting available drivers" },
  { threshold: 75, text: "Waiting for driver...", subtext: "Almost there!" },
];

const RideSearchingPage = () => {
  const navigate = useNavigate();
  const { state, assignDriver, cancelRide, setStatus } = useRideStore();
  const [progress, setProgress] = useState(0);

  // Redirect if no active ride
  useEffect(() => {
    if (state.status === 'idle' || !state.rideId) {
      navigate("/ride");
    }
  }, [state.status, state.rideId, navigate]);

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

  // When progress completes, assign driver and navigate
  useEffect(() => {
    if (progress >= 100 && state.status === 'searching') {
      // Assign the mock driver
      assignDriver(DEFAULT_MOCK_DRIVER);
      
      // Brief delay then navigate - status is already 'assigned' from assignDriver
      const timeout = setTimeout(() => {
        navigate("/ride/driver");
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [progress, state.status, assignDriver, navigate]);

  const handleCancel = () => {
    cancelRide();
    navigate("/ride");
  };

  if (state.status === 'idle' || !state.rideId) {
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
          className="mt-6 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RideSearchingPage;
