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
      <div className="flex items-center gap-2 px-1">
        <motion.div
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </motion.div>
        <span className="text-xs font-semibold text-muted-foreground">Quick access</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {quickLocations.map((location, index) => {
          const Icon = iconMap[location.icon] || MapPin;
          const colors = colorMap[location.icon] || colorMap.pin;
          
          return (
            <motion.button
              key={location.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(location)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all flex-shrink-0",
                "bg-card/80 backdrop-blur-sm border border-border/50",
                "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                colors.bg
              )}>
                <Icon className={cn("w-4 h-4", colors.text)} />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold whitespace-nowrap block">{location.label}</span>
                <span className="text-[10px] text-muted-foreground truncate block max-w-[100px]">
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
