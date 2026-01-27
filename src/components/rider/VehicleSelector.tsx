import { Car, Users, Crown, Truck, Clock, Shield, CheckCircle } from "lucide-react";
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
  const lowestFare = Math.min(...fareEstimates.map(e => e.totalFare));
  const fastestPickup = Math.min(...fareEstimates.map(e => e.estimatedDuration));
  
  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rides to-emerald-400 flex items-center justify-center shadow-md">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Choose your ride</h3>
            <p className="text-xs text-muted-foreground">
              {fareEstimates.length} options
            </p>
          </div>
        </div>
        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-2 py-0.5">
          <Shield className="w-3 h-3 mr-1" />
          Insured
        </Badge>
      </div>
      
      {/* Vehicle Cards - Mobile Optimized */}
      <div className="space-y-2">
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
          
          return (
            <motion.button
              key={estimate.vehicleType}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(estimate.vehicleType)}
              className={cn(
                "w-full p-3 rounded-xl border transition-all relative overflow-hidden",
                isSelected
                  ? `border-primary/50 bg-primary/5 shadow-md`
                  : "border-border/30 bg-card/80"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b rounded-l-xl", colors.gradient)} />
              )}
              
              <div className="flex items-center gap-3">
                {/* Vehicle Icon - Compact */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  isSelected
                    ? `bg-gradient-to-br ${colors.gradient} text-white shadow-md`
                    : "bg-muted/60 text-muted-foreground"
                )}>
                  {vehicleIcons[estimate.vehicleType] || <Car className="w-5 h-5" />}
                </div>
                
                {/* Info - Compact */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold capitalize text-sm">{estimate.vehicleType}</span>
                    
                    {isBestValue && (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0">
                        Best Value
                      </Badge>
                    )}
                    
                    {isFastest && !isBestValue && (
                      <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30 text-[9px] px-1.5 py-0">
                        Fastest
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(estimate.estimatedDuration)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {info.passengers}
                    </span>
                  </div>
                </div>

                {/* Price - Compact */}
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "font-bold text-lg",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    ${estimate.totalFare.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {(estimate.estimatedDistance * 0.621371).toFixed(1)} mi
                  </p>
                </div>
                
                {/* Checkmark */}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Bottom note - Compact */}
      <p className="text-center text-[10px] text-muted-foreground pt-2">
        Prices may vary based on traffic and demand
      </p>
    </div>
  );
};

export default VehicleSelector;
