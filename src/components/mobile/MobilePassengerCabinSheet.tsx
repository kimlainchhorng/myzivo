/**
 * Mobile Passenger & Cabin Bottom Sheet
 * Full bottom sheet with large +/- buttons for easy thumb interaction
 */

import { useState, useEffect } from "react";
import { Users, Crown, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type CabinClass = "economy" | "premium" | "business" | "first";

const cabinOptions: { value: CabinClass; label: string; description: string }[] = [
  { value: "economy", label: "Economy", description: "Best value" },
  { value: "premium", label: "Premium Economy", description: "Extra legroom" },
  { value: "business", label: "Business", description: "Flat beds, priority" },
  { value: "first", label: "First Class", description: "Ultimate luxury" },
];

interface MobilePassengerCabinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passengers: number;
  cabin: CabinClass;
  onPassengersChange: (count: number) => void;
  onCabinChange: (cabin: CabinClass) => void;
}

export default function MobilePassengerCabinSheet({
  open,
  onOpenChange,
  passengers,
  cabin,
  onPassengersChange,
  onCabinChange,
}: MobilePassengerCabinSheetProps) {
  const [tempPassengers, setTempPassengers] = useState(passengers);
  const [tempCabin, setTempCabin] = useState<CabinClass>(cabin);

  // Sync when sheet opens
  useEffect(() => {
    if (open) {
      setTempPassengers(passengers);
      setTempCabin(cabin);
    }
  }, [open, passengers, cabin]);

  const handleConfirm = () => {
    onPassengersChange(tempPassengers);
    onCabinChange(tempCabin);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl p-0 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b border-border/50 shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Travelers & Cabin
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Passengers Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Number of Travelers
            </h3>
            
            <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-4">
              <div>
                <p className="font-semibold text-lg">Adults</p>
                <p className="text-sm text-muted-foreground">12+ years</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-xl touch-manipulation active:scale-95"
                  onClick={() => setTempPassengers(Math.max(1, tempPassengers - 1))}
                  disabled={tempPassengers <= 1}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                
                <span className="w-12 text-center text-2xl font-bold">
                  {tempPassengers}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-xl touch-manipulation active:scale-95"
                  onClick={() => setTempPassengers(Math.min(9, tempPassengers + 1))}
                  disabled={tempPassengers >= 9}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cabin Class Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Cabin Class
            </h3>
            
            <div className="grid gap-3">
              {cabinOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTempCabin(option.value)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all touch-manipulation active:scale-[0.98]",
                    tempCabin === option.value
                      ? "border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Crown className={cn(
                      "w-5 h-5",
                      option.value === "first" ? "text-amber-500" :
                      option.value === "business" ? "text-blue-500" :
                      option.value === "premium" ? "text-violet-500" : "text-emerald-500"
                    )} />
                    <div className="text-left">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  
                  {tempCabin === option.value && (
                    <Check className="w-5 h-5 text-sky-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="p-4 border-t border-border/50 bg-background shrink-0 safe-area-inset-bottom">
          <Button
            onClick={handleConfirm}
            className="w-full h-12 font-bold text-base gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg active:scale-[0.98]"
          >
            <Check className="w-5 h-5" />
            {tempPassengers} Traveler{tempPassengers > 1 ? "s" : ""} • {cabinOptions.find(o => o.value === tempCabin)?.label}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
