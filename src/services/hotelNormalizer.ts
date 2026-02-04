/**
 * Hotel Result Normalizer Service
 * Transforms supplier-specific hotel data into unified ZIVO format
 * Supports Hotelbeds, TripAdvisor, and mock data
 * 
 * For ZivoProperty unified schema, see: src/services/propertyNormalizer.ts
 */

import {
  NormalizedHotel,
  NormalizedRoom,
  NormalizedRate,
  SupplierCode,
  BOARD_CODES,
} from "@/types/hotels";
import {
  HotelbedsHotel,
  ZivoHotel,
} from "@/types/hotelbeds";
import { HotelResult } from "@/components/hotels/HotelResultCard";

// Re-export ZivoProperty normalizers for convenience
export {
  normalizeHotelbedsToZivoProperty,
  normalizeRateHawkToZivoProperty,
  mergeMultiSourceProperties,
  markCheapestProperties,
} from "./propertyNormalizer";

// ==================== HOTELBEDS NORMALIZER ====================

export function normalizeHotelbedsHotel(
  hotel: HotelbedsHotel,
  nights: number
): NormalizedHotel {
  const categoryToStars: Record<string, number> = {
    "1EST": 1, "2EST": 2, "3EST": 3, "4EST": 4, "5EST": 5,
    "1LL": 1, "2LL": 2, "3LL": 3, "4LL": 4, "5LL": 5,
    "H1": 1, "H2": 2, "H3": 3, "H4": 4, "H5": 5,
  };
  
  const stars = categoryToStars[hotel.categoryCode] || 3;
  const baseImageUrl = "https://photos.hotelbeds.com/giata";
  const images = hotel.images?.map(img => `${baseImageUrl}/${img.path}`) || [];
  
  // Transform rooms
  const rooms: NormalizedRoom[] = hotel.rooms.map(room => ({
    code: room.code,
    name: room.name,
    rates: room.rates.map(rate => {
      const netPrice = parseFloat(rate.net);
      const hasCancellation = rate.cancellationPolicies?.some(
        policy => new Date(policy.from) > new Date()
      );
      
      return {
        rateKey: rate.rateKey,
        totalPrice: netPrice,
        pricePerNight: netPrice / nights,
        nights,
        currency: hotel.currency,
        taxes: rate.taxes?.reduce((sum, tax) => sum + parseFloat(tax.amount || "0"), 0),
        boardCode: rate.boardCode,
        boardName: rate.boardName || BOARD_CODES[rate.boardCode] || rate.boardCode,
        paymentType: rate.paymentType === "AT_WEB" ? "prepaid" : "pay_at_hotel",
        freeCancellation: hasCancellation || false,
        cancellationDeadline: rate.cancellationPolicies?.[0]?.from,
        cancellationPolicies: rate.cancellationPolicies?.map(p => ({
          from: p.from,
          amount: parseFloat(p.amount),
          currency: hotel.currency,
        })),
        allotment: rate.allotment,
        requiresRecheck: rate.rateType === "RECHECK",
        supplierCode: "hotelbeds" as SupplierCode,
        supplierRateId: rate.rateKey,
      } as NormalizedRate;
    }),
  }));

  // Collect board types
  const boardTypes = [...new Set(
    rooms.flatMap(r => r.rates.map(rate => rate.boardCode))
  )];

  // Check payment options
  const allRates = rooms.flatMap(r => r.rates);
  const hasPayAtHotel = allRates.some(r => r.paymentType === "pay_at_hotel");
  const hasPrepaidOnly = allRates.every(r => r.paymentType === "prepaid");
  const hasFreeCancellation = allRates.some(r => r.freeCancellation);

  return {
    id: `hotelbeds-${hotel.code}`,
    supplierCode: "hotelbeds",
    supplierHotelId: String(hotel.code),
    
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
    pricePerNight: hotel.minRate / nights,
    currency: hotel.currency,
    
    rooms,
    
    facilities: hotel.facilities?.map(f => f.description).filter(Boolean) || [],
    boardTypes,
    
    reviewScore: hotel.reviews?.[0]?.rate,
    reviewCount: hotel.reviews?.[0]?.reviewCount,
    
    hasFreeCancellation,
    hasPayAtHotel,
    hasPrepaidOnly,
    
    _raw: hotel,
  };
}

// ==================== ZIVO HOTEL NORMALIZER (from useHotelbedsSearch) ====================

