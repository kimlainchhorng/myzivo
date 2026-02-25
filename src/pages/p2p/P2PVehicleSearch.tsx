/**
 * P2P Vehicle Search Page
 * Browse and search available P2P rental vehicles
 */

import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search, MapPin, Calendar, Filter, Car, Zap, Star, Users, 
  Fuel, Settings2, ChevronDown, X, SlidersHorizontal
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useP2PVehicleSearch, type P2PSearchFilters } from "@/hooks/useP2PBooking";

const categories = [
  { value: "all", label: "All Types" },
  { value: "economy", label: "Economy" },
  { value: "compact", label: "Compact" },
  { value: "midsize", label: "Midsize" },
  { value: "fullsize", label: "Full Size" },
  { value: "suv", label: "SUV" },
  { value: "luxury", label: "Luxury" },
  { value: "sports", label: "Sports" },
  { value: "minivan", label: "Minivan" },
  { value: "truck", label: "Truck" },
  { value: "electric", label: "Electric" },
];

const transmissions = [
  { value: "all", label: "Any Transmission" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

const fuelTypes = [
  { value: "all", label: "Any Fuel" },
  { value: "gasoline", label: "Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
];

export default function P2PVehicleSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Parse search params into filters
  const filters: P2PSearchFilters = useMemo(() => ({
    city: searchParams.get("city") || undefined,
    state: searchParams.get("state") || undefined,
    pickupDate: searchParams.get("pickup_date") || undefined,
    returnDate: searchParams.get("return_date") || undefined,
    category: searchParams.get("category") || undefined,
    transmission: searchParams.get("transmission") || undefined,
    fuelType: searchParams.get("fuel_type") || undefined,
    minPrice: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    maxPrice: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    seats: searchParams.get("seats") ? Number(searchParams.get("seats")) : undefined,
    instantBook: searchParams.get("instant_book") === "true",
  }), [searchParams]);

  const { data: vehicles, isLoading } = useP2PVehicleSearch(filters);

  // Local filter state for the filter panel
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || "all",
    transmission: filters.transmission || "all",
    fuelType: filters.fuelType || "all",
    priceRange: [filters.minPrice || 0, filters.maxPrice || 500] as [number, number],
    instantBook: filters.instantBook || false,
  });

  const updateFilter = (key: string, value: string | number | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    if (localFilters.category !== "all") {
      newParams.set("category", localFilters.category);
    } else {
      newParams.delete("category");
    }
    
    if (localFilters.transmission !== "all") {
      newParams.set("transmission", localFilters.transmission);
    } else {
      newParams.delete("transmission");
    }
    
    if (localFilters.fuelType !== "all") {
      newParams.set("fuel_type", localFilters.fuelType);
    } else {
      newParams.delete("fuel_type");
    }
    
    if (localFilters.priceRange[0] > 0) {
      newParams.set("min_price", String(localFilters.priceRange[0]));
    } else {
      newParams.delete("min_price");
    }
    
    if (localFilters.instantBook) {
      newParams.set("instant_book", "true");
    } else {
      newParams.delete("instant_book");
    }
    
    setSearchParams(newParams);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (filters.city) newParams.set("city", filters.city);
    if (filters.pickupDate) newParams.set("pickup_date", filters.pickupDate);
    if (filters.returnDate) newParams.set("return_date", filters.returnDate);
    setSearchParams(newParams);
    setLocalFilters({
      category: "all",
      transmission: "all",
      fuelType: "all",
      priceRange: [0, 500],
      instantBook: false,
    });
  };

  const activeFilterCount = [
    filters.category,
    filters.transmission,
    filters.fuelType,
    filters.minPrice,
    filters.maxPrice,
    filters.instantBook,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`P2P Car Rentals${filters.city ? ` in ${filters.city}` : ""} | ZIVO`}
        description="Rent cars directly from local owners. Better prices, unique vehicles, and a personal touch."
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {filters.city ? `Cars in ${filters.city}` : "Browse P2P Rentals"}
            </h1>
            <p className="text-muted-foreground">
              {filters.pickupDate && filters.returnDate ? (
                <>
                  {format(parseISO(filters.pickupDate), "MMM d")} -{" "}
                  {format(parseISO(filters.returnDate), "MMM d, yyyy")}
                </>
              ) : (
                "Search available vehicles from local owners"
              )}
            </p>
          </div>

          {/* Quick Filters Bar */}
          <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
            <Select
              value={filters.category || "all"}
              onValueChange={(v) => updateFilter("category", v)}
            >
              <SelectTrigger className="w-[140px] shrink-0">
                <Car className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filter Vehicles</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Category */}
                  <div className="space-y-3">
                    <Label>Vehicle Type</Label>
                    <Select
                      value={localFilters.category}
                      onValueChange={(v) =>
                        setLocalFilters((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transmission */}
                  <div className="space-y-3">
                    <Label>Transmission</Label>
                    <Select
                      value={localFilters.transmission}
                      onValueChange={(v) =>
                        setLocalFilters((f) => ({ ...f, transmission: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-3">
                    <Label>Fuel Type</Label>
                    <Select
                      value={localFilters.fuelType}
                      onValueChange={(v) =>
                        setLocalFilters((f) => ({ ...f, fuelType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>
                      Daily Price: ${localFilters.priceRange[0]} - $
                      {localFilters.priceRange[1]}+
                    </Label>
                    <Slider
                      value={localFilters.priceRange}
                      onValueChange={(v) =>
                        setLocalFilters((f) => ({
                          ...f,
                          priceRange: v as [number, number],
                        }))
                      }
                      min={0}
                      max={500}
                      step={10}
                    />
                  </div>

                  {/* Instant Book */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Instant Book Only</Label>
                      <p className="text-sm text-muted-foreground">
                        Skip the approval wait
                      </p>
                    </div>
                    <Switch
                      checked={localFilters.instantBook}
                      onCheckedChange={(v) =>
                        setLocalFilters((f) => ({ ...f, instantBook: v }))
                      }
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearFilters}
                    >
                      Clear All
                    </Button>
                    <Button className="flex-1" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Active filter chips */}
            {filters.instantBook && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => updateFilter("instant_book", false)}
              >
                <Zap className="w-3 h-3" />
                Instant Book
                <X className="w-3 h-3" />
              </Badge>
            )}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} filters={filters} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Car className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search location
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function VehicleCard({
  vehicle,
  filters,
}: {
  vehicle: NonNullable<ReturnType<typeof useP2PVehicleSearch>["data"]>[0];
  filters: P2PSearchFilters;
}) {
  const images = (vehicle.images as string[]) || [];
  const primaryImage = images[0] || "/placeholder.svg";

  // Build link with search params preserved
  const linkParams = new URLSearchParams();
  if (filters.pickupDate) linkParams.set("pickup_date", filters.pickupDate);
  if (filters.returnDate) linkParams.set("return_date", filters.returnDate);

  return (
    <Link to={`/p2p/vehicle/${vehicle.id}?${linkParams.toString()}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={primaryImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {vehicle.instant_book && (
            <Badge className="absolute top-3 left-3 bg-emerald-500 text-white gap-1">
              <Zap className="w-3 h-3" />
              Instant
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 capitalize"
          >
            {vehicle.category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            {vehicle.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{vehicle.rating.toFixed(1)}</span>
                {vehicle.total_trips && (
                  <span className="text-muted-foreground/70">
                    ({vehicle.total_trips} trips)
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {vehicle.location_city}, {vehicle.location_state}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {vehicle.seats && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {vehicle.seats}
              </div>
            )}
            {vehicle.transmission && (
              <div className="flex items-center gap-1">
                <Settings2 className="w-3.5 h-3.5" />
                <span className="capitalize">{vehicle.transmission}</span>
              </div>
            )}
            {vehicle.fuel_type && (
              <div className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5" />
                <span className="capitalize">{vehicle.fuel_type}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold">${vehicle.daily_rate}</span>
              <span className="text-muted-foreground">/day</span>
            </div>
            <Button size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
