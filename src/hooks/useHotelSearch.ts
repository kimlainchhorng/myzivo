/**
 * Hotel Search Hook
 * Generates mock hotel results for demo
 * Ready for real API integration
 */

import { useState, useCallback } from "react";
import { HotelResult } from "@/components/hotels/HotelResultCard";
import { HotelFilters } from "@/components/hotels/HotelFilters";
import { HotelSearchParams } from "@/components/hotels/HotelSearchForm";

// Mock hotel data generator
function generateMockHotels(destination: string, count: number = 10): HotelResult[] {
  const hotelNames = [
    "Grand Plaza Hotel",
    "The Metropolitan",
    "Sunset Resort & Spa",
    "City Center Inn",
    "Harbor View Suites",
    "Royal Gardens Hotel",
    "The Lexington",
    "Skyline Tower Hotel",
    "Boutique Park Hotel",
    "Ocean Breeze Resort",
    "Downtown Marriott",
    "Hilton Garden Inn",
  ];

  const areas = [
    "Downtown",
    "City Center",
    "Waterfront",
    "Business District",
    "Arts District",
    "Old Town",
    "Near Airport",
    "Beach Area",
  ];

  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=75&fm=webp",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop&q=75&fm=webp",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `hotel-${destination.toLowerCase().replace(/\s+/g, '-')}-${i}`,
    name: hotelNames[i % hotelNames.length],
    area: `${areas[i % areas.length]}, ${destination}`,
    imageUrl: hotelImages[i % hotelImages.length],
    starRating: Math.floor(Math.random() * 2) + 3, // 3-5 stars
    guestRating: 7 + Math.random() * 2.5, // 7.0-9.5
    reviewCount: Math.floor(Math.random() * 2000) + 200,
    pricePerNight: Math.floor(Math.random() * 300) + 80, // $80-$380
    amenities: ["wifi", "parking", "breakfast"].filter(() => Math.random() > 0.4),
    freeCancellation: Math.random() > 0.3,
    distanceFromCenter: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
  }));
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

export function useHotelSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<HotelResult[]>([]);
  const [searchParams, setSearchParams] = useState<HotelSearchParams | null>(null);

  const search = useCallback(async (params: HotelSearchParams, filters: HotelFilters) => {
    setIsLoading(true);
    setSearchParams(params);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock results
    const mockHotels = generateMockHotels(params.destination, 12);
    const filteredHotels = filterHotels(mockHotels, filters);
    
    // Sort by rating
    filteredHotels.sort((a, b) => b.guestRating - a.guestRating);
    
    setResults(filteredHotels);
    setIsLoading(false);
    
    return filteredHotels;
  }, []);

  const applyFilters = useCallback((filters: HotelFilters) => {
    if (!searchParams) return;
    
    const mockHotels = generateMockHotels(searchParams.destination, 12);
    const filteredHotels = filterHotels(mockHotels, filters);
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
