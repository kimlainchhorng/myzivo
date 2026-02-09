/**
 * Hook to fetch active promotions for restaurants
 * Supports single restaurant or batch (all active eats promos)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RestaurantPromo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: string | null;
  discount_value: number;
  min_order_amount: number | null;
  merchant_id: string | null;
  ends_at: string | null;
  starts_at: string | null;
}

export interface PromoBadge {
  label: string;
  type: "discount" | "free_delivery" | "limited";
}

function generateBadges(promos: RestaurantPromo[]): PromoBadge[] {
  const badges: PromoBadge[] = [];
  const now = Date.now();
  const fortyEightHours = 48 * 60 * 60 * 1000;

  for (const p of promos) {
    if (badges.length >= 2) break;

    if (p.discount_type === "free_delivery") {
      badges.push({ label: "Free Delivery", type: "free_delivery" });
    } else if (p.discount_type === "percent") {
      badges.push({ label: `${p.discount_value}% OFF`, type: "discount" });
    } else if (p.discount_type === "fixed") {
      badges.push({ label: `$${p.discount_value} OFF`, type: "discount" });
    }
  }

  // Check if any promo ends within 48h
  if (badges.length < 2) {
    const hasLimited = promos.some(
      (p) => p.ends_at && new Date(p.ends_at).getTime() - now < fortyEightHours
    );
    if (hasLimited) {
      badges.push({ label: "Limited time deal", type: "limited" });
    }
  }

  return badges;
}

/** Fetch all active eats promos (batch for listing page) */
export function useAllEatsPromotions() {
  return useQuery({
    queryKey: ["eats-promotions-all"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promotions")
        .select("id, code, name, description, discount_type, discount_value, min_order_amount, merchant_id, ends_at, starts_at")
        .eq("is_active", true)
        .contains("applicable_services", ["eats"])
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`);

      if (error) throw error;
      return (data || []) as RestaurantPromo[];
    },
    staleTime: 60_000,
  });
}

/** Group promos by merchant_id, with null merchant_id treated as global */
export function usePromoBadgesByRestaurant() {
  const { data: allPromos, isLoading } = useAllEatsPromotions();

  const promosByRestaurant = new Map<string, PromoBadge[]>();

  if (allPromos) {
    // Group by merchant_id
    const grouped = new Map<string | null, RestaurantPromo[]>();
    for (const p of allPromos) {
      const key = p.merchant_id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    }

    // Global promos (merchant_id = null)
    const globalPromos = grouped.get(null) || [];

    // For each merchant, combine merchant-specific + global
    for (const [merchantId, merchantPromos] of grouped) {
      if (merchantId === null) continue;
      const combined = [...merchantPromos, ...globalPromos];
      promosByRestaurant.set(merchantId, generateBadges(combined));
    }

    // Store global badges for restaurants without specific promos
    if (globalPromos.length > 0) {
      promosByRestaurant.set("__global__", generateBadges(globalPromos));
    }
  }

  const getBadges = (restaurantId: string): PromoBadge[] => {
    return promosByRestaurant.get(restaurantId) || promosByRestaurant.get("__global__") || [];
  };

  return { getBadges, isLoading };
}

/** Fetch promos for a single restaurant (menu page) */
export function useRestaurantPromotions(restaurantId?: string) {
  return useQuery({
    queryKey: ["restaurant-promotions", restaurantId],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Fetch merchant-specific + global promos
      const { data, error } = await supabase
        .from("promotions")
        .select("id, code, name, description, discount_type, discount_value, min_order_amount, merchant_id, ends_at, starts_at")
        .eq("is_active", true)
        .contains("applicable_services", ["eats"])
        .or(`merchant_id.eq.${restaurantId},merchant_id.is.null`)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`);

      if (error) throw error;
      return (data || []) as RestaurantPromo[];
    },
    enabled: !!restaurantId,
    staleTime: 60_000,
  });
}
