/**
 * useOrderBasedTier — Computes loyalty tier from completed order count.
 * Returns the order-based tier, progress info, and the effective ZIVO tier
 * (best of points-based vs order-based).
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOrderTier,
  getNextOrderTier,
  higherTier,
  type OrderTier,
} from "@/config/loyaltyTiers";
import type { ZivoTier } from "@/config/zivoPoints";

export interface OrderBasedTierResult {
  tier: OrderTier;
  orderCount: number;
  progress: number; // 0-100
  ordersToNext: number | null;
  nextTierName: string | null;
  effectiveTier: ZivoTier;
  isLoading: boolean;
}

export function useOrderBasedTier(
  pointsBasedTier: ZivoTier = "explorer"
): OrderBasedTierResult {
  const { user } = useAuth();

  const { data: orderCount = 0, isLoading } = useQuery({
    queryKey: ["loyalty-order-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("food_orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user!.id)
        .eq("status", "delivered");
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  const tier = getOrderTier(orderCount);
  const nextTier = getNextOrderTier(tier);

  let progress = 100;
  let ordersToNext: number | null = null;
  let nextTierName: string | null = null;

  if (nextTier) {
    const range = nextTier.minOrders - tier.minOrders;
    const done = orderCount - tier.minOrders;
    progress = Math.min(100, Math.round((done / range) * 100));
    ordersToNext = nextTier.minOrders - orderCount;
    nextTierName = nextTier.name;
  }

  const effectiveTier = higherTier(pointsBasedTier, tier.zivoTier);

  return {
    tier,
    orderCount,
    progress,
    ordersToNext,
    nextTierName,
    effectiveTier,
    isLoading,
  };
}
