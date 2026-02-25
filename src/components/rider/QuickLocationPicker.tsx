import { Home, Briefcase, Star, MapPin, Zap, ChevronRight } from "lucide-react";
import { SavedLocation, useSavedLocations } from "@/hooks/useSavedLocations";
import { Location } from "@/hooks/useRiderBooking";
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
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary/25 to-teal-500/15 flex items-center justify-center border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg -z-10" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground">Quick access</span>
            <p className="text-[10px] text-muted-foreground">Your saved places</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer transition-all hover:translate-x-0.5">
          <span className="font-medium">See all</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Location Cards */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
        {quickLocations.map((location, index) => {
          const Icon = iconMap[location.icon] || MapPin;
          const colors = colorMap[location.icon] || colorMap.pin;
          
          return (
            <button
              key={location.id}
              onClick={() => handleClick(location)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl flex-shrink-0 min-w-[150px]",
                "bg-card/90 border border-white/10",
                "hover:border-primary/40 hover:bg-card",
                "active:scale-[0.97] transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-primary/40"
              )}
            >
              {/* Icon container */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200",
                colors.bg
              )}>
                <Icon className={cn("w-4 h-4", colors.text)} />
              </div>
              
              {/* Content */}
              <div className="text-left flex-1 min-w-0">
                <span className="text-sm font-semibold block text-foreground truncate">
                  {location.label}
                </span>
                <span className="text-[11px] text-muted-foreground truncate block max-w-[90px]">
                  {location.address.split(',')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLocationPicker;
