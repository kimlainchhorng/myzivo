/**
 * Hotelbeds Hotels Search Hook
 * Provides hotel search functionality using Hotelbeds API
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  HotelSearchParams,
  HotelSearchResponse,
  ZivoHotel,
  ZivoRoom,
  ZivoRate,
  HotelbedsHotel,
  HotelbedsApiResponse,
} from "@/types/hotelbeds";

const HOTELBEDS_HOTELS_FUNCTION = "hotelbeds-hotels";

// Transform Hotelbeds hotel to ZIVO format
function transformHotel(hotel: HotelbedsHotel, nights: number): ZivoHotel {
  const categoryToStars: Record<string, number> = {
    "1EST": 1, "2EST": 2, "3EST": 3, "4EST": 4, "5EST": 5,
    "1LL": 1, "2LL": 2, "3LL": 3, "4LL": 4, "5LL": 5,
  };
  
  const stars = categoryToStars[hotel.categoryCode] || 3;
  
  // Transform rooms
  const rooms: ZivoRoom[] = hotel.rooms.map(room => ({
    code: room.code,
    name: room.name,
    rates: room.rates.map(rate => {
      const netPrice = parseFloat(rate.net);
      const hasCancellation = rate.cancellationPolicies?.some(
        policy => new Date(policy.from) > new Date()
      );
      
      return {
        rateKey: rate.rateKey,
        price: netPrice,
        pricePerNight: netPrice / nights,
        nights,
        currency: hotel.currency,
        boardType: rate.boardCode,
        boardName: rate.boardName,
        paymentType: rate.paymentType === "AT_WEB" ? "prepaid" : "pay_at_hotel",
        requiresRecheck: rate.rateType === "RECHECK",
        freeCancellation: hasCancellation || false,
        cancellationDeadline: rate.cancellationPolicies?.[0]?.from,
        taxes: rate.taxes?.reduce((sum, tax) => sum + parseFloat(tax.amount || "0"), 0),
      } as ZivoRate;
    }),
  }));

  // Get base image URL from Hotelbeds
  const baseImageUrl = "https://photos.hotelbeds.com/giata";
  const images = hotel.images?.map(img => `${baseImageUrl}/${img.path}`) || [];
  
  return {
    id: `hb-${hotel.code}`,
    code: hotel.code,
    name: hotel.name,
    stars,
    starsLabel: `${stars} Star`,
    destination: hotel.destinationName,
    zone: hotel.zoneName,
    latitude: parseFloat(hotel.latitude),
    longitude: parseFloat(hotel.longitude),
    imageUrl: images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    images,
    minPrice: hotel.minRate,
    maxPrice: hotel.maxRate,
    currency: hotel.currency,
    rooms,
    facilities: hotel.facilities?.map(f => f.description).filter(Boolean) || [],
    reviewScore: hotel.reviews?.[0]?.rate,
    reviewCount: hotel.reviews?.[0]?.reviewCount,
  };
}

export interface HotelSearchFilters {
  priceRange: [number, number];
  starRating: number[];
  boardTypes: string[];
  refundableOnly: boolean;
}

const defaultFilters: HotelSearchFilters = {
  priceRange: [0, 1000],
  starRating: [],
  boardTypes: [],
  refundableOnly: false,
};

export function useHotelbedsSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ZivoHotel[]>([]);
  const [searchParams, setSearchParams] = useState<HotelSearchParams | null>(null);
  const [filters, setFilters] = useState<HotelSearchFilters>(defaultFilters);

  // Calculate nights between dates
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Search hotels
  const search = useCallback(async (params: HotelSearchParams): Promise<ZivoHotel[]> => {
    setIsLoading(true);
    setError(null);
    setSearchParams(params);

    try {
      const nights = calculateNights(params.checkIn, params.checkOut);
      
      // Build occupancies with child ages
      const paxes: Array<{ type: string; age?: number }> = [];
      for (let i = 0; i < params.adults; i++) {
        paxes.push({ type: "AD" });
      }
      if (params.childAges) {
        for (const age of params.childAges) {
          paxes.push({ type: "CH", age });
        }
      } else {
        for (let i = 0; i < params.children; i++) {
          paxes.push({ type: "CH", age: 10 });
        }
      }

      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<HotelSearchResponse>>(
        HOTELBEDS_HOTELS_FUNCTION,
        {
          body: {
            action: "search",
            stay: {
              checkIn: params.checkIn,
              checkOut: params.checkOut,
            },
            occupancies: [{
              rooms: params.rooms,
              adults: params.adults,
              children: params.children,
              paxes,
            }],
            destination: {
              code: params.destination,
            },
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Search failed");

      const hotels = data.data?.hotels?.hotels || [];
      const transformedHotels = hotels.map(hotel => transformHotel(hotel, nights));
      
      setResults(transformedHotels);
      return transformedHotels;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      setError(message);
      setResults([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters to results
  const applyFilters = useCallback((newFilters: Partial<HotelSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get filtered results
  const getFilteredResults = useCallback((): ZivoHotel[] => {
    return results.filter(hotel => {
      // Price filter
      if (hotel.minPrice < filters.priceRange[0] || hotel.minPrice > filters.priceRange[1]) {
        return false;
      }
      
      // Star rating filter
      if (filters.starRating.length > 0 && !filters.starRating.includes(hotel.stars)) {
        return false;
      }
      
      // Board type filter
      if (filters.boardTypes.length > 0) {
        const hotelBoardTypes = hotel.rooms.flatMap(r => r.rates.map(rate => rate.boardType));
        const hasMatchingBoard = filters.boardTypes.some(bt => hotelBoardTypes.includes(bt));
        if (!hasMatchingBoard) return false;
      }
      
      // Refundable filter
      if (filters.refundableOnly) {
        const hasRefundable = hotel.rooms.some(r => r.rates.some(rate => rate.freeCancellation));
        if (!hasRefundable) return false;
      }
      
      return true;
    });
  }, [results, filters]);

  // Check API status
  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke(
        HOTELBEDS_HOTELS_FUNCTION,
        { body: { action: "status" } }
      );
      
      if (fetchError) return false;
      return data?.success === true;
    } catch {
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    results,
    filteredResults: getFilteredResults(),
    searchParams,
    filters,
    search,
    applyFilters,
    checkStatus,
  };
}
