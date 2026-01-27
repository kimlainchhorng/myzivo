import { Home, Briefcase, Star, MapPin, Sparkles } from "lucide-react";
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

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  home: { 
    bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10", 
    text: "text-blue-500",
    ring: "ring-blue-500/20"
  },
  work: { 
    bg: "bg-gradient-to-br from-amber-500/20 to-amber-600/10", 
    text: "text-amber-500",
    ring: "ring-amber-500/20"
  },
  star: { 
    bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10", 
    text: "text-purple-500",
    ring: "ring-purple-500/20"
  },
  pin: { 
    bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10", 
    text: "text-emerald-500",
    ring: "ring-emerald-500/20"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2.5 px-1">
        <motion.div
          animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-teal-500/10 flex items-center justify-center"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </motion.div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Quick access</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {quickLocations.map((location, index) => {
          const Icon = iconMap[location.icon] || MapPin;
          const colors = colorMap[location.icon] || colorMap.pin;
          
          return (
            <motion.button
              key={location.id}
              initial={{ opacity: 0, x: -15, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.06, 
                type: "spring", 
                stiffness: 350,
                damping: 25 
              }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleClick(location)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all flex-shrink-0 overflow-hidden group",
                "bg-card/90 backdrop-blur-xl border border-white/10",
                "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10",
                "focus:outline-none focus:ring-2 focus:ring-primary/30"
              )}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <motion.div 
                whileHover={{ rotate: 8 }}
                className={cn(
                  "relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                  colors.bg
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", colors.text)} />
                {/* Shine effect */}
                <motion.div
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: "200%", opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4, delay: index * 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 rounded-xl"
                />
              </motion.div>
              <div className="text-left relative z-10">
                <span className="text-sm font-bold whitespace-nowrap block">{location.label}</span>
                <span className="text-[10px] text-muted-foreground truncate block max-w-[100px] font-medium">
                  {location.address.split(',')[0]}
                </span>
              </div>
          </motion.button>
        );
      })}
    </div>
  </motion.div>
  );
};

export default QuickLocationPicker;
