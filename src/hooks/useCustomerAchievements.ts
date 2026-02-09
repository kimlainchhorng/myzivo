/**
 * useCustomerAchievements
 * Fetches badge definitions, user earned badges, and computes progress from order data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  currentValue: number;
  threshold: number;
  claimable: boolean;
  sortOrder: number;
}

const TIER_POINTS: Record<string, number> = {
  bronze: 50,
  silver: 100,
  gold: 250,
};

function computeOrderStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = [...new Set(dates.map((d) => d.slice(0, 10)))].sort().reverse();
  let streak = 1;
  let maxStreak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }
  return maxStreak;
}

export function useCustomerAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch badge definitions
  const { data: badgeDefs = [], isLoading: defsLoading } = useQuery({
    queryKey: ["badge-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zivo_badges")
        .select("*")
        .eq("category", "customer")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user earned badges
  const { data: earnedBadges = [], isLoading: earnedLoading } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zivo_user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch order counts for progress
  const { data: orderCounts, isLoading: countsLoading } = useQuery({
    queryKey: ["achievement-counts", user?.id],
    queryFn: async () => {
      const [eatsRes, ridesRes, travelRes] = await Promise.all([
        supabase
          .from("food_orders")
          .select("created_at")
          .eq("customer_id", user!.id)
          .eq("status", "delivered"),
        supabase
          .from("trips")
          .select("created_at")
          .eq("rider_id", user!.id)
          .eq("status", "completed"),
        supabase
          .from("travel_orders")
          .select("created_at")
          .eq("user_id", user!.id)
          .in("status", ["confirmed", "completed"]),
      ]);

      const eatsDates = (eatsRes.data || []).map((o: any) => o.created_at);
      const ridesDates = (ridesRes.data || []).map((o: any) => o.created_at);
      const travelDates = (travelRes.data || []).map((o: any) => o.created_at);
      const allDates = [...eatsDates, ...ridesDates, ...travelDates];

      return {
        eats_count: eatsDates.length,
        ride_count: ridesDates.length,
        travel_count: travelDates.length,
        order_count: allDates.length,
        order_streak: computeOrderStreak(allDates),
      };
    },
    enabled: !!user?.id,
  });

  // Build badge list with progress
  const earnedMap = new Map(earnedBadges.map((b: any) => [b.badge_id, b.earned_at]));
  const counts = orderCounts || { eats_count: 0, ride_count: 0, travel_count: 0, order_count: 0, order_streak: 0 };

  const badges: AchievementBadge[] = badgeDefs.map((def: any) => {
    const criteriaType = def.criteria_type as string;
    const threshold = def.criteria_threshold as number;
    const currentValue = (counts as any)[criteriaType] ?? 0;
    const progress = Math.min(Math.round((currentValue / threshold) * 100), 100);
    const earned = earnedMap.has(def.id);
    const earnedAt = earnedMap.get(def.id) || null;

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      tier: def.tier,
      earned,
      earnedAt,
      progress,
      currentValue,
      threshold,
      claimable: progress >= 100 && !earned,
      sortOrder: def.sort_order ?? 999,
    };
  });

  const isLoading = defsLoading || earnedLoading || countsLoading;
  const totalEarned = badges.filter((b) => b.earned).length;
  const totalAvailable = badges.length;

  // Claim badge mutation
  const claimBadge = useMutation({
    mutationFn: async (badgeId: string) => {
      const badge = badges.find((b) => b.id === badgeId);
      if (!badge || !badge.claimable) throw new Error("Badge not claimable");

      // Insert user badge
      const { error: insertError } = await supabase
        .from("zivo_user_badges")
        .insert({ user_id: user!.id, badge_id: badgeId });
      if (insertError) throw insertError;

      // Award bonus points
      const bonusPoints = TIER_POINTS[badge.tier] || 50;
      const { error: pointsError } = await supabase
        .from("points_ledger")
        .insert({
          user_id: user!.id,
          points_amount: bonusPoints,
          balance_after: 0, // Will be recalculated by trigger/app logic
          transaction_type: "earn",
          description: `Badge unlocked: ${badge.name}`,
          source: "badge_reward",
        });

      if (pointsError) {
        console.error("Points award failed:", pointsError);
        // Badge still earned, just points failed
      }

      return { badge, bonusPoints };
    },
    onSuccess: ({ badge, bonusPoints }) => {
      toast.success(`🏆 ${badge.name} unlocked!`, {
        description: `+${bonusPoints} ZIVO Points earned`,
      });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] });
    },
    onError: (err: any) => {
      toast.error("Failed to claim badge", { description: err.message });
    },
  });

  return {
    badges,
    totalEarned,
    totalAvailable,
    isLoading,
    claimBadge: claimBadge.mutate,
    isClaiming: claimBadge.isPending,
  };
}
