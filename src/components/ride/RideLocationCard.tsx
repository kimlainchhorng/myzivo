import { useState, useRef, useEffect } from "react";
import { Send, MapPin, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RideLocationCardProps {
  pickup: string;
  destination: string;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
}

const mockSuggestions = [
  "123 Main Street, New York, NY 10001",
  "456 Broadway, New York, NY 10012",
  "789 Park Avenue, New York, NY 10021",
  "321 Fifth Avenue, New York, NY 10016",
  "555 Madison Avenue, New York, NY 10022",
  "JFK International Airport, Queens, NY",
  "LaGuardia Airport, Queens, NY",
  "Times Square, Manhattan, NY",
];

const RideLocationCard = ({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
}: RideLocationCardProps) => {
  const [activeField, setActiveField] = useState<"pickup" | "destination" | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const pickupRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: "pickup" | "destination", value: string) => {
    if (field === "pickup") {
      onPickupChange(value);
    } else {
      onDestinationChange(value);
    }

    if (value.length > 0) {
      const filtered = mockSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 4));
    } else {
      setFilteredSuggestions(mockSuggestions.slice(0, 4));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (activeField === "pickup") {
      onPickupChange(suggestion);
    } else {
      onDestinationChange(suggestion);
    }
    setActiveField(null);
    setFilteredSuggestions([]);
  };

  const handleFocus = (field: "pickup" | "destination") => {
    setActiveField(field);
    setFilteredSuggestions(mockSuggestions.slice(0, 4));
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setActiveField(null);
      setFilteredSuggestions([]);
    }, 200);
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-hidden"
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
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
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
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
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
        {activeField && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-50"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-white/90 truncate">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RideLocationCard;
