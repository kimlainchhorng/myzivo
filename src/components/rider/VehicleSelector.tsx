import { Car, Users, Crown, Truck, Clock, Zap, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { FareEstimate } from "@/hooks/useRiderBooking";
import { motion } from "framer-motion";
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

const vehicleInfo: Record<string, { description: string; passengers: string; features: string[] }> = {
  economy: { 
    description: "Affordable everyday rides", 
    passengers: "1-4",
    features: ["Best value", "Quick pickup"]
  },
  comfort: { 
    description: "Extra legroom & newer cars", 
    passengers: "1-4",
    features: ["Newer cars", "Top drivers"]
  },
  premium: { 
    description: "Luxury vehicles & top service", 
    passengers: "1-4",
    features: ["Luxury cars", "Premium service"]
  },
  xl: { 
    description: "Spacious rides for groups", 
    passengers: "1-6",
    features: ["Extra space", "Group friendly"]
  },
};

const VehicleSelector = ({
  fareEstimates,
  selectedVehicle,
  onSelect,
}: VehicleSelectorProps) => {
  // Find lowest fare for "Best Value" badge
  const lowestFare = Math.min(...fareEstimates.map(e => e.totalFare));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          Choose your ride
        </h3>
        <Badge variant="outline" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          All rides insured
        </Badge>
      </div>
      
      <div className="space-y-3">
        {fareEstimates.map((estimate, index) => {
          const info = vehicleInfo[estimate.vehicleType] || { 
            description: "Standard ride", 
            passengers: "1-4",
            features: []
          };
          const isSelected = selectedVehicle === estimate.vehicleType;
          const isBestValue = estimate.totalFare === lowestFare && fareEstimates.length > 1;
          const isPremium = estimate.vehicleType === 'premium';
          
          return (
            <motion.button
              key={estimate.vehicleType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(estimate.vehicleType)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                isSelected
                  ? "border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/10"
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/30 bg-card/50 backdrop-blur-sm"
              )}
            >
              {/* Premium glow effect */}
              {isPremium && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                {/* Vehicle Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-all relative",
                  isSelected
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
                    : isPremium 
                      ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500"
                      : "bg-muted text-muted-foreground"
                )}>
                  {vehicleIcons[estimate.vehicleType] || <Car className="w-6 h-6" />}
                  {isPremium && !isSelected && (
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-500" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold capitalize text-foreground">{estimate.vehicleType}</span>
                    
                    {isBestValue && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs px-1.5 py-0">
                        Best Value
                      </Badge>
                    )}
                    
                    {estimate.surgeMultiplier > 1 && (
                      <Badge variant="outline" className="text-orange-500 border-orange-500/30 bg-orange-500/10 text-xs px-1.5 py-0">
                        <Zap className="w-3 h-3 mr-0.5" />
                        {estimate.surgeMultiplier}x
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {info.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(estimate.estimatedDuration)} min
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {info.passengers}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    "font-bold text-xl",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    ${estimate.totalFare.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {estimate.estimatedDistance.toFixed(1)} km
                  </p>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Bottom info */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-center text-muted-foreground pt-2"
      >
        Prices may vary based on traffic and demand
      </motion.p>
    </div>
  );
};

export default VehicleSelector;
