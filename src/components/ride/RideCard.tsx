import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RideOption {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  eta: number;
  image: string;
  category: "economy" | "premium" | "elite";
}

interface RideCardProps {
  ride: RideOption;
  isSelected: boolean;
  onSelect: () => void;
}

const RideCard = ({ ride, isSelected, onSelect }: RideCardProps) => {
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
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-xs font-bold text-white">${ride.price.toFixed(2)}</span>
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
