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
          "relative rounded-2xl transition-all duration-300",
          isFocused && "ring-2 ring-primary/30 shadow-lg shadow-primary/10"
        )}
        animate={{ scale: isFocused ? 1.01 : 1 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
      >
        {/* Icon indicator with enhanced styling */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          {icon === "pickup" ? (
            <motion.div 
              className={cn(
                "relative w-4 h-4 rounded-full transition-all",
                isFocused ? "bg-emerald-500 shadow-lg shadow-emerald-500/60" : "bg-emerald-500"
              )}
              animate={{ scale: isFocused ? 1.25 : 1 }}
            >
              {isFocused && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-emerald-500"
                />
              )}
            </motion.div>
          ) : (
            <motion.div 
              className={cn(
                "relative w-4 h-4 rounded transition-all",
                isFocused ? "bg-primary shadow-lg shadow-primary/60" : "bg-foreground"
              )}
              animate={{ scale: isFocused ? 1.25 : 1, rotate: isFocused ? 45 : 0 }}
            >
              {isFocused && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded bg-primary"
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
            "pl-12 pr-12 h-14 rounded-2xl border-2 transition-all duration-200 bg-card/80 backdrop-blur-xl text-base font-medium",
            isFocused 
              ? "border-primary/40 bg-card shadow-inner" 
              : "border-white/10 hover:border-white/20",
            value && "border-emerald-500/40 bg-emerald-500/5"
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
                className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </motion.div>
            ) : value ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/40"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="absolute z-50 w-full mt-3 bg-card/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
          >
            <div className="p-2">
              {suggestions.map((location, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
                  onClick={() => handleSelect(location)}
                  className={cn(
                    "w-full px-4 py-3.5 text-left rounded-xl transition-all flex items-start gap-3 group",
                    "hover:bg-gradient-to-r hover:from-primary/10 hover:to-teal-500/5"
                  )}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all flex-shrink-0 shadow-sm"
                  >
                    {getLocationIcon(location.address)}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                      {location.address.split(',')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {location.address.split(',').slice(1).join(',').trim() || 'Location'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Powered by hint with subtle styling */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-muted/20">
              <p className="text-[10px] text-muted-foreground/50 text-center font-medium tracking-wide">
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
