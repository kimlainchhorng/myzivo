/**
 * Ride Filters Content
 * Filter controls for rides — vehicle type, ETA, price, accessible, scheduled
 */

import { Car, Clock, DollarSign, Accessibility, CalendarDays, X, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { RideFiltersState } from "@/hooks/useResultsFilters";

interface RideFiltersContentProps {
  filters: RideFiltersState;
  onFilterChange: (filters: Partial<RideFiltersState>) => void;
  onClearAll?: () => void;
}

const vehicleTypeOptions = [
  { id: "economy", label: "Economy", desc: "Affordable rides" },
  { id: "comfort", label: "Comfort", desc: "Extra legroom" },
  { id: "xl", label: "XL", desc: "For groups" },
  { id: "premium", label: "Premium", desc: "Luxury vehicles" },
  { id: "electric", label: "Electric", desc: "Eco-friendly" },
];

const etaOptions = [
  { value: 5, label: "Under 5 min" },
  { value: 10, label: "Under 10 min" },
  { value: 15, label: "Under 15 min" },
  { value: 30, label: "Under 30 min" },
];

export function RideFiltersContent({
  filters,
  onFilterChange,
  onClearAll,
}: RideFiltersContentProps) {
  const toggleVehicleType = (id: string) => {
    const next = filters.vehicleTypes.includes(id)
      ? filters.vehicleTypes.filter((v) => v !== id)
      : [...filters.vehicleTypes, id];
    onFilterChange({ vehicleTypes: next });
  };

  const hasActiveFilters =
    filters.vehicleTypes.length > 0 ||
    filters.maxEta !== null ||
    filters.maxPrice < 200 ||
    filters.wheelchairAccessible ||
    filters.scheduledOnly;

  return (
    <div className="space-y-6">
      {hasActiveFilters && onClearAll && (
        <Button variant="outline" size="sm" onClick={onClearAll} className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <X className="w-4 h-4" /> Clear all filters
        </Button>
      )}

      {/* Vehicle Type */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          Vehicle Type
        </Label>
        <div className="space-y-2">
          {vehicleTypeOptions.map((v) => (
            <label key={v.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.vehicleTypes.includes(v.id)}
                onCheckedChange={() => toggleVehicleType(v.id)}
              />
              <div className="flex-1">
                <span className="group-hover:text-foreground transition-colors text-sm font-medium">{v.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{v.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ETA */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Max Pickup ETA
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {etaOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ maxEta: filters.maxEta === opt.value ? null : opt.value })}
              className={cn(
                "py-2.5 px-3 rounded-xl border text-sm transition-all",
                filters.maxEta === opt.value
                  ? "bg-primary/20 border-primary/50 text-primary font-semibold"
                  : "bg-muted/50 border-border hover:border-primary/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Max Price: ${filters.maxPrice}
        </Label>
        <div className="px-1">
          <Slider
            value={[filters.maxPrice]}
            onValueChange={(v) => onFilterChange({ maxPrice: v[0] })}
            min={5}
            max={200}
            step={5}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$5</span>
            <span>$200</span>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-blue-500" />
            <Label className="text-sm font-medium cursor-pointer">Wheelchair Accessible</Label>
          </div>
          <Switch checked={filters.wheelchairAccessible} onCheckedChange={(v) => onFilterChange({ wheelchairAccessible: v })} />
        </div>
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium cursor-pointer">Scheduled Rides Only</Label>
          </div>
          <Switch checked={filters.scheduledOnly} onCheckedChange={(v) => onFilterChange({ scheduledOnly: v })} />
        </div>
      </div>
    </div>
  );
}
