// CSS animations used instead of framer-motion for mobile performance
import { MapPin, ChevronDown, Search } from "lucide-react";

interface MobileLocationBarProps {
  address?: string;
  onLocationClick?: () => void;
  onSearchClick?: () => void;
  variant?: "default" | "search";
}

const MobileLocationBar = ({
  address = "Current Location",
  onLocationClick,
  onSearchClick,
  variant = "default"
}: MobileLocationBarProps) => {
  if (variant === "search") {
    return (
      <div className="mx-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50 touch-manipulation active:bg-muted active:scale-[0.98] transition-all"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground text-left flex-1">Where to?</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={onLocationClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/50 border border-border/50 touch-manipulation active:bg-muted active:scale-[0.97] transition-all min-h-[44px]"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium truncate max-w-[200px]">{address}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default MobileLocationBar;
