/**
 * City Selector Component
 * Dropdown for selecting delivery city in header
 */
import { useState } from "react";
import { MapPin, ChevronDown, Navigation, Loader2, Check } from "lucide-react";
import { useCustomerCity } from "@/contexts/CustomerCityContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function CitySelector() {
  const [open, setOpen] = useState(false);
  const { 
    selectedCity, 
    cities, 
    isDetecting, 
    setCity, 
    detectCity 
  } = useCustomerCity();

  const handleDetectLocation = async () => {
    await detectCity();
    setOpen(false);
  };

  const handleSelectCity = (city: typeof cities[0]) => {
    setCity(city);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border touch-manipulation active:bg-muted/80 transition-colors max-w-[180px]"
        >
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">
            {selectedCity?.name || "Select City"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="center">
        <div className="space-y-1">
          {/* Detect Location Button */}
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-all duration-200 text-left disabled:opacity-50 touch-manipulation active:scale-[0.98]"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm font-medium">
              {isDetecting ? "Detecting..." : "Use My Location"}
            </span>
          </button>

          {/* Divider */}
          <div className="border-t border-border my-2" />

          {/* City List */}
          <div className="max-h-[200px] overflow-y-auto">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelectCity(city)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-all duration-200 text-left touch-manipulation active:scale-[0.98]",
                  selectedCity?.id === city.id && "bg-muted"
                )}
              >
                <span className="text-sm">{city.name}</span>
                {selectedCity?.id === city.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          {cities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No cities available
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
