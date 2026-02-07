import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RideOption } from "./RideCard";
import { TripDetails, calculateRidePrice } from "@/lib/tripCalculator";

interface RideStickyCTAProps {
  selectedRide: RideOption | null;
  pickup: string;
  destination: string;
  tripDetails: TripDetails | null;
  onConfirm: () => void;
  surgeMultiplier?: number;
}

const RideStickyCTA = ({ selectedRide, pickup, destination, tripDetails, onConfirm, surgeMultiplier = 1.0 }: RideStickyCTAProps) => {
  const isDisabled = !selectedRide || !pickup.trim() || !destination.trim();
  const needsDestination = selectedRide && (!pickup.trim() || !destination.trim());

  // Calculate dynamic price with surge
  const displayPrice = tripDetails && selectedRide
    ? calculateRidePrice(selectedRide.id, tripDetails.distance, tripDetails.duration, surgeMultiplier)
    : selectedRide?.price || 0;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 md:hidden"
    >
      <motion.button
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        onClick={onConfirm}
        disabled={isDisabled}
        className={cn(
          "w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
          "bg-white/10 backdrop-blur-xl border border-white/10",
          isDisabled
            ? "text-white/40 cursor-not-allowed"
            : "text-white bg-primary border-primary hover:bg-primary/90"
        )}
      >
        {needsDestination ? (
          "ENTER DESTINATION"
        ) : selectedRide ? (
          <>
            SELECT {selectedRide.name.toUpperCase()} (${displayPrice.toFixed(2)})
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          "SELECT A RIDE"
        )}
      </motion.button>
    </motion.div>
  );
};

export default RideStickyCTA;
