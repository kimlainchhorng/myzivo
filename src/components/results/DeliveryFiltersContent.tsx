/**
 * Delivery Filters Content
 * Filter controls for package delivery — service type, ETA, price, package size
 */

import { Package, Clock, DollarSign, Ruler, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeliveryFiltersState } from "@/hooks/useResultsFilters";

interface DeliveryFiltersContentProps {
  filters: DeliveryFiltersState;
  onFilterChange: (filters: Partial<DeliveryFiltersState>) => void;
  onClearAll?: () => void;
}

const serviceTypeOptions = [
  { id: "standard", label: "Standard", desc: "Same day" },
  { id: "express", label: "Express", desc: "1-2 hours" },
  { id: "rush", label: "Rush", desc: "Under 1 hour" },
  { id: "scheduled", label: "Scheduled", desc: "Pick a time" },
];

const etaOptions = [
  { value: 30, label: "Under 30 min" },
  { value: 60, label: "Under 1 hour" },
  { value: 120, label: "Under 2 hours" },
  { value: 240, label: "Under 4 hours" },
];

const packageSizeOptions = [
  { id: "small", label: "Small", desc: "Fits in a bag" },
  { id: "medium", label: "Medium", desc: "Fits in a box" },
  { id: "large", label: "Large", desc: "Requires vehicle" },
  { id: "xl", label: "Extra Large", desc: "Furniture / heavy" },
];

export function DeliveryFiltersContent({
  filters,
  onFilterChange,
  onClearAll,
}: DeliveryFiltersContentProps) {
  const toggleServiceType = (id: string) => {
    const next = filters.serviceTypes.includes(id)
      ? filters.serviceTypes.filter((s) => s !== id)
      : [...filters.serviceTypes, id];
    onFilterChange({ serviceTypes: next });
  };

  const togglePackageSize = (id: string) => {
    const next = filters.packageSizes.includes(id)
      ? filters.packageSizes.filter((p) => p !== id)
      : [...filters.packageSizes, id];
    onFilterChange({ packageSizes: next });
  };

  const hasActiveFilters =
    filters.serviceTypes.length > 0 ||
    filters.maxEta !== null ||
    filters.maxPrice < 200 ||
    filters.packageSizes.length > 0;

  return (
    <div className="space-y-6">
      {hasActiveFilters && onClearAll && (
        <Button variant="outline" size="sm" onClick={onClearAll} className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <X className="w-4 h-4" /> Clear all filters
        </Button>
      )}

      {/* Service Type */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-violet-500" />
          Service Type
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {serviceTypeOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleServiceType(s.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                filters.serviceTypes.includes(s.id)
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-600"
                  : "bg-muted/50 border-border hover:border-violet-500/30"
              )}
            >
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ETA */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          Max ETA
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {etaOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ maxEta: filters.maxEta === opt.value ? null : opt.value })}
              className={cn(
                "py-2.5 px-3 rounded-xl border text-sm transition-all",
                filters.maxEta === opt.value
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-600 font-semibold"
                  : "bg-muted/50 border-border hover:border-sky-500/30"
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

      {/* Package Size */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-amber-500" />
          Package Size
        </Label>
        <div className="space-y-2">
          {packageSizeOptions.map((p) => (
            <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.packageSizes.includes(p.id)}
                onCheckedChange={() => togglePackageSize(p.id)}
              />
              <div className="flex-1">
                <span className="group-hover:text-foreground transition-colors text-sm font-medium">{p.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
