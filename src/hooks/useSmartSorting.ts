/**
 * Smart Sorting Hook
 * AI-weighted sorting for search results
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartSortRule, ServiceType, ScoringWeights } from "@/types/personalization";
import { useMemo } from "react";

const QUERY_KEY = "smart-sort-rules";

export function useSmartSorting(serviceType: ServiceType) {
  // Fetch sort rules for service type
  const { data: rules = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, serviceType],
    queryFn: async (): Promise<SmartSortRule[]> => {
      const { data, error } = await supabase
        .from("smart_sort_rules")
        .select("*")
        .eq("service_type", serviceType)
        .eq("is_active", true)
        .order("is_default", { ascending: false });

      if (error) {
        console.error("Error fetching sort rules:", error);
        return [];
      }

      return (data || []).map((rule) => ({
        id: rule.id,
        service_type: rule.service_type as ServiceType,
        rule_name: rule.rule_name,
        rule_key: rule.rule_key,
        description: rule.description,
        scoring_weights: rule.scoring_weights as ScoringWeights,
        is_default: rule.is_default,
        is_active: rule.is_active,
        created_at: rule.created_at,
        updated_at: rule.updated_at,
      }));
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Get sort options for UI
  const sortOptions = useMemo(() => {
    return rules.map((rule) => ({
      value: rule.rule_key,
      label: rule.rule_name,
      description: rule.description,
    }));
  }, [rules]);

  // Get default sort key
  const defaultSortKey = useMemo(() => {
    const defaultRule = rules.find((r) => r.is_default);
    return defaultRule?.rule_key || "best_value";
  }, [rules]);

  // Calculate weighted score for an item
  const calculateScore = <T extends Record<string, unknown>>(
    item: T,
    weights: ScoringWeights,
    fieldMappings: Record<string, string>
  ): number => {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([factor, weight]) => {
      if (weight === undefined || weight === 0) return;

      const field = fieldMappings[factor];
      if (!field) return;

      const value = item[field];
      if (typeof value !== "number") return;

      // Normalize value (0-100 scale)
      let normalizedValue = value;

      // Invert for price (lower is better)
      if (factor === "price") {
        normalizedValue = 100 - Math.min(value / 10, 100); // Assume max price ~$1000
      }

      // Rating is already 0-10 or 0-5
      if (factor === "rating") {
        normalizedValue = (value / 10) * 100;
      }

      // Duration - lower is better (invert)
      if (factor === "duration") {
        normalizedValue = 100 - Math.min(value / 24, 100); // Assume max 24 hours
      }

      // Stops - lower is better (invert)
      if (factor === "stops") {
        normalizedValue = 100 - (value * 20); // 0 stops = 100, 5 stops = 0
      }

      totalScore += normalizedValue * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  // Sort items by rule key
  const sortItems = <T extends Record<string, unknown>>(
    items: T[],
    ruleKey: string,
    fieldMappings: Record<string, string>
  ): T[] => {
    const rule = rules.find((r) => r.rule_key === ruleKey);
    if (!rule) return items;

    const weights = rule.scoring_weights;

    return [...items].sort((a, b) => {
      const scoreA = calculateScore(a, weights, fieldMappings);
      const scoreB = calculateScore(b, weights, fieldMappings);
      return scoreB - scoreA; // Higher score first
    });
  };

  return {
    rules,
    sortOptions,
    defaultSortKey,
    isLoading,
    sortItems,
    calculateScore,
  };
}

// Pre-defined field mappings for each service type
export const FIELD_MAPPINGS = {
  hotels: {
    price: "pricePerNight",
    rating: "guestRating",
    reviews: "reviewCount",
    cancellation: "freeCancellation",
    bookings: "bookingCount",
    affinity: "affinityScore",
  },
  flights: {
    price: "totalPrice",
    duration: "durationMinutes",
    stops: "stops",
    rating: "airlineRating",
  },
  cars: {
    price: "pricePerDay",
    rating: "rating",
    features: "featureScore",
    bookings: "bookingCount",
  },
  activities: {
    price: "price",
    rating: "rating",
    reviews: "reviewCount",
  },
  transfers: {
    price: "price",
    rating: "rating",
    vehicle: "vehicleScore",
  },
};
