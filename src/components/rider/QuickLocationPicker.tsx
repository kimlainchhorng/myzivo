import { Home, Briefcase, Star, MapPin, Sparkles, ArrowRight, Zap } from "lucide-react";
import { SavedLocation, useSavedLocations } from "@/hooks/useSavedLocations";
import { Location } from "@/hooks/useRiderBooking";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuickLocationPickerProps {
  userId: string | undefined;
  onSelect: (location: Location) => void;
}

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  work: Briefcase,
  star: Star,
  pin: MapPin,
};

const colorMap: Record<string, { 
  bg: string; 
  text: string; 
  ring: string;
  gradient: string;
  glow: string;
}> = {
  home: { 
    bg: "bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-blue-600/10", 
    text: "text-blue-400",
    ring: "ring-blue-500/30",
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/40"
  },
  work: { 
    bg: "bg-gradient-to-br from-amber-500/25 via-amber-500/15 to-amber-600/10", 
    text: "text-amber-400",
    ring: "ring-amber-500/30",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/40"
  },
  star: { 
    bg: "bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-purple-600/10", 
    text: "text-purple-400",
    ring: "ring-purple-500/30",
    gradient: "from-purple-500 to-violet-500",
    glow: "shadow-purple-500/40"
  },
  pin: { 
    bg: "bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-emerald-600/10", 
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/40"
  },
};

const QuickLocationPicker = ({ userId, onSelect }: QuickLocationPickerProps) => {
  const { data: savedLocations } = useSavedLocations(userId);

  if (!userId || !savedLocations?.length) return null;

  const handleClick = (saved: SavedLocation) => {
    onSelect({
      address: saved.address,
      lat: saved.lat,
      lng: saved.lng,
    });
  };

  // Show up to 4 quick-access locations
  const quickLocations = savedLocations.slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="space-y-4"
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 10, -8, 0], 
              scale: [1, 1.08, 1] 
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.5 }}
            className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary/25 to-teal-500/15 flex items-center justify-center border border-primary/20"
          >
            <Zap className="w-4 h-4 text-primary" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg -z-10" />
          </motion.div>
          <div>
            <span className="text-sm font-bold text-foreground">Quick access</span>
            <p className="text-[10px] text-muted-foreground">Your saved places</p>
          </div>
        </div>
        <motion.div
          whileHover={{ x: 3 }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
        >
          <span className="font-medium">See all</span>
          <ArrowRight className="w-3 h-3" />
        </motion.div>
      </div>

      {/* Location Cards */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
        {quickLocations.map((location, index) => {
          const Icon = iconMap[location.icon] || MapPin;
          const colors = colorMap[location.icon] || colorMap.pin;
          
          return (
            <motion.button
              key={location.id}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.07, 
                type: "spring", 
                stiffness: 320,
                damping: 22 
              }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(location)}
              className={cn(
                "relative flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all flex-shrink-0 overflow-hidden group min-w-[160px]",
                "bg-card/95 backdrop-blur-2xl border border-white/10",
                "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/15",
                "focus:outline-none focus:ring-2 focus:ring-primary/40"
              )}
            >
              {/* Multi-layer background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner accent */}
              <div className={cn(
                "absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                `bg-gradient-to-br ${colors.gradient}`
              )} />
              
              {/* Icon container with enhanced styling */}
              <motion.div 
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className={cn(
                  "relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                  colors.bg,
                  `shadow-lg ${colors.glow}`
                )}
              >
                <Icon className={cn("w-5 h-5", colors.text)} />
                
                {/* Shine sweep effect */}
                <motion.div
                  initial={{ x: "-120%", opacity: 0 }}
                  animate={{ x: "220%", opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 + index * 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 rounded-xl"
                />
                
                {/* Active indicator ring */}
                <div className={cn(
                  "absolute inset-0 rounded-xl ring-2 opacity-0 group-hover:opacity-100 transition-opacity",
                  colors.ring
                )} />
              </motion.div>
              
              {/* Content */}
              <div className="text-left relative z-10 flex-1 min-w-0">
                <span className="text-sm font-bold whitespace-nowrap block text-foreground group-hover:text-primary transition-colors">
                  {location.label}
                </span>
                <span className="text-[11px] text-muted-foreground truncate block max-w-[100px] font-medium mt-0.5">
                  {location.address.split(',')[0]}
                </span>
              </div>
              
              {/* Hover arrow indicator */}
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 0, x: -5 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <ArrowRight className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickLocationPicker;
