import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2, History, Star, Building2 } from "lucide-react";
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

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <motion.div 
        className={cn(
          "relative rounded-xl transition-all duration-200",
          isFocused && "ring-2 ring-primary/20"
        )}
        animate={{ scale: isFocused ? 1.01 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Icon indicator */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          {icon === "pickup" ? (
            <motion.div 
              className={cn(
                "w-3.5 h-3.5 rounded-full transition-all",
                isFocused ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-emerald-500"
              )}
              animate={{ scale: isFocused ? 1.2 : 1 }}
            />
          ) : (
            <motion.div 
              className={cn(
                "w-3.5 h-3.5 rounded-sm transition-all",
                isFocused ? "bg-primary shadow-lg shadow-primary/50" : "bg-foreground"
              )}
              animate={{ scale: isFocused ? 1.2 : 1 }}
            />
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
            "pl-10 pr-10 h-12 rounded-xl border-2 transition-all bg-card/50 backdrop-blur-sm",
            isFocused 
              ? "border-primary/50 bg-card" 
              : "border-border/50 hover:border-border",
            value && "border-emerald-500/30 bg-emerald-500/5"
          )}
        />
        
        {/* Right side indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </motion.div>
            ) : value ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="p-1">
              {suggestions.map((location, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(location)}
                  className={cn(
                    "w-full px-3 py-3 text-left rounded-lg transition-all flex items-start gap-3 group",
                    "hover:bg-primary/10"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors flex-shrink-0">
                    {getLocationIcon(location.address)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {location.address.split(',')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {location.address.split(',').slice(1).join(',').trim() || 'Location'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Powered by hint */}
            <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
              <p className="text-[10px] text-muted-foreground/60 text-center">
                Powered by location services
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearchInput;
