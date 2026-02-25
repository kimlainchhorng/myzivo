import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  SlidersHorizontal,
  Clock,
  Plane,
  Luggage,
  Wifi,
  Shield,
  Star,
  Crown,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { allAirlines, getAirlineLogo, type Airline } from "@/data/airlines";

export interface FlightFilters {
  priceRange: [number, number];
  durationMax: number;
  directOnly: boolean;
  refundableOnly: boolean;
  airlines: string[];
  categories: ('premium' | 'full-service' | 'low-cost')[];
  alliances: string[];
  departureTime: { start: number; end: number };
  amenities: string[];
}

interface FlightFiltersProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  maxPrice: number;
  maxDuration: number;
  availableAirlines: string[];
}

const FlightFiltersPanel = ({
  filters,
  onFiltersChange,
  maxPrice,
  maxDuration,
  availableAirlines
}: FlightFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['price', 'stops', 'airlines']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = <K extends keyof FlightFilters>(key: K, value: FlightFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K] extends (infer T)[] ? T : never
  ) => {
    const currentArray = filters[key] as unknown[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray as FlightFilters[K] });
  };

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, maxPrice],
      durationMax: maxDuration,
      directOnly: false,
      refundableOnly: false,
      airlines: [],
      categories: [],
      alliances: [],
      departureTime: { start: 0, end: 24 },
      amenities: []
    });
  };

  const activeFiltersCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice,
    filters.durationMax < maxDuration,
    filters.directOnly,
    filters.refundableOnly,
    filters.airlines.length > 0,
    filters.categories.length > 0,
    filters.alliances.length > 0,
    filters.amenities.length > 0
  ].filter(Boolean).length;

  const formatTime = (hour: number) => {
    if (hour === 0 || hour === 24) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const categories: { id: Airline['category']; label: string; icon: React.ReactNode }[] = [
    { id: 'premium', label: 'Premium', icon: <Crown className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'full-service', label: 'Full-Service', icon: <Star className="w-3.5 h-3.5 text-sky-500" /> },
    { id: 'low-cost', label: 'Low-Cost', icon: <Plane className="w-3.5 h-3.5 text-emerald-500" /> }
  ];

  const alliances = ['Star Alliance', 'Oneworld', 'SkyTeam'];

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-3.5 h-3.5" /> },
    { id: 'meals', label: 'Meals', icon: <Luggage className="w-3.5 h-3.5" /> },
    { id: 'entertainment', label: 'Entertainment', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'lounge', label: 'Lounge Access', icon: <Shield className="w-3.5 h-3.5" /> }
  ];

  // Get airline objects for the available airlines
  const airlineObjects = availableAirlines
    .map(code => allAirlines.find(a => a.code === code))
    .filter((a): a is Airline => a !== undefined);

  const FilterSection = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode 
  }) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <div className="border-b border-border/30 last:border-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-sm font-medium hover:text-sky-500 transition-colors"
        >
          {title}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isExpanded && (
          <div className="pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="sticky top-24 glass-card">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-500" />
            <span className="font-bold">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge className="bg-sky-500 text-white text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sky-500 h-8">
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Price Range */}
        <FilterSection id="price" title="Price Range">
          <Slider
            value={[filters.priceRange[0], filters.priceRange[1]]}
            onValueChange={(v) => updateFilter('priceRange', [v[0], v[1]])}
            max={maxPrice}
            step={25}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </FilterSection>

        {/* Stops */}
        <FilterSection id="stops" title="Stops">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-sm">Direct flights only</span>
            <Switch
              checked={filters.directOnly}
              onCheckedChange={(v) => updateFilter('directOnly', v)}
            />
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection id="duration" title="Flight Duration">
          <Slider
            value={[filters.durationMax]}
            onValueChange={(v) => updateFilter('durationMax', v[0])}
            max={maxDuration}
            step={1}
            className="mb-3"
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Up to {filters.durationMax} hours</span>
          </div>
        </FilterSection>

        {/* Departure Time */}
        <FilterSection id="time" title="Departure Time">
          <Slider
            value={[filters.departureTime.start, filters.departureTime.end]}
            onValueChange={(v) => updateFilter('departureTime', { start: v[0], end: v[1] })}
            max={24}
            step={1}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(filters.departureTime.start)}</span>
            <span>{formatTime(filters.departureTime.end)}</span>
          </div>
        </FilterSection>

        {/* Airline Category */}
        <FilterSection id="category" title="Airline Type">
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleArrayFilter('categories', cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                  filters.categories.includes(cat.id)
                    ? "bg-sky-500/10 border-sky-500/50"
                    : "bg-muted/30 border-border/50 hover:border-sky-500/30"
                )}
              >
                {cat.icon}
                <span className="text-sm">{cat.label}</span>
                {filters.categories.includes(cat.id) && (
                  <Badge className="ml-auto bg-sky-500 text-white text-[10px] px-1.5">✓</Badge>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Alliances */}
        <FilterSection id="alliance" title="Alliances">
          <div className="flex flex-wrap gap-2">
            {alliances.map((alliance) => (
              <button
                key={alliance}
                onClick={() => toggleArrayFilter('alliances', alliance)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  filters.alliances.includes(alliance)
                    ? "bg-sky-500 text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-sky-500/20"
                )}
              >
                {alliance}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Airlines */}
        <FilterSection id="airlines" title="Airlines">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {airlineObjects.map((airline) => (
              <button
                key={airline.code}
                onClick={() => toggleArrayFilter('airlines', airline.code)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl border transition-all",
                  filters.airlines.includes(airline.code)
                    ? "bg-sky-500/10 border-sky-500/50"
                    : "bg-transparent border-transparent hover:bg-muted/50"
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-white/90 dark:bg-muted/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={getAirlineLogo(airline.code, 50)}
                    alt={airline.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-sm truncate flex-1 text-left">{airline.name}</span>
                {filters.airlines.includes(airline.code) && (
                  <Badge className="bg-sky-500 text-white text-[10px] px-1.5">✓</Badge>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Amenities */}
        <FilterSection id="amenities" title="Amenities">
          <div className="grid grid-cols-2 gap-2">
            {amenityOptions.map((amenity) => (
              <button
                key={amenity.id}
                onClick={() => toggleArrayFilter('amenities', amenity.id)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm",
                  filters.amenities.includes(amenity.id)
                    ? "bg-sky-500/10 border-sky-500/50"
                    : "bg-muted/30 border-border/50 hover:border-sky-500/30"
                )}
              >
                {amenity.icon}
                <span>{amenity.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Refundable */}
        <div className="pt-4">
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-sm">Refundable only</span>
            </div>
            <Switch
              checked={filters.refundableOnly}
              onCheckedChange={(v) => updateFilter('refundableOnly', v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightFiltersPanel;
