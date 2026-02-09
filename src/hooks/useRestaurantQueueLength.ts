/**
 * useRestaurantQueueLength Hook
 * Fetches active order count for a restaurant and calculates queue wait time
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EATS_TABLES } from "@/lib/eatsTables";

export interface RestaurantQueueResult {
  queueLength: number;
  queueWaitMinutes: number;
  isHighVolume: boolean;
  isVeryHighVolume: boolean;
  queueMessage: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Active order statuses that contribute to queue
const ACTIVE_STATUSES = ["placed", "confirmed", "preparing", "ready"] as const;

// Weight factors for different order statuses
const STATUS_WEIGHTS: Record<string, number> = {
  placed: 1.0,      // Full prep time remaining
  confirmed: 0.8,   // 80% of prep time remaining
  preparing: 0.5,   // 50% of prep time remaining
  ready: 0,         // No cooking wait, just pickup
};

// Thresholds
const HIGH_VOLUME_THRESHOLD = 3;
const VERY_HIGH_VOLUME_THRESHOLD = 6;

// Default prep time if not available
const DEFAULT_PREP_MINUTES = 20;

export function useRestaurantQueueLength(
  restaurantId: string | undefined,
  avgPrepMinutes: number = DEFAULT_PREP_MINUTES
): RestaurantQueueResult {
  const [result, setResult] = useState<RestaurantQueueResult>({
    queueLength: 0,
    queueWaitMinutes: 0,
    isHighVolume: false,
    isVeryHighVolume: false,
    queueMessage: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!restaurantId) {
      setResult((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let cancelled = false;

    async function fetchQueueLength() {
      try {
        // Fetch active orders for this restaurant
        const { data, error } = await supabase
          .from(EATS_TABLES.orders)
          .select("id, status")
          .eq("restaurant_id", restaurantId)
          .in("status", ACTIVE_STATUSES);

        if (cancelled) return;

        if (error) throw error;

        const orders = data || [];
        const queueLength = orders.length;

        // Calculate weighted queue wait time
        let queueWaitMinutes = 0;
        for (const order of orders) {
          const weight = STATUS_WEIGHTS[order.status] || 0;
          queueWaitMinutes += avgPrepMinutes * weight;
        }

        // Round to nearest minute
        queueWaitMinutes = Math.round(queueWaitMinutes);

        // Determine volume level
        const isHighVolume = queueLength >= HIGH_VOLUME_THRESHOLD;
        const isVeryHighVolume = queueLength >= VERY_HIGH_VOLUME_THRESHOLD;

        // Generate queue message
        let queueMessage: string | null = null;
        if (isVeryHighVolume) {
          queueMessage = "Very high demand — expect extended wait times.";
        } else if (isHighVolume) {
          queueMessage = "High order volume — preparation may take longer.";
        }

        setResult({
          queueLength,
          queueWaitMinutes,
          isHighVolume,
          isVeryHighVolume,
          queueMessage,
          isLoading: false,
          error: null,
        });
      } catch (e) {
        if (cancelled) return;
        setResult((prev) => ({
          ...prev,
          isLoading: false,
          error: e as Error,
        }));
      }
    }

    fetchQueueLength();

    // Refresh every 30 seconds
    const interval = setInterval(fetchQueueLength, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [restaurantId, avgPrepMinutes]);

  return result;
}
