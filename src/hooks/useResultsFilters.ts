/**
 * Unified Results Filters Hook
 * Manages filter state with URL synchronization, debouncing, and UTM preservation
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterChip } from "@/components/results/ActiveFiltersChips";

// Tracking params to preserve during filter updates
const TRACKING_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "creator", "subid"];

// ============= Flight Filters =============
export interface FlightFilters {
  maxPrice: number;
  stops: number[];
  airlines: string[];
  departureTime: string[];
  maxDuration: number;
}

export const defaultFlightFilters: FlightFilters = {
  maxPrice: 5000,
  stops: [],
  airlines: [],
  departureTime: [],
  maxDuration: 24,
};

// ============= Hotel Filters =============
export interface HotelFiltersState {
  priceRange: [number, number];
  starRating: number[];
  guestRating: number | null;
  amenities: string[];
  propertyType: string[];
  distance: number | null;
}

export const defaultHotelFilters: HotelFiltersState = {
  priceRange: [0, 1000],
  starRating: [],
  guestRating: null,
  amenities: [],
  propertyType: [],
  distance: null,
};

// ============= Car Filters =============
export interface CarFiltersState {
  maxPrice: number;
  categories: string[];
  seats: number | null;
  bags: number | null;
  transmission: string[];
  suppliers: string[];
}

export const defaultCarFilters: CarFiltersState = {
  maxPrice: 500,
  categories: [],
  seats: null,
  bags: null,
  transmission: [],
  suppliers: [],
};

// ============= Generic Hook =============
interface UseResultsFiltersOptions<T> {
  defaultFilters: T;
  service: "flights" | "hotels" | "cars";
  filtersToUrl: (filters: T) => Record<string, string>;
  urlToFilters: (params: URLSearchParams) => Partial<T>;
  filtersToChips: (filters: T) => FilterChip[];
  debounceMs?: number;
}

export function useResultsFilters<T>({
  defaultFilters,
  service,
  filtersToUrl,
  urlToFilters,
  filtersToChips,
  debounceMs = 300,
}: UseResultsFiltersOptions<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<T>(() => {
    const urlFilters = urlToFilters(searchParams);
    return { ...defaultFilters, ...urlFilters };
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Convert filters to chips for display
  const chips = useMemo(() => filtersToChips(filters), [filters, filtersToChips]);

  // Count active filters
  const activeCount = chips.length;

  // Check if any filters are active
  const hasActiveFilters = activeCount > 0;

  // Update URL with debounce
  const syncToUrl = useCallback(
    (newFilters: T) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      setIsUpdating(true);

      debounceRef.current = setTimeout(() => {
        const filterParams = filtersToUrl(newFilters);
        const newParams = new URLSearchParams(searchParams);

        // Clear existing filter params (but keep tracking & search params)
        const filterKeys = Object.keys(filtersToUrl(defaultFilters));
        filterKeys.forEach((key) => newParams.delete(key));

        // Add new filter params
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, value);
          }
        });

        setSearchParams(newParams, { replace: true });
        setIsUpdating(false);
      }, debounceMs);
    },
    [searchParams, setSearchParams, filtersToUrl, defaultFilters, debounceMs]
  );

  // Update filters and sync to URL
  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        syncToUrl(updated);
        return updated;
      });
    },
    [syncToUrl]
  );

  // Remove a specific filter by chip ID
  const removeFilter = useCallback(
    (chipId: string) => {
      // Parse chip ID to determine which filter to remove
      const [category, ...valueParts] = chipId.split(":");
      const value = valueParts.join(":");

      setFilters((prev) => {
        const updated = { ...prev };

        switch (service) {
          case "flights": {
            const f = updated as unknown as FlightFilters;
            if (category === "price") f.maxPrice = 5000;
            if (category === "stops") f.stops = f.stops.filter((s) => String(s) !== value);
            if (category === "airline") f.airlines = f.airlines.filter((a) => a !== value);
            if (category === "time") f.departureTime = f.departureTime.filter((t) => t !== value);
            if (category === "duration") f.maxDuration = 24;
            break;
          }
          case "hotels": {
            const f = updated as unknown as HotelFiltersState;
            if (category === "price") f.priceRange = [0, 1000];
            if (category === "stars") f.starRating = f.starRating.filter((s) => String(s) !== value);
            if (category === "rating") f.guestRating = null;
            if (category === "amenity") f.amenities = f.amenities.filter((a) => a !== value);
            if (category === "type") f.propertyType = f.propertyType.filter((t) => t !== value);
            if (category === "distance") f.distance = null;
            break;
          }
          case "cars": {
            const f = updated as unknown as CarFiltersState;
            if (category === "price") f.maxPrice = 500;
            if (category === "category") f.categories = f.categories.filter((c) => c !== value);
            if (category === "seats") f.seats = null;
            if (category === "bags") f.bags = null;
            if (category === "transmission") f.transmission = f.transmission.filter((t) => t !== value);
            if (category === "supplier") f.suppliers = f.suppliers.filter((s) => s !== value);
            break;
          }
        }

        syncToUrl(updated);
        return updated;
      });
    },
    [service, syncToUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    syncToUrl(defaultFilters);
  }, [defaultFilters, syncToUrl]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    filters,
    setFilters: updateFilters,
    chips,
    activeCount,
    hasActiveFilters,
    removeFilter,
    clearFilters,
    isUpdating,
  };
}

// ============= Flight Filters Hook =============
export function useFlightFilters() {
  return useResultsFilters<FlightFilters>({
    defaultFilters: defaultFlightFilters,
    service: "flights",
    filtersToUrl: (filters) => ({
      price_max: filters.maxPrice < 5000 ? String(filters.maxPrice) : "",
      stops: filters.stops.length > 0 ? filters.stops.join(",") : "",
      airline: filters.airlines.length > 0 ? filters.airlines.join(",") : "",
      time: filters.departureTime.length > 0 ? filters.departureTime.join(",") : "",
      duration: filters.maxDuration < 24 ? String(filters.maxDuration) : "",
    }),
    urlToFilters: (params) => ({
      maxPrice: parseInt(params.get("price_max") || "5000", 10),
      stops: params.get("stops")?.split(",").map(Number).filter((n) => !isNaN(n)) || [],
      airlines: params.get("airline")?.split(",").filter(Boolean) || [],
      departureTime: params.get("time")?.split(",").filter(Boolean) || [],
      maxDuration: parseInt(params.get("duration") || "24", 10),
    }),
    filtersToChips: (filters) => {
      const chips: FilterChip[] = [];

      if (filters.maxPrice < 5000) {
        chips.push({ id: "price:max", label: `$${filters.maxPrice}`, category: "Max Price" });
      }

      filters.stops.forEach((stop) => {
        const label = stop === 0 ? "Nonstop" : stop === 1 ? "1 Stop" : "2+ Stops";
        chips.push({ id: `stops:${stop}`, label, category: "Stops" });
      });

      filters.airlines.forEach((code) => {
        chips.push({ id: `airline:${code}`, label: code, category: "Airline" });
      });

      filters.departureTime.forEach((time) => {
        const labels: Record<string, string> = {
          morning: "Morning",
          afternoon: "Afternoon",
          evening: "Evening",
          night: "Night",
        };
        chips.push({ id: `time:${time}`, label: labels[time] || time, category: "Depart" });
      });

      if (filters.maxDuration < 24) {
        chips.push({ id: "duration:max", label: `${filters.maxDuration}h max`, category: "Duration" });
      }

      return chips;
    },
  });
}

// ============= Hotel Filters Hook =============
export function useHotelFilters() {
  return useResultsFilters<HotelFiltersState>({
    defaultFilters: defaultHotelFilters,
    service: "hotels",
    filtersToUrl: (filters) => ({
      price_min: filters.priceRange[0] > 0 ? String(filters.priceRange[0]) : "",
      price_max: filters.priceRange[1] < 1000 ? String(filters.priceRange[1]) : "",
      stars: filters.starRating.length > 0 ? filters.starRating.join(",") : "",
      rating: filters.guestRating ? String(filters.guestRating) : "",
      amenities: filters.amenities.length > 0 ? filters.amenities.join(",") : "",
      type: filters.propertyType.length > 0 ? filters.propertyType.join(",") : "",
      distance: filters.distance ? String(filters.distance) : "",
    }),
    urlToFilters: (params) => ({
      priceRange: [
        parseInt(params.get("price_min") || "0", 10),
        parseInt(params.get("price_max") || "1000", 10),
      ] as [number, number],
      starRating: params.get("stars")?.split(",").map(Number).filter((n) => !isNaN(n)) || [],
      guestRating: parseInt(params.get("rating") || "", 10) || null,
      amenities: params.get("amenities")?.split(",").filter(Boolean) || [],
      propertyType: params.get("type")?.split(",").filter(Boolean) || [],
      distance: parseInt(params.get("distance") || "", 10) || null,
    }),
    filtersToChips: (filters) => {
      const chips: FilterChip[] = [];

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        chips.push({
          id: "price:range",
          label: `$${filters.priceRange[0]}-$${filters.priceRange[1]}`,
          category: "Price",
        });
      }

      filters.starRating.forEach((star) => {
        chips.push({ id: `stars:${star}`, label: `${star}★`, category: "Stars" });
      });

      if (filters.guestRating) {
        chips.push({ id: `rating:${filters.guestRating}`, label: `${filters.guestRating}+`, category: "Rating" });
      }

      filters.amenities.forEach((amenity) => {
        const labels: Record<string, string> = {
          wifi: "WiFi",
          parking: "Parking",
          pool: "Pool",
          breakfast: "Breakfast",
        };
        chips.push({ id: `amenity:${amenity}`, label: labels[amenity] || amenity, category: "Amenity" });
      });

      filters.propertyType.forEach((type) => {
        chips.push({ id: `type:${type}`, label: type.charAt(0).toUpperCase() + type.slice(1), category: "Type" });
      });

      if (filters.distance) {
        chips.push({ id: `distance:${filters.distance}`, label: `${filters.distance}km`, category: "Distance" });
      }

      return chips;
    },
  });
}

// ============= Car Filters Hook =============
export function useCarFilters() {
  return useResultsFilters<CarFiltersState>({
    defaultFilters: defaultCarFilters,
    service: "cars",
    filtersToUrl: (filters) => ({
      price_max: filters.maxPrice < 500 ? String(filters.maxPrice) : "",
      category: filters.categories.length > 0 ? filters.categories.join(",") : "",
      seats: filters.seats ? String(filters.seats) : "",
      bags: filters.bags ? String(filters.bags) : "",
      transmission: filters.transmission.length > 0 ? filters.transmission.join(",") : "",
      supplier: filters.suppliers.length > 0 ? filters.suppliers.join(",") : "",
    }),
    urlToFilters: (params) => ({
      maxPrice: parseInt(params.get("price_max") || "500", 10),
      categories: params.get("category")?.split(",").filter(Boolean) || [],
      seats: parseInt(params.get("seats") || "", 10) || null,
      bags: parseInt(params.get("bags") || "", 10) || null,
      transmission: params.get("transmission")?.split(",").filter(Boolean) || [],
      suppliers: params.get("supplier")?.split(",").filter(Boolean) || [],
    }),
    filtersToChips: (filters) => {
      const chips: FilterChip[] = [];

      if (filters.maxPrice < 500) {
        chips.push({ id: "price:max", label: `$${filters.maxPrice}/day`, category: "Max Price" });
      }

      filters.categories.forEach((cat) => {
        chips.push({ id: `category:${cat}`, label: cat, category: "Type" });
      });

      if (filters.seats) {
        chips.push({ id: `seats:${filters.seats}`, label: `${filters.seats}+ seats`, category: "Seats" });
      }

      if (filters.bags) {
        chips.push({ id: `bags:${filters.bags}`, label: `${filters.bags}+ bags`, category: "Bags" });
      }

      filters.transmission.forEach((trans) => {
        chips.push({ id: `transmission:${trans}`, label: trans, category: "Trans" });
      });

      filters.suppliers.forEach((supplier) => {
        chips.push({ id: `supplier:${supplier}`, label: supplier, category: "Supplier" });
      });

      return chips;
    },
  });
}
