/**
 * City Selection Modal
 * First-visit prompt for city selection
 */
import { useState } from "react";
import { MapPin, Navigation, Loader2, ChevronDown } from "lucide-react";
import { useCustomerCity } from "@/contexts/CustomerCityContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CitySelectionModal() {
  const { 
    showCityModal, 
    closeCityModal, 
    cities, 
    setCity, 
    detectCity,
    isDetecting 
  } = useCustomerCity();
  
  const [selectedId, setSelectedId] = useState<string>("");
  const [hasTriedDetect, setHasTriedDetect] = useState(false);

  const handleDetectLocation = async () => {
    setHasTriedDetect(true);
    await detectCity();
  };

  const handleContinue = () => {
    const city = cities.find(c => c.id === selectedId);
    if (city) {
      setCity(city);
    } else if (cities.length > 0) {
      // Default to first city if nothing selected
      setCity(cities[0]);
    }
  };

  const handleSkip = () => {
    // Default to first city
    if (cities.length > 0) {
      setCity(cities[0]);
    }
    closeCityModal();
  };

  return (
    <Dialog open={showCityModal} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Where are you ordering?</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            We'll show you restaurants that deliver to your area
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Detect Location Button */}
          <Button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            variant="outline"
            className="w-full h-12 gap-3"
          >
            {isDetecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            {isDetecting ? "Detecting location..." : "Use My Current Location"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or select a city
              </span>
            </div>
          </div>

          {/* City Dropdown */}
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedId && !hasTriedDetect}
            className="w-full h-12"
          >
            Continue
          </Button>

          {/* Skip Link */}
          <button
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
