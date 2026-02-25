import { useState, useRef, useCallback, useEffect } from "react";
import { Send, MapPin, Crosshair, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useServerGeocode, ServerSuggestion } from "@/hooks/useServerGeocode";

interface LocationCoords {
  lat: number;
  lng: number;
}

interface RideLocationCardProps {
  pickup: string;
  destination: string;
  onPickupChange: (value: string, coords?: LocationCoords) => void;
  onDestinationChange: (value: string, coords?: LocationCoords) => void;
  pickupCoords?: LocationCoords;
  dropoffCoords?: LocationCoords;
}

const RideLocationCard = ({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
}: RideLocationCardProps) => {
  const [activeField, setActiveField] = useState<"pickup" | "destination" | null>(null);
  const pickupRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  
  const {
    suggestions,
    isLoading,
    fetchSuggestions,
    getCoordinates,
    clearSuggestions,
  } = useServerGeocode();

  // User's current location for proximity bias
  const [userLocation, setUserLocation] = useState<LocationCoords | undefined>();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Fallback to NYC
          setUserLocation({ lat: 40.7128, lng: -73.9857 });
        }
      );
    }
  }, []);

  const handleInputChange = useCallback((field: "pickup" | "destination", value: string) => {
    if (field === "pickup") {
      onPickupChange(value);
    } else {
      onDestinationChange(value);
    }

    // Fetch suggestions from server
    fetchSuggestions(value, userLocation);
  }, [onPickupChange, onDestinationChange, fetchSuggestions, userLocation]);

  const handleSuggestionClick = useCallback(async (suggestion: ServerSuggestion) => {
    // Get coordinates for the selected place
    const details = await getCoordinates(suggestion.place_id);
    
    const coords = details ? { lat: details.lat, lng: details.lng } : undefined;
    
    if (activeField === "pickup") {
      onPickupChange(suggestion.description, coords);
    } else {
      onDestinationChange(suggestion.description, coords);
    }
    
    setActiveField(null);
    clearSuggestions();
  }, [activeField, onPickupChange, onDestinationChange, getCoordinates, clearSuggestions]);

  const handleFocus = useCallback((field: "pickup" | "destination") => {
    setActiveField(field);
    const currentValue = field === "pickup" ? pickup : destination;
    fetchSuggestions(currentValue || "", userLocation);
  }, [pickup, destination, fetchSuggestions, userLocation]);

  const handleClear = useCallback((field: "pickup" | "destination") => {
    if (field === "pickup") {
      onPickupChange("");
    } else {
      onDestinationChange("");
    }
    clearSuggestions();
  }, [onPickupChange, onDestinationChange, clearSuggestions]);

  const handleBlur = useCallback(() => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setActiveField(null);
      clearSuggestions();
    }, 250);
  }, [clearSuggestions]);

  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        
        // Set as current location with coordinates
        if (activeField === "pickup" || !activeField) {
          onPickupChange("Current Location", coords);
        } else {
          onDestinationChange("Current Location", coords);
        }
        clearSuggestions();
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  }, [activeField, onPickupChange, onDestinationChange, clearSuggestions]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden hover:border-white/20 hover:shadow-lg transition-all duration-200"
      >
        {/* Location Rows */}
        <div className="flex gap-3">
          {/* Left connector line */}
          <div className="flex flex-col items-center py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-primary" />
            </div>
            <div className="w-0.5 h-6 bg-white/20 my-1" />
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Input fields */}
          <div className="flex-1 space-y-3">
            {/* Pickup */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
                Pickup Location
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={pickupRef}
                  type="text"
                  value={pickup}
                  onChange={(e) => handleInputChange("pickup", e.target.value)}
                  onFocus={() => handleFocus("pickup")}
                  onBlur={handleBlur}
                  placeholder="Enter pickup location..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
                  style={{ fontSize: "16px" }}
                />
                {pickup && (
                  <button
                    onClick={() => handleClear("pickup")}
                    className="p-1.5 rounded-full hover:bg-white/10 active:scale-90 transition-all duration-150 touch-manipulation"
                    aria-label="Clear pickup"
                  >
                    <X className="w-3.5 h-3.5 text-white/60" />
                  </button>
                )}
                <button
                  onClick={handleUseCurrentLocation}
                  className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all duration-150 touch-manipulation"
                  aria-label="Use current location"
                >
                  <Crosshair className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Destination */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
                Destination
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={destinationRef}
                  type="text"
                  value={destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  onFocus={() => handleFocus("destination")}
                  onBlur={handleBlur}
                  placeholder="Enter destination..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
                  style={{ fontSize: "16px" }}
                />
                {destination && (
                  <button
                    onClick={() => handleClear("destination")}
                    className="p-1.5 rounded-full hover:bg-white/10 active:scale-90 transition-all duration-150 touch-manipulation"
                    aria-label="Clear destination"
                  >
                    <X className="w-3.5 h-3.5 text-white/60" />
                  </button>
                )}
                <button
                  onClick={handleUseCurrentLocation}
                  className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all duration-150 touch-manipulation"
                  aria-label="Use current location"
                >
                  <Crosshair className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {activeField && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-50"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="ml-2 text-sm text-white/60">Searching...</span>
              </div>
            )}
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id || index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 active:bg-white/15 transition-all duration-150 border-b border-white/5 last:border-b-0 touch-manipulation"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white/90 font-medium block truncate">
                    {suggestion.main_text}
                  </span>
                  <span className="text-xs text-white/50 block truncate">
                    {suggestion.description}
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideLocationCard;
