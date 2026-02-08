import { motion, AnimatePresence } from "framer-motion";
import RideCard, { RideOption } from "./RideCard";
import { useMultiRideQuotes } from "@/hooks/useRideQuote";
import { SurgeLevel } from "@/lib/surge";

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
  surgeLevel?: SurgeLevel;
  pickupCoords?: { lat: number; lng: number } | null;
}

const RideGrid = ({ 
  rides, 
  selectedRideId, 
  onSelectRide, 
  tripDetails, 
  surgeMultiplier = 1.0, 
  surgeLevel,
  pickupCoords 
}: RideGridProps) => {
  const surgeActive = surgeMultiplier > 1.0;
  
  // Get ride types for multi-quote fetch
  const rideTypes = rides.map(r => r.id);
  
  // Fetch all quotes from Supabase pricing engine
  const { quotes, isLoading } = useMultiRideQuotes({
    rideTypes,
    pickupCoords: pickupCoords || null,
    routeMiles: tripDetails?.distance || null,
    routeMinutes: tripDetails?.duration || null,
    enabled: !!tripDetails && !!pickupCoords,
  });

  // Check for debug mode
  const showDebug = typeof window !== "undefined" && 
    new URLSearchParams(window.location.search).get("debug") === "1";
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3"
    >
      <AnimatePresence mode="popLayout">
        {rides.map((ride, index) => {
          // Get quote from Supabase pricing engine
          const quote = quotes.get(ride.id);
          const calculatedPrice = quote?.final;
          
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
                surgeMultiplier={quote?.multipliers.surge || surgeMultiplier}
                surgeLevel={surgeLevel}
                quote={quote}
                showDebug={showDebug}
                isLoading={isLoading && !quote}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default RideGrid;
