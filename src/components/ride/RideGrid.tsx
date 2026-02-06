import { motion, AnimatePresence } from "framer-motion";
import RideCard, { RideOption } from "./RideCard";

interface RideGridProps {
  rides: RideOption[];
  selectedRideId: string | null;
  onSelectRide: (ride: RideOption) => void;
}

const RideGrid = ({ rides, selectedRideId, onSelectRide }: RideGridProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3"
    >
      <AnimatePresence mode="popLayout">
        {rides.map((ride, index) => (
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
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default RideGrid;