export function normalizeZivoHotel(hotel: ZivoHotel): NormalizedHotel {
  const rooms: NormalizedRoom[] = hotel.rooms.map(room => ({
    code: room.code,
    name: room.name,
    rates: room.rates.map(rate => ({
      rateKey: rate.rateKey,
      totalPrice: rate.price,
      pricePerNight: rate.pricePerNight,
      nights: rate.nights,
      currency: rate.currency,
      taxes: rate.taxes,
      boardCode: rate.boardType,
      boardName: rate.boardName || BOARD_CODES[rate.boardType] || rate.boardType,
      paymentType: rate.paymentType,
      freeCancellation: rate.freeCancellation,
      cancellationDeadline: rate.cancellationDeadline,
      requiresRecheck: rate.requiresRecheck,
      supplierCode: "hotelbeds" as SupplierCode,
      supplierRateId: rate.rateKey,
    })),
  }));

  const boardTypes = [...new Set(
    rooms.flatMap(r => r.rates.map(rate => rate.boardCode))
  )];

  const allRates = rooms.flatMap(r => r.rates);
  const hasPayAtHotel = allRates.some(r => r.paymentType === "pay_at_hotel");
  const hasPrepaidOnly = allRates.every(r => r.paymentType === "prepaid");
  const hasFreeCancellation = allRates.some(r => r.freeCancellation);

  return {
    id: hotel.id,
    supplierCode: "hotelbeds",
    supplierHotelId: String(hotel.code),
    
    name: hotel.name,
    stars: hotel.stars,
    starsLabel: hotel.starsLabel,
    
    destination: hotel.destination,
    zone: hotel.zone,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    
    imageUrl: hotel.imageUrl,
    images: hotel.images,
    
    minPrice: hotel.minPrice,
    maxPrice: hotel.maxPrice,
    pricePerNight: hotel.minPrice / (allRates[0]?.nights || 1),
    currency: hotel.currency,
    
    rooms,
    
    facilities: hotel.facilities,
    boardTypes,
    
    reviewScore: hotel.reviewScore,
    reviewCount: hotel.reviewCount,
    
    hasFreeCancellation,
    hasPayAtHotel,
    hasPrepaidOnly,
  };
}

// ==================== LEGACY HOTEL RESULT NORMALIZER ====================

export function normalizeLegacyHotelResult(hotel: HotelResult): NormalizedHotel {
  return {
    id: hotel.id,
    supplierCode: "mock",
    supplierHotelId: hotel.id,
    
    name: hotel.name,
    stars: hotel.starRating,
    starsLabel: `${hotel.starRating} Star`,
    
    destination: hotel.area.split(", ").pop() || hotel.area,
    zone: hotel.area.split(", ")[0],
    distanceFromCenter: hotel.distanceFromCenter,
    
    imageUrl: hotel.imageUrl,
    images: [hotel.imageUrl],
    
    minPrice: hotel.pricePerNight,
    pricePerNight: hotel.pricePerNight,
    currency: "USD",
    
    rooms: [{
      code: "STD",
      name: "Standard Room",
      rates: [{
        rateKey: `${hotel.id}-standard`,
        totalPrice: hotel.pricePerNight,
        pricePerNight: hotel.pricePerNight,
        nights: 1,
        currency: "USD",
        boardCode: "RO",
        boardName: "Room Only",
        paymentType: "prepaid",
        freeCancellation: hotel.freeCancellation,
        supplierCode: "mock",
      }],
    }],
    
    facilities: hotel.amenities,
    boardTypes: ["RO"],
    
    reviewScore: hotel.guestRating,
    reviewCount: hotel.reviewCount,
    
    hasFreeCancellation: hotel.freeCancellation,
    hasPayAtHotel: false,
    hasPrepaidOnly: true,
  };
}

// ==================== UNIFIED NORMALIZER ====================

export function normalizeHotelFromAnySource(
  source: "hotelbeds" | "zivo" | "legacy" | "tripadvisor",
  data: unknown,
  nights: number = 1
): NormalizedHotel | null {
  try {
    switch (source) {
      case "hotelbeds":
        return normalizeHotelbedsHotel(data as HotelbedsHotel, nights);
      case "zivo":
        return normalizeZivoHotel(data as ZivoHotel);
      case "legacy":
        return normalizeLegacyHotelResult(data as HotelResult);
      case "tripadvisor":
        return normalizeTripAdvisorHotel(data as TripAdvisorLocation, nights);
      default:
        console.warn(`Unknown hotel source: ${source}`);
        return null;
    }
  } catch (error) {
    console.error(`Error normalizing hotel from ${source}:`, error);
    return null;
  }
}

// ==================== TRIPADVISOR NORMALIZER ====================

interface TripAdvisorLocation {
  location_id: string;
  name: string;
  description?: string;
  web_url?: string;
  address_obj?: {
    street1?: string;
    city?: string;
    state?: string;
    country?: string;
    address_string?: string;
  };
  latitude?: string;
  longitude?: string;
  rating?: string;
  num_reviews?: string;
  price_level?: string;
  amenities?: string[];
  photos?: Array<{
    images?: {
      large?: { url?: string };
      medium?: { url?: string };
      original?: { url?: string };
    };
  }>;
}

