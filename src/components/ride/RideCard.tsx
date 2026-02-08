import { motion } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SurgeLevel } from "@/lib/surge";
import { RideQuoteResult } from "@/lib/quoteRidePrice";

export interface RideOption {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  eta: number;
  image: string;
  category: "economy" | "premium" | "elite";
  multiplier: number;
}

interface RideCardProps {
  ride: RideOption;
  isSelected: boolean;
  onSelect: () => void;
  calculatedPrice?: number;
  surgeActive?: boolean;
  surgeMultiplier?: number;
  surgeLevel?: SurgeLevel;
  quote?: RideQuoteResult | null;
  showDebug?: boolean;
  isLoading?: boolean;
}

const RideCard = ({ 
  ride, 
  isSelected, 
  onSelect, 
  calculatedPrice, 
  surgeActive, 
  surgeMultiplier, 
  surgeLevel,
  quote,
  showDebug = false,
  isLoading = false,
}: RideCardProps) => {
  const displayPrice = calculatedPrice ?? ride.price;
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative w-full rounded-2xl overflow-hidden transition-all duration-300",
        "bg-white/5 border backdrop-blur-sm",
        isSelected
          ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20"
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Vehicle Image */}
      <div className="relative h-24 overflow-hidden">
        <img
          src={ride.image}
          alt={ride.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Surge Badge - "Busy time pricing" */}
        {quote?.multipliers?.surge && quote.multipliers.surge > 1.0 && (
          <div className="absolute top-2 left-2 backdrop-blur-sm px-2 py-1 rounded-full bg-amber-500/90 flex items-center gap-1">
            <span className="text-[10px]">🔥</span>
            <span className="text-[10px] font-bold text-white">Busy time pricing ×{quote.multipliers.surge.toFixed(1)}</span>
          </div>
        )}
        
        {/* Event Badge - "Event pricing" */}
        {quote?.multipliers?.event && quote.multipliers.event > 1.0 && (
          <div className={cn(
            "absolute left-2 backdrop-blur-sm px-2 py-1 rounded-full bg-violet-500/90 flex items-center gap-1",
            quote?.multipliers?.surge && quote.multipliers.surge > 1.0 ? "top-8" : "top-2"
          )}>
            <span className="text-[10px]">🎫</span>
            <span className="text-[10px] font-bold text-white">Event pricing</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full">
          {isLoading ? (
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          ) : (
            <span className="text-xs font-bold text-white">${displayPrice.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 text-left">
        <h4 className="font-semibold text-sm text-white truncate">{ride.name}</h4>
        <p className="text-[11px] text-white/50 truncate mb-1">{ride.subtitle}</p>
        <div className="flex items-center gap-1 text-white/60">
          <Clock className="w-3 h-3" />
          <span className="text-[11px]">{ride.eta} min</span>
        </div>
        
        {/* Debug Panel - only shown when ?debug=1 */}
        {showDebug && quote && (
          <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-white/40 space-y-0.5">
            <div className="flex justify-between">
              <span>Zone:</span>
              <span className="text-white/60">{quote.zoneName}</span>
            </div>
            <div className="flex justify-between text-cyan-400">
              <span>Route:</span>
              <span>{quote.miles.toFixed(1)} mi / {quote.minutes} min</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
              <span>Subtotal:</span>
              <span>${quote.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>× Surge:</span>
              <span className={quote.multipliers.surge > 1 ? "text-amber-400" : ""}>{quote.multipliers.surge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>× Event:</span>
              <span className={quote.multipliers.event > 1 ? "text-violet-400" : ""}>{quote.multipliers.event.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>× LongTrip:</span>
              <span className={quote.multipliers.longTrip < 1 ? "text-green-400" : ""}>{quote.multipliers.longTrip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
              <span>× Total:</span>
              <span className={quote.multipliers.combined >= 1.6 ? "text-orange-400" : "text-white/60"}>
                {quote.multipliers.combined.toFixed(2)}{quote.multipliers.combined >= 1.6 ? " (cap)" : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span>+ Insurance:</span>
              <span>${quote.insurance_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>+ Booking:</span>
              <span>${quote.booking_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-white/70 border-t border-white/5 pt-1 mt-1">
              <span>= Final:</span>
              <span>${quote.final.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-white"
          >
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
};

export default RideCard;
