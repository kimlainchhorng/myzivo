import { Car, Users, Crown, Truck, Clock, Zap, Sparkles, Shield, CheckCircle, Star, Leaf, Bolt } from "lucide-react";
import { cn } from "@/lib/utils";
import { FareEstimate } from "@/hooks/useRiderBooking";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface VehicleSelectorProps {
  fareEstimates: FareEstimate[];
  selectedVehicle: string | null;
  onSelect: (vehicleType: string) => void;
}

const vehicleIcons: Record<string, React.ReactNode> = {
  economy: <Car className="w-6 h-6" />,
  comfort: <Users className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
  xl: <Truck className="w-6 h-6" />,
};

const vehicleInfo: Record<string, { 
  description: string; 
  passengers: string; 
  features: string[];
  highlight?: string;
  eco?: boolean;
}> = {
  economy: { 
    description: "Affordable everyday rides", 
    passengers: "1-4",
    features: ["Best value", "Quick pickup"],
    highlight: "Most Popular",
  },
  comfort: { 
    description: "Extra legroom & newer cars", 
    passengers: "1-4",
    features: ["Newer cars", "Top drivers"],
    eco: true,
  },
  premium: { 
    description: "Luxury vehicles & top service", 
    passengers: "1-4",
    features: ["Luxury cars", "Premium service"],
    highlight: "Premium",
  },
  xl: { 
    description: "Spacious rides for groups", 
    passengers: "1-6",
    features: ["Extra space", "Group friendly"],
  },
};

const vehicleGradients: Record<string, { gradient: string; shadow: string; ring: string }> = {
  economy: {
    gradient: "from-rides to-green-400",
    shadow: "shadow-rides/40",
    ring: "ring-rides/30",
  },
  comfort: {
    gradient: "from-sky-500 to-blue-500",
    shadow: "shadow-sky-500/40",
    ring: "ring-sky-500/30",
  },
  premium: {
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/40",
    ring: "ring-amber-500/30",
  },
  xl: {
    gradient: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/40",
    ring: "ring-violet-500/30",
  },
};

const VehicleSelector = ({
  fareEstimates,
  selectedVehicle,
  onSelect,
}: VehicleSelectorProps) => {
  // Find lowest fare for "Best Value" badge
  const lowestFare = Math.min(...fareEstimates.map(e => e.totalFare));
  const fastestPickup = Math.min(...fareEstimates.map(e => e.estimatedDuration));
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-rides to-green-400 flex items-center justify-center shadow-lg shadow-rides/30"
          >
            <Car className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Choose your ride</h3>
            <p className="text-xs text-muted-foreground">{fareEstimates.length} options available</p>
          </div>
        </div>
        <Badge className="text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/30 px-3 py-1">
          <Shield className="w-3 h-3 mr-1" />
          Insured
        </Badge>
      </motion.div>
      
      {/* Vehicle Cards */}
      <div className="space-y-3">
        {fareEstimates.map((estimate, index) => {
          const info = vehicleInfo[estimate.vehicleType] || { 
            description: "Standard ride", 
            passengers: "1-4",
            features: []
          };
          const colors = vehicleGradients[estimate.vehicleType] || vehicleGradients.economy;
          const isSelected = selectedVehicle === estimate.vehicleType;
          const isBestValue = estimate.totalFare === lowestFare && fareEstimates.length > 1;
          const isFastest = estimate.estimatedDuration === fastestPickup && fareEstimates.length > 1;
          const isPremium = estimate.vehicleType === 'premium';
          
          return (
            <motion.button
              key={estimate.vehicleType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(estimate.vehicleType)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all relative overflow-hidden group",
                isSelected
                  ? `border-transparent bg-gradient-to-br from-card via-card to-card shadow-xl ${colors.shadow} ring-2 ${colors.ring}`
                  : "border-border/30 hover:border-border/60 hover:bg-muted/20 bg-card/50 backdrop-blur-sm"
              )}
            >
              {/* Selected indicator line */}
              {isSelected && (
                <motion.div 
                  layoutId="selectedVehicle"
                  className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b rounded-l-2xl", colors.gradient)}
                />
              )}
              
              {/* Premium glow effect */}
              {isPremium && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                {/* Vehicle Icon */}
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative shadow-lg",
                    isSelected
                      ? `bg-gradient-to-br ${colors.gradient} text-white ${colors.shadow}`
                      : isPremium 
                        ? "bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-amber-500"
                        : "bg-muted/80 text-muted-foreground group-hover:bg-muted"
                  )}
                >
                  {vehicleIcons[estimate.vehicleType] || <Car className="w-6 h-6" />}
                  
                  {/* Corner badge for premium */}
                  {isPremium && !isSelected && (
                    <motion.div
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </motion.div>
                  )}
                  
                  {/* Eco badge */}
                  {info.eco && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                      <Leaf className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.div>
                
                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold capitalize text-foreground text-lg">{estimate.vehicleType}</span>
                    
                    {isBestValue && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-2 py-0 font-bold">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                        Best Value
                      </Badge>
                    )}
                    
                    {isFastest && !isBestValue && (
                      <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px] px-2 py-0 font-bold">
                        <Bolt className="w-2.5 h-2.5 mr-0.5" />
                        Fastest
                      </Badge>
                    )}
                    
                    {estimate.surgeMultiplier > 1 && (
                      <Badge variant="outline" className="text-orange-500 border-orange-500/30 bg-orange-500/10 text-[10px] px-2 py-0">
                        <Zap className="w-2.5 h-2.5 mr-0.5" />
                        {estimate.surgeMultiplier}x
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {info.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{Math.round(estimate.estimatedDuration)} min</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{info.passengers}</span>
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <motion.p 
                    key={estimate.totalFare}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "font-bold text-2xl",
                      isSelected ? "text-foreground" : "text-foreground"
                    )}
                  >
                    <span className="text-base font-normal text-muted-foreground">$</span>
                    {estimate.totalFare.toFixed(2)}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">
                    {estimate.estimatedDistance.toFixed(1)} km
                  </p>
                </div>
              </div>
              
              {/* Selection checkmark */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={cn(
                      "absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
                      colors.gradient, colors.shadow
                    )}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      
      {/* Bottom info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 pt-3"
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Prices may vary based on traffic and demand</span>
        </div>
      </motion.div>
    </div>
  );
};

export default VehicleSelector;