export function normalizeTripAdvisorHotel(
  location: TripAdvisorLocation,
  nights: number = 1
): NormalizedHotel {
  // Extract images
  const images = location.photos
    ?.map(p => p.images?.large?.url || p.images?.medium?.url || p.images?.original?.url)
    .filter((url): url is string => Boolean(url)) || [];

  // Convert price level to rough price estimate
  const priceLevelMap: Record<string, number> = {
    "$": 75,
    "$$": 125,
    "$$$": 200,
    "$$$$": 350,
  };
  const estimatedPrice = priceLevelMap[location.price_level || "$$"] || 150;

  // Convert rating (1-5) to review score (0-10)
  const rating = parseFloat(location.rating || "0");
  const reviewScore = rating * 2; // Convert 5-scale to 10-scale

  return {
    id: `tripadvisor-${location.location_id}`,
    supplierCode: "tripadvisor",
    supplierHotelId: location.location_id,
    
    name: location.name,
    description: location.description,
    stars: Math.round(rating) || 3,
    starsLabel: `${Math.round(rating) || 3} Star`,
    
    destination: location.address_obj?.city || "",
    address: location.address_obj?.address_string,
    zone: location.address_obj?.street1,
    latitude: location.latitude ? parseFloat(location.latitude) : undefined,
    longitude: location.longitude ? parseFloat(location.longitude) : undefined,
    
    imageUrl: images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    images,
    
    minPrice: estimatedPrice * nights,
    pricePerNight: estimatedPrice,
    currency: "USD",
    
    rooms: [{
      code: "STD",
      name: "Standard Room",
      rates: [{
        rateKey: `tripadvisor-${location.location_id}-std`,
        totalPrice: estimatedPrice * nights,
        pricePerNight: estimatedPrice,
        nights,
        currency: "USD",
        boardCode: "RO",
        boardName: "Room Only",
        paymentType: "prepaid",
        freeCancellation: false,
        supplierCode: "tripadvisor",
      }],
    }],
    
    facilities: location.amenities || [],
    boardTypes: ["RO"],
    
    reviewScore: reviewScore > 0 ? reviewScore : undefined,
    reviewCount: location.num_reviews ? parseInt(location.num_reviews) : undefined,
    
    hasFreeCancellation: false,
    hasPayAtHotel: false,
    hasPrepaidOnly: true,
    
    _raw: location,
  };
}

// ==================== RESULT MERGER ====================

/**
 * Merge and deduplicate hotel results from multiple suppliers
 * Prioritizes by: availability, price, then supplier preference
 */
export function mergeHotelResults(
  results: NormalizedHotel[][],
  supplierPriority: SupplierCode[] = ["hotelbeds", "ratehawk", "tripadvisor", "mock"]
): NormalizedHotel[] {
  const allHotels = results.flat();
  
  // Group by hotel name + destination (simple dedup)
  const hotelGroups = new Map<string, NormalizedHotel[]>();
  
  for (const hotel of allHotels) {
    const key = `${hotel.name.toLowerCase()}-${hotel.destination.toLowerCase()}`;
    const existing = hotelGroups.get(key) || [];
    existing.push(hotel);
    hotelGroups.set(key, existing);
  }
  
  // For each group, pick the best result
  const merged: NormalizedHotel[] = [];
  
  for (const group of hotelGroups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
    } else {
      // Sort by supplier priority, then by price
      group.sort((a, b) => {
        const priorityA = supplierPriority.indexOf(a.supplierCode);
        const priorityB = supplierPriority.indexOf(b.supplierCode);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        return a.minPrice - b.minPrice;
      });
      
      // Take the best one, but merge rooms from all suppliers
      const best = { ...group[0] };
      
      // Optionally merge rates from other suppliers
      // For now, just use the best supplier's rates
      merged.push(best);
    }
  }
  
  return merged;
}

// ==================== SORTING ====================

export type SortOption = "price_asc" | "price_desc" | "rating" | "stars" | "distance";

export function sortHotels(
  hotels: NormalizedHotel[],
  sortBy: SortOption
): NormalizedHotel[] {
  const sorted = [...hotels];
  
  switch (sortBy) {
    case "price_asc":
      sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
      break;
    case "rating":
      sorted.sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
      break;
    case "stars":
      sorted.sort((a, b) => b.stars - a.stars);
      break;
    case "distance":
      sorted.sort((a, b) => (a.distanceFromCenter || 999) - (b.distanceFromCenter || 999));
      break;
  }
  
  return sorted;
}
