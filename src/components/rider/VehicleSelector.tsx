import { Car, Users, Crown, Truck, Clock, Zap, Sparkles, Shield, CheckCircle, Star, Leaf, Bolt, TrendingUp, Award } from "lucide-react";
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
  economy: <Car className="w-7 h-7" />,
  comfort: <Users className="w-7 h-7" />,
  premium: <Crown className="w-7 h-7" />,
  xl: <Truck className="w-7 h-7" />,
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

const vehicleGradients: Record<string, { 
  gradient: string; 
  shadow: string; 
  ring: string;
  bgGlow: string;
  iconBg: string;
}> = {
  economy: {
    gradient: "from-rides via-green-400 to-emerald-400",
    shadow: "shadow-rides/50",
    ring: "ring-rides/40",
    bgGlow: "from-rides/15 to-emerald-500/5",
    iconBg: "from-rides/25 to-green-500/15",
  },
  comfort: {
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    shadow: "shadow-sky-500/50",
    ring: "ring-sky-500/40",
    bgGlow: "from-sky-500/15 to-blue-500/5",
    iconBg: "from-sky-500/25 to-blue-500/15",
  },
  premium: {
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    shadow: "shadow-amber-500/50",
    ring: "ring-amber-500/40",
    bgGlow: "from-amber-500/15 to-orange-500/5",
    iconBg: "from-amber-500/25 to-orange-500/15",
  },
  xl: {
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
    shadow: "shadow-violet-500/50",
    ring: "ring-violet-500/40",
    bgGlow: "from-violet-500/15 to-purple-500/5",
    iconBg: "from-violet-500/25 to-purple-500/15",
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
    <div className="space-y-5">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rides via-green-400 to-emerald-400 flex items-center justify-center shadow-xl shadow-rides/40"
          >
            <Car className="w-7 h-7 text-white drop-shadow-md" />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-rides/30 blur-xl -z-10" />
          </motion.div>
          <div>
            <h3 className="font-bold text-xl text-foreground">Choose your ride</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-primary font-semibold">{fareEstimates.length}</span> options available
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Badge className="text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/30 px-4 py-1.5 font-semibold">
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Insured
          </Badge>
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-emerald-500/30 -z-10"
          />
        </motion.div>
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
              initial={{ opacity: 0, x: -25, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 280, damping: 22 }}
              whileHover={{ scale: 1.015, y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(estimate.vehicleType)}
              className={cn(
                "w-full p-5 rounded-3xl border-2 transition-all relative overflow-hidden group",
                isSelected
                  ? `border-transparent bg-gradient-to-br from-card via-card to-card shadow-2xl ${colors.shadow} ring-2 ${colors.ring}`
                  : "border-border/30 hover:border-border/50 hover:bg-muted/20 bg-card/60 backdrop-blur-xl"
              )}
            >
              {/* Selected indicator line with gradient */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    className={cn("absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b rounded-l-3xl", colors.gradient)}
                    style={{ originY: 0 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Premium background glow */}
              {isPremium && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/8 via-transparent to-amber-500/8 pointer-events-none" />
              )}
              
              {/* Hover shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              
              <div className="flex items-center gap-5 relative z-10">
                {/* Vehicle Icon - Enhanced */}
                <motion.div 
                  whileHover={{ rotate: 8, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className={cn(
                    "w-18 h-18 rounded-2xl flex items-center justify-center transition-all relative",
                    isSelected
                      ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl ${colors.shadow}`
                      : isPremium 
                        ? `bg-gradient-to-br ${colors.iconBg} text-amber-400`
                        : "bg-muted/80 text-muted-foreground group-hover:bg-muted"
                  )}
                  style={{ width: '72px', height: '72px' }}
                >
                  {vehicleIcons[estimate.vehicleType] || <Car className="w-7 h-7" />}
                  
                  {/* Corner sparkle for premium */}
                  {isPremium && !isSelected && (
                    <motion.div
                      animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1.5 -right-1.5"
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </motion.div>
                  )}
                  
                  {/* Eco badge */}
                  {info.eco && (
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/40"
                    >
                      <Leaf className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                  
                  {/* Selection glow */}
                  {isSelected && (
                    <div className={cn("absolute inset-0 rounded-2xl blur-xl -z-10", `bg-gradient-to-br ${colors.gradient} opacity-40`)} />
                  )}
                </motion.div>
                
                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-bold capitalize text-foreground text-lg tracking-tight">{estimate.vehicleType}</span>
                    
                    {isBestValue && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Badge className="bg-gradient-to-r from-emerald-500/15 to-green-500/10 text-emerald-400 border-emerald-500/30 text-[10px] px-2.5 py-0.5 font-bold">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Best Value
                        </Badge>
                      </motion.div>
                    )}
                    
                    {isFastest && !isBestValue && (
                      <Badge className="bg-gradient-to-r from-sky-500/15 to-blue-500/10 text-sky-400 border-sky-500/30 text-[10px] px-2.5 py-0.5 font-bold">
                        <Bolt className="w-3 h-3 mr-1" />
                        Fastest
                      </Badge>
                    )}
                    
                    {estimate.surgeMultiplier > 1 && (
                      <Badge variant="outline" className="text-orange-400 border-orange-500/30 bg-orange-500/10 text-[10px] px-2.5 py-0.5 font-bold">
                        <Zap className="w-3 h-3 mr-1" />
                        {estimate.surgeMultiplier}x
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {info.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-full border border-white/5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-semibold">{Math.round(estimate.estimatedDuration)} min</span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-full border border-white/5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-semibold">{info.passengers}</span>
                    </span>
                  </div>
                </div>

                {/* Price - Enhanced */}
                <div className="text-right shrink-0">
                  <motion.div 
                    key={estimate.totalFare}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <p className={cn(
                      "font-bold text-3xl tracking-tight",
                      isSelected 
                        ? `bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent` 
                        : "text-foreground"
                    )}>
                      <span className="text-lg font-medium text-muted-foreground">$</span>
                      {estimate.totalFare.toFixed(2)}
                    </p>
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {estimate.estimatedDistance.toFixed(1)} km
                  </p>
                </div>
              </div>
              
              {/* Selection checkmark - Enhanced */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={cn(
                      "absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shadow-xl",
                      colors.gradient, colors.shadow
                    )}
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      
      {/* Bottom info - Enhanced */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3 pt-4"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-white/5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>Prices may vary based on traffic and demand</span>
        </div>
      </motion.div>
    </div>
  );
};

export default VehicleSelector;
