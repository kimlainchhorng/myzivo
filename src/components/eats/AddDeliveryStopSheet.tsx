/**
 * Add Delivery Stop Sheet
 * Bottom sheet for adding a new delivery stop
 */

import { useState } from "react";
import { MapPin, Home, Briefcase, Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { useAuth } from "@/contexts/AuthContext";

import { DeliveryStop } from "@/lib/multiStopDeliveryFee";
import { cn } from "@/lib/utils";

interface AddDeliveryStopSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (stop: Omit<DeliveryStop, "id">) => void;
  stopNumber: number;
}

const LABEL_ICONS: Record<string, typeof Home> = {
  home: Home,
  work: Briefcase,
  default: MapPin,
};

export function AddDeliveryStopSheet({
  open,
  onOpenChange,
  onAdd,
  stopNumber,
}: AddDeliveryStopSheetProps) {
  const { user } = useAuth();
  const { data: savedLocations } = useSavedLocations(user?.id);
  
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [label, setLabel] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  
  const resetForm = () => {
    setAddress("");
    setInstructions("");
    setLabel("");
    setLat(null);
    setLng(null);
  };
  
  const handleAdd = () => {
    if (!address.trim()) return;
    
    onAdd({
      address: address.trim(),
      instructions: instructions.trim() || undefined,
      label: label || undefined,
      lat,
      lng,
    });
    
    resetForm();
  };
  
  const handleSelectSaved = (location: {
    address: string;
    lat: number;
    lng: number;
    label: string;
  }) => {
    setAddress(location.address);
    setLat(location.lat);
    setLng(location.lng);
    setLabel(location.label);
  };
  
  const isValid = address.trim().length >= 5;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-eats/20 text-eats flex items-center justify-center text-sm font-bold">
              {stopNumber}
            </div>
            Add Delivery Stop
          </SheetTitle>
          <SheetDescription>
            Enter the address for stop {stopNumber}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Saved Locations */}
          {savedLocations && savedLocations.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Saved Addresses
              </Label>
              <div className="flex flex-wrap gap-2">
                {savedLocations.slice(0, 4).map((loc) => {
                  const IconComponent = LABEL_ICONS[loc.icon] || LABEL_ICONS.default;
                  return (
                    <Button
                      key={loc.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2",
                        address === loc.address && "border-eats text-eats"
                      )}
                      onClick={() => handleSelectSaved(loc)}
                    >
                      <IconComponent className="w-3 h-3" />
                      {loc.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Address Input */}
          <div>
            <Label htmlFor="new-stop-address">Address *</Label>
            <Input
              id="new-stop-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the full street address including city and state
            </p>
          </div>
          
          {/* Instructions */}
          <div>
            <Label htmlFor="new-stop-instructions">
              Delivery Instructions (optional)
            </Label>
            <Textarea
              id="new-stop-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Apt #, gate code, leave at door..."
              className="mt-1.5"
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {instructions.length}/200 characters
            </p>
          </div>
          
          {/* Add Button */}
          <Button
            onClick={handleAdd}
            disabled={!isValid}
            className="w-full h-12 font-bold bg-gradient-to-r from-eats to-orange-500"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Add Stop {stopNumber}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
