import { motion, AnimatePresence } from "framer-motion";
import RideCard, { RideOption } from "./RideCard";
import { calculateRidePrice } from "@/lib/tripCalculator";

export interface TripDetails {
  distance: number;
  duration: number;
}

interface RideGridProps {
  rides: RideOption[];
  selectedRideId: string | null;
  onSelectRide: (ride: RideOption) => void;
  tripDetails: TripDetails | null;
  surgeMultiplier?: number;
}

const RideGrid = ({ rides, selectedRideId, onSelectRide, tripDetails, surgeMultiplier = 1.0 }: RideGridProps) => {
  const surgeActive = surgeMultiplier > 1.0;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3"
    >
      <AnimatePresence mode="popLayout">
        {rides.map((ride, index) => {
          const calculatedPrice = tripDetails 
            ? calculateRidePrice(ride.id, tripDetails.distance, tripDetails.duration, surgeMultiplier)
            : undefined;
          
          return (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <RideCard
                ride={ride}
                isSelected={selectedRideId === ride.id}
                onSelect={() => onSelectRide(ride)}
                calculatedPrice={calculatedPrice}
                surgeActive={surgeActive}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default RideGrid;
