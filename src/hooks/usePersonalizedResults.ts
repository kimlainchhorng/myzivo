/**
 * Personalized Results Hook
 * Applies AI personalization scoring to search results
 */

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalizationSettings } from "./usePersonalizationSettings";
import { useSavedSearches } from "./useSavedSearches";
import {
  PersonalizationScore,
  PersonalizationContext,
  ServiceType,
} from "@/types/personalization";

interface PersonalizableItem {
  id: string;
  price?: number;
  rating?: number;
  distance?: number;
  freeCancellation?: boolean;
  [key: string]: unknown;
}

// Scoring weights
const WEIGHTS = {
  price: 0.3,
  rating: 0.25,
  affinity: 0.2,
  distance: 0.15,
  flexibility: 0.1,
};

export function usePersonalizedResults<T extends PersonalizableItem>(
  items: T[],
  serviceType: ServiceType,
  userLocation?: { lat: number; lng: number }
) {
  const { user } = useAuth();
  const { settings } = usePersonalizationSettings();
  const { searches } = useSavedSearches(serviceType);

  // Build personalization context
  const context = useMemo((): PersonalizationContext => {
    return {
      user_id: user?.id,
      location: userLocation,
      past_bookings: [], // Would be loaded from bookings table
      past_searches: searches.map((s) => s.search_params),
      device_type: getDeviceType(),
      is_new_user: !user,
    };
  }, [user, userLocation, searches]);

  // Calculate personalization score for an item
  const calculateScore = (item: T): PersonalizationScore => {
    let priceScore = 50; // Default
    let ratingScore = 50;
    let affinityScore = 50;
    let distanceScore = 50;
    let flexibilityScore = 50;

    // Price score (lower is better, invert)
    if (item.price !== undefined) {
      // Normalize price to 0-100 (assuming $0-$500 range for most items)
      const normalizedPrice = Math.min(item.price / 500, 1);
      priceScore = (1 - normalizedPrice) * 100;
    }

    // Rating score (higher is better)
    if (item.rating !== undefined) {
      // Normalize rating (assuming 0-10 or 0-5 scale)
      const normalizedRating = item.rating > 5 ? item.rating / 10 : item.rating / 5;
      ratingScore = normalizedRating * 100;
    }

    // Distance score (closer is better)
    if (item.distance !== undefined && userLocation) {
      // Normalize distance (assuming 0-50km range)
      const normalizedDistance = Math.min(item.distance / 50, 1);
      distanceScore = (1 - normalizedDistance) * 100;
    }

    // Flexibility score (free cancellation = high)
    if (item.freeCancellation !== undefined) {
      flexibilityScore = item.freeCancellation ? 100 : 30;
    }

    // Affinity score based on past searches
    // Check if item matches patterns from past searches
    const pastSearchDestinations = context.past_searches
      .map((s) => s.destination?.toLowerCase())
      .filter(Boolean);

    // Simple affinity: boost items that match past search patterns
    // In production, this would be more sophisticated
    affinityScore = 50; // Default

    // Calculate weighted final score
    const finalScore =
      priceScore * WEIGHTS.price +
      ratingScore * WEIGHTS.rating +
      affinityScore * WEIGHTS.affinity +
      distanceScore * WEIGHTS.distance +
      flexibilityScore * WEIGHTS.flexibility;

    return {
      item_id: item.id,
      base_score: 50,
      price_score: priceScore,
      rating_score: ratingScore,
      affinity_score: affinityScore,
      distance_score: distanceScore,
      flexibility_score: flexibilityScore,
      final_score: finalScore,
    };
  };

  // Apply personalization to items
  const personalizedItems = useMemo(() => {
    if (!settings.personalization_enabled) {
      return items.map((item) => ({
        ...item,
        personalizationScore: null,
      }));
    }

    // Calculate scores and sort
    const scoredItems = items.map((item) => ({
      ...item,
      personalizationScore: calculateScore(item),
    }));

    // Sort by personalization score (highest first)
    return scoredItems.sort(
      (a, b) =>
        (b.personalizationScore?.final_score || 0) -
        (a.personalizationScore?.final_score || 0)
    );
  }, [items, settings.personalization_enabled, context]);

  // Get top recommendations
  const topRecommendations = useMemo(() => {
    return personalizedItems.slice(0, 3);
  }, [personalizedItems]);

  return {
    personalizedItems,
    topRecommendations,
    context,
    isPersonalized: settings.personalization_enabled,
  };
}

// Helper to detect device type
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
