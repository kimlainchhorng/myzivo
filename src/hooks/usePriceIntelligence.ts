/**
 * Price Intelligence Hook
 * Fetches deal scores and badges for items
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  PriceIntelligence,
  DealInfo,
  DealBadgeType,
  ServiceType,
} from "@/types/personalization";

const QUERY_KEY = "price-intelligence";

// Thresholds for badge determination
const DEAL_THRESHOLDS = {
  great_deal: 20, // 20%+ below historical avg
  good_deal: 10,  // 10%+ below historical avg
};

export function usePriceIntelligence(
  serviceType: ServiceType,
  itemId: string,
  currentPrice?: number
) {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, serviceType, itemId],
    queryFn: async (): Promise<PriceIntelligence | null> => {
      const { data, error } = await supabase
        .from("price_intelligence_cache")
        .select("*")
        .eq("service_type", serviceType)
        .eq("item_id", itemId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching price intelligence:", error);
        return null;
      }

      return data as PriceIntelligence | null;
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Calculate deal info
  const getDealInfo = (): DealInfo => {
    const priceToCheck = currentPrice ?? data?.current_price;
    
    if (!data || !priceToCheck || !data.historical_avg) {
      return { badge: null, score: 0 };
    }

    const savingsPercent = ((data.historical_avg - priceToCheck) / data.historical_avg) * 100;
    
    let badge: DealBadgeType = null;
    let score = 50; // Default score
    let message: string | undefined;

    // Price-based badges
    if (savingsPercent >= DEAL_THRESHOLDS.great_deal) {
      badge = "great_deal";
      score = 90;
      message = `${Math.round(savingsPercent)}% below average`;
    } else if (savingsPercent >= DEAL_THRESHOLDS.good_deal) {
      badge = "good_deal";
      score = 75;
      message = `${Math.round(savingsPercent)}% below average`;
    }

    // Urgency-based badges (override if more important)
    if (data.availability_level === "limited" && !badge) {
      badge = "limited_availability";
      score = 70;
      message = "Only a few left";
    } else if (data.demand_level === "very_high" && !badge) {
      badge = "high_demand";
      score = 65;
      message = "Booking fast";
    }

    return {
      badge,
      score,
      savings_percent: savingsPercent > 0 ? Math.round(savingsPercent) : undefined,
      message,
    };
  };

  return {
    priceIntelligence: data,
    isLoading,
    dealInfo: getDealInfo(),
  };
}

// Batch fetch for multiple items
export function useBatchPriceIntelligence(
  serviceType: ServiceType,
  itemIds: string[]
) {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, serviceType, "batch", itemIds.join(",")],
    queryFn: async (): Promise<Map<string, PriceIntelligence>> => {
      if (!itemIds.length) return new Map();

      const { data, error } = await supabase
        .from("price_intelligence_cache")
        .select("*")
        .eq("service_type", serviceType)
        .in("item_id", itemIds);

      if (error) {
        console.error("Error fetching batch price intelligence:", error);
        return new Map();
      }

      const map = new Map<string, PriceIntelligence>();
      (data as PriceIntelligence[]).forEach((item) => {
        map.set(item.item_id, item);
      });

      return map;
    },
    enabled: itemIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return { priceIntelligenceMap: data || new Map(), isLoading };
}
