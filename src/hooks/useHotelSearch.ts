/**
 * Hotel Search Hook (Legacy compatibility wrapper)
 * Returns empty results — ready for real API integration
 */

import { useState, useCallback } from "react";
import { HotelResult } from "@/components/hotels/HotelResultCard";
import { HotelFilters } from "@/components/hotels/HotelFilters";

// Legacy interface for backward compatibility
export interface LegacyHotelSearchParams {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
}

function filterHotels(hotels: HotelResult[], filters: HotelFilters): HotelResult[] {
  return hotels.filter(hotel => {
    // Price filter
    if (hotel.pricePerNight < filters.priceRange[0] || hotel.pricePerNight > filters.priceRange[1]) {
      return false;
    }
    
    // Star rating filter
    if (filters.starRating.length > 0 && !filters.starRating.includes(hotel.starRating)) {
      return false;
    }
    
    // Guest rating filter
    if (filters.guestRating && hotel.guestRating < filters.guestRating) {
      return false;
    }
    
    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(a => hotel.amenities.includes(a));
      if (!hasAllAmenities) return false;
    }
    
    // Distance filter
    if (filters.distance && hotel.distanceFromCenter > filters.distance) {
      return false;
    }
    
    return true;
  });
}

/**
 * @deprecated Use useRealHotelSearch instead
 */
export function useHotelSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<HotelResult[]>([]);
  const [searchParams, setSearchParams] = useState<LegacyHotelSearchParams | null>(null);

  const search = useCallback(async (params: LegacyHotelSearchParams, filters: HotelFilters) => {
    setIsLoading(true);
    setSearchParams(params);
    
    // Deprecated — real search handled by useRealHotelSearch (Booking.com affiliate)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filteredHotels = filterHotels([], filters);
    
    // Sort by rating
    filteredHotels.sort((a, b) => b.guestRating - a.guestRating);
    
    setResults(filteredHotels);
    setIsLoading(false);
    
    return filteredHotels;
  }, []);

  const applyFilters = useCallback((filters: HotelFilters) => {
    if (!searchParams) return;
    
    const filteredHotels = filterHotels([], filters);
    filteredHotels.sort((a, b) => b.guestRating - a.guestRating);
    setResults(filteredHotels);
  }, [searchParams]);

  return {
    isLoading,
    results,
    searchParams,
    search,
    applyFilters,
  };
}
