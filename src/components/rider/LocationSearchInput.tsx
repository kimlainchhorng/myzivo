import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2, Building2, Star, Sparkles, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocationSearch, Location } from "@/hooks/useRiderBooking";
import { motion, AnimatePresence } from "framer-motion";

interface LocationSearchInputProps {
  placeholder: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  icon?: "pickup" | "dropoff";
  className?: string;
}

const LocationSearchInput = ({
  placeholder,
  value,
  onChange,
  icon = "pickup",
  className,
}: LocationSearchInputProps) => {
  const [query, setQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { searchLocations, isSearching } = useLocationSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value?.address && query !== value.address) {
      setQuery(value.address);
    }
  }, [value?.address]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (newQuery.length >= 3) {
        const results = await searchLocations(newQuery);
        setSuggestions(results);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  };

  const handleSelect = (location: Location) => {
    setQuery(location.address);
    onChange(location);
    setSuggestions([]);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0) setIsOpen(true);
  };

  // Get icon for location type (simulated based on address content)
  const getLocationIcon = (address: string) => {
    const lowerAddress = address.toLowerCase();
    if (lowerAddress.includes("airport") || lowerAddress.includes("terminal")) {
      return <Navigation className="w-4 h-4" />;
    }
    if (lowerAddress.includes("hotel") || lowerAddress.includes("building") || lowerAddress.includes("tower")) {
      return <Building2 className="w-4 h-4" />;
    }
    if (lowerAddress.includes("home") || lowerAddress.includes("house")) {
      return <Star className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  const isPickup = icon === "pickup";

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <motion.div 
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && `ring-2 shadow-xl ${isPickup ? 'ring-emerald-500/40 shadow-emerald-500/15' : 'ring-primary/40 shadow-primary/15'}`
        )}
        animate={{ scale: isFocused ? 1.01 : 1 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 350 }}
      >
        {/* Icon indicator with enhanced styling */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          {isPickup ? (
            <motion.div 
              className={cn(
                "relative w-5 h-5 rounded-full transition-all",
                isFocused 
                  ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/60" 
                  : "bg-emerald-500"
              )}
              animate={{ scale: isFocused ? 1.2 : 1 }}
            >
              {/* Inner dot */}
              <div className="absolute inset-1 bg-white rounded-full" />
              
              {/* Ping animation */}
              {isFocused && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-emerald-400"
                />
              )}
            </motion.div>
          ) : (
            <motion.div 
              className={cn(
                "relative w-5 h-5 rounded-md transition-all",
                isFocused 
                  ? "bg-gradient-to-br from-primary to-teal-500 shadow-lg shadow-primary/60" 
                  : "bg-foreground"
              )}
              animate={{ scale: isFocused ? 1.2 : 1, rotate: isFocused ? 45 : 0 }}
            >
              {/* Inner dot */}
              <div className="absolute inset-1 bg-white rounded-sm" />
              
              {/* Ping animation */}
              {isFocused && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-0 rounded-md bg-primary"
                />
              )}
            </motion.div>
          )}
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={cn(
            "pl-14 pr-14 h-16 rounded-2xl border-2 transition-all duration-300 bg-card/90 backdrop-blur-xl text-base font-medium",
            isFocused 
              ? isPickup 
                ? "border-emerald-500/50 bg-card shadow-inner" 
                : "border-primary/50 bg-card shadow-inner"
              : "border-white/10 hover:border-white/20",
            value && (isPickup ? "border-emerald-500/40 bg-emerald-500/5" : "border-primary/40 bg-primary/5")
          )}
        />
        
        {/* Right side indicator with enhanced animations */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center",
                  isPickup ? "bg-emerald-500/15" : "bg-primary/15"
                )}
              >
                <Loader2 className={cn("w-5 h-5 animate-spin", isPickup ? "text-emerald-500" : "text-primary")} />
              </motion.div>
            ) : value ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                  isPickup 
                    ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/40"
                    : "bg-gradient-to-br from-primary to-teal-500 shadow-primary/40"
                )}
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </motion.div>
            ) : isFocused ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 350, damping: 25 }}
            className="absolute z-50 w-full mt-3 bg-card/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="p-2">
              {suggestions.map((location, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 350 }}
                  onClick={() => handleSelect(location)}
                  className={cn(
                    "w-full px-4 py-4 text-left rounded-xl transition-all flex items-start gap-4 group",
                    "hover:bg-gradient-to-r",
                    isPickup 
                      ? "hover:from-emerald-500/10 hover:to-green-500/5" 
                      : "hover:from-primary/10 hover:to-teal-500/5"
                  )}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground transition-all flex-shrink-0 shadow-sm border border-white/5",
                      "bg-muted/60",
                      isPickup 
                        ? "group-hover:bg-emerald-500/20 group-hover:text-emerald-400" 
                        : "group-hover:bg-primary/20 group-hover:text-primary"
                    )}
                  >
                    {getLocationIcon(location.address)}
                  </motion.div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className={cn(
                      "text-sm font-bold truncate transition-colors",
                      isPickup ? "group-hover:text-emerald-400" : "group-hover:text-primary"
                    )}>
                      {location.address.split(',')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {location.address.split(',').slice(1).join(',').trim() || 'Location'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Powered by hint with subtle styling */}
            <div className="px-4 py-3 border-t border-white/5 bg-muted/20">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-muted-foreground/50" />
                <p className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">
                  Powered by location services
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearchInput;
