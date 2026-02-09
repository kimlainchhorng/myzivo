import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSpendingStats } from "./useSpendingStats";
import { useMembershipSavings } from "./useMembershipSavings";

export interface ActivityInsights {
  ordersThisMonth: number;
  favoriteRestaurant: { name: string; orderCount: number } | null;
  totalSaved: number;
  membershipSaved: number;
  promoSaved: number;
  isLoading: boolean;
}

export function useActivityInsights(): ActivityInsights {
  const { user } = useAuth();
  const spending = useSpendingStats();
  const { data: membership, isLoading: membershipLoading } = useMembershipSavings();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Favorite restaurant query
  const { data: favoriteRestaurant, isLoading: favLoading } = useQuery({
    queryKey: ["activity-favorite-restaurant", user?.id, monthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select("restaurant_id, restaurant:restaurants(name)")
        .eq("customer_id", user!.id)
        .eq("status", "delivered")
        .gte("created_at", monthStart.toISOString());

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const counts: Record<string, { name: string; count: number }> = {};
      data.forEach((o: any) => {
        const id = o.restaurant_id;
        if (!id) return;
        if (!counts[id]) {
          counts[id] = { name: (o.restaurant as any)?.name || "Unknown", count: 0 };
        }
        counts[id].count++;
      });

      let best: { name: string; orderCount: number } | null = null;
      for (const entry of Object.values(counts)) {
        if (!best || entry.count > best.orderCount) {
          best = { name: entry.name, orderCount: entry.count };
        }
      }
      return best;
    },
    enabled: !!user?.id,
  });

  // Promo savings query
  const { data: promoSaved = 0, isLoading: promoLoading } = useQuery({
    queryKey: ["activity-promo-savings", user?.id, monthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select("discount_amount")
        .eq("customer_id", user!.id)
        .eq("status", "delivered")
        .gte("created_at", monthStart.toISOString());

      if (error) throw error;
      return data?.reduce((sum, o) => sum + (Number(o.discount_amount) || 0), 0) || 0;
    },
    enabled: !!user?.id,
  });

  const membershipSaved = membership?.thisMonthDollars ?? 0;
  const totalSaved = membershipSaved + promoSaved;

  return {
    ordersThisMonth: spending.thisMonth.orderCount,
    favoriteRestaurant: favoriteRestaurant ?? null,
    totalSaved,
    membershipSaved,
    promoSaved,
    isLoading: spending.isLoading || membershipLoading || favLoading || promoLoading,
  };
}
