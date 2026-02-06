import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RideBottomNav from "@/components/ride/RideBottomNav";
import RideReceiptModal from "@/components/ride/RideReceiptModal";
import { RideOption } from "@/components/ride/RideCard";

interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  paymentMethod: string;
}

type TripStatus = "on_the_way" | "arrived";

const RideTripPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [tripStatus, setTripStatus] = useState<TripStatus>("on_the_way");
  const [etaMinutes, setEtaMinutes] = useState(state?.ride?.eta || 8);
  const [showReceipt, setShowReceipt] = useState(false);

  // Handle missing state
  useEffect(() => {
    if (!state?.ride) {
      navigate("/ride");
    }
  }, [state, navigate]);

  // Auto-progress to "arrived" after delay
  useEffect(() => {
    if (tripStatus === "on_the_way") {
      const timer = setTimeout(() => {
        setTripStatus("arrived");
        setEtaMinutes(0);
      }, 8000); // 8 seconds for demo

      return () => clearTimeout(timer);
    }
  }, [tripStatus]);

  // Countdown timer for ETA
  useEffect(() => {
    if (tripStatus === "arrived" || etaMinutes <= 0) return;

    const timer = setInterval(() => {
      setEtaMinutes((prev) => Math.max(0, prev - 1));
    }, 1000); // Update every second for demo

    return () => clearInterval(timer);
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
      {/* Static Map Placeholder */}
      <div className="relative h-[45vh] w-full">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
          alt="Map view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />

        {/* Animated Route Line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 20 70 Q 40 50 50 40 Q 60 30 80 25"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* Pickup Marker */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-1/3 left-1/4"
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Destination Marker */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/4 right-1/4"
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Navigation className="w-4 h-4 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Moving Car */}
        <motion.div
          animate={
            tripStatus === "on_the_way"
              ? {
                  left: ["25%", "55%", "70%"],
                  top: ["65%", "45%", "30%"],
                }
              : {}
          }
          transition={{
            duration: 8,
            ease: "easeInOut",
          }}
          className="absolute"
          style={{ left: tripStatus === "arrived" ? "70%" : "25%", top: tripStatus === "arrived" ? "30%" : "65%" }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/40">
            <span className="text-lg">🚗</span>
          </div>
        </motion.div>
      </div>

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
