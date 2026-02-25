/**
 * Eats Filters Content
 * Filter controls for food ordering — distance, rating, delivery time, price, cuisine, offers, diet
 */

import { Star, Clock, DollarSign, MapPin, Tag, Leaf, Truck, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { EatsFiltersState } from "@/hooks/useResultsFilters";

interface EatsFiltersContentProps {
  filters: EatsFiltersState;
  onFilterChange: (filters: Partial<EatsFiltersState>) => void;
  onClearAll?: () => void;
}

const cuisineOptions = [
  { id: "american", label: "American" },
  { id: "italian", label: "Italian" },
  { id: "mexican", label: "Mexican" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "indian", label: "Indian" },
  { id: "thai", label: "Thai" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "korean", label: "Korean" },
  { id: "pizza", label: "Pizza" },
  { id: "burgers", label: "Burgers" },
  { id: "seafood", label: "Seafood" },
];

const priceOptions = [
  { id: "$", label: "$", desc: "Under $10" },
  { id: "$$", label: "$$", desc: "$10-$25" },
  { id: "$$$", label: "$$$", desc: "$25-$50" },
  { id: "$$$$", label: "$$$$", desc: "$50+" },
];

const deliveryTimeOptions = [
  { value: 15, label: "Under 15 min" },
  { value: 30, label: "Under 30 min" },
  { value: 45, label: "Under 45 min" },
  { value: 60, label: "Under 60 min" },
];

const distanceOptions = [
  { value: 1, label: "Within 1 mi" },
  { value: 3, label: "Within 3 mi" },
  { value: 5, label: "Within 5 mi" },
  { value: 10, label: "Within 10 mi" },
];

const ratingOptions = [
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.5, label: "3.5+" },
  { value: 3.0, label: "3.0+" },
];

const dietOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten Free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
];

export function EatsFiltersContent({
  filters,
  onFilterChange,
  onClearAll,
}: EatsFiltersContentProps) {
  const toggleCuisine = (id: string) => {
    const next = filters.cuisines.includes(id)
      ? filters.cuisines.filter((c) => c !== id)
      : [...filters.cuisines, id];
    onFilterChange({ cuisines: next });
  };

  const togglePriceRange = (id: string) => {
    const next = filters.priceRanges.includes(id)
      ? filters.priceRanges.filter((p) => p !== id)
      : [...filters.priceRanges, id];
    onFilterChange({ priceRanges: next });
  };

  const toggleDiet = (id: string) => {
    const next = filters.dietPreferences.includes(id)
      ? filters.dietPreferences.filter((d) => d !== id)
      : [...filters.dietPreferences, id];
    onFilterChange({ dietPreferences: next });
  };

  const hasActiveFilters =
    filters.cuisines.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.minRating !== null ||
    filters.maxDeliveryTime !== null ||
    filters.maxDistance !== null ||
    filters.freeDelivery ||
    filters.hasPromos ||
    filters.dietPreferences.length > 0;

  return (
    <div className="space-y-6">
      {hasActiveFilters && onClearAll && (
        <Button variant="outline" size="sm" onClick={onClearAll} className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <X className="w-4 h-4" /> Clear all filters
        </Button>
      )}

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Price Range
        </Label>
        <div className="flex gap-2">
          {priceOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePriceRange(p.id)}
              className={cn(
                "flex-1 py-2.5 rounded-xl border text-center transition-all",
                filters.priceRanges.includes(p.id)
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-600 font-bold"
                  : "bg-muted/50 border-border hover:border-orange-500/30"
              )}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Minimum Rating
        </Label>
        <div className="space-y-2">
          {ratingOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.minRating === opt.value}
                onCheckedChange={(checked) => onFilterChange({ minRating: checked ? opt.value : null })}
              />
              <span className="flex-1 group-hover:text-foreground transition-colors text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Delivery Time */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          Max Delivery Time
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {deliveryTimeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ maxDeliveryTime: filters.maxDeliveryTime === opt.value ? null : opt.value })}
              className={cn(
                "py-2.5 px-3 rounded-xl border text-sm transition-all",
                filters.maxDeliveryTime === opt.value
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-600 font-semibold"
                  : "bg-muted/50 border-border hover:border-sky-500/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-violet-500" />
          Distance
        </Label>
        <div className="space-y-2">
          {distanceOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.maxDistance === opt.value}
                onCheckedChange={(checked) => onFilterChange({ maxDistance: checked ? opt.value : null })}
              />
              <span className="flex-1 group-hover:text-foreground transition-colors text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cuisine */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Cuisine Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {cuisineOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleCuisine(c.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                filters.cuisines.includes(c.id)
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-muted/50 border-border text-muted-foreground hover:border-orange-500/30"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-500" />
            <Label className="text-sm font-medium cursor-pointer">Free Delivery</Label>
          </div>
          <Switch checked={filters.freeDelivery} onCheckedChange={(v) => onFilterChange({ freeDelivery: v })} />
        </div>
        <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-500" />
            <Label className="text-sm font-medium cursor-pointer">Promos & Deals</Label>
          </div>
          <Switch checked={filters.hasPromos} onCheckedChange={(v) => onFilterChange({ hasPromos: v })} />
        </div>
      </div>

      {/* Diet Preferences */}
      <div>
        <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-500" />
          Diet Preferences
        </Label>
        <div className="space-y-2">
          {dietOptions.map((d) => (
            <label key={d.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.dietPreferences.includes(d.id)}
                onCheckedChange={() => toggleDiet(d.id)}
              />
              <span className="flex-1 group-hover:text-foreground transition-colors text-sm">{d.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
