import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocationSearch, Location } from "@/hooks/useRiderBooking";

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
  const { searchLocations, isSearching } = useLocationSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);
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
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {icon === "pickup" ? (
            <div className="w-3 h-3 rounded-full bg-green-500" />
          ) : (
            <div className="w-3 h-3 rounded-sm bg-foreground" />
          )}
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{location.address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
