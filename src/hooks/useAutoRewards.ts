/**
 * useAutoRewards — Detects milestones and auto-awards rewards
 */
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Reward {
  id: string;
  user_id: string;
  reward_type: string;
  reward_value: number;
  status: string;
  expires_at: string;
  created_at: string;
}

const MILESTONES = [
  { orderCount: 5, rewardType: "5_orders", value: 5, label: "5 Orders Milestone" },
  { orderCount: 10, rewardType: "10_orders", value: 10, label: "10 Orders Milestone" },
  { orderCount: 25, rewardType: "25_orders", value: 15, label: "25 Orders Milestone" },
];

const TIER_REWARDS = [
  { tier: "traveler", rewardType: "tier_traveler", value: 5, label: "Traveler Tier Achieved" },
  { tier: "elite", rewardType: "tier_elite", value: 15, label: "Elite Tier Achieved" },
];

export function useAutoRewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!user || checkedRef.current) {
      setIsLoading(false);
      return;
    }
    checkedRef.current = true;

    const checkAndAward = async () => {
      try {
        // Count delivered orders - use rpc or simple query
        // Avoiding deep chain to prevent TS2589
        const ordersQuery = supabase
          .from("food_orders" as any)
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "delivered");
        const { count: deliveredCount } = await ordersQuery;

        // Get current tier
        const { data: tierData } = await supabase
          .from("loyalty_points")
          .select("tier")
          .eq("user_id", user.id)
          .maybeSingle();

        // Get existing rewards
        const { data: existingData } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", user.id);

        const orderCount = deliveredCount ?? 0;
        const currentTier = (tierData?.tier as string) ?? "explorer";
        const existing = (existingData ?? []) as Reward[];
        const existingTypes = new Set(existing.map((r) => r.reward_type));

        const toAward: { rewardType: string; value: number; label: string }[] = [];

        // Check order milestones
        for (const m of MILESTONES) {
          if (orderCount >= m.orderCount && !existingTypes.has(m.rewardType)) {
            toAward.push(m);
          }
        }

        // Check tier rewards
        for (const t of TIER_REWARDS) {
          if (currentTier === t.tier && !existingTypes.has(t.rewardType)) {
            toAward.push(t);
          }
          // Elite also gets traveler reward if missing
          if (currentTier === "elite" && t.tier === "traveler" && !existingTypes.has(t.rewardType)) {
            toAward.push(t);
          }
        }

        // Insert new rewards
        if (toAward.length > 0) {
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const inserts = toAward.map((a) => ({
            user_id: user.id,
            reward_type: a.rewardType,
            reward_value: a.value,
            status: "active",
            expires_at: expiresAt,
          }));

          const { data: inserted } = await supabase.from("rewards").insert(inserts).select();

          if (inserted) {
            for (const a of toAward) {
              toast.success(`🎉 You earned a reward! $${a.value} off your next order`, {
                description: a.label,
              });
            }
          }
        }

        // Refresh rewards list
        const { data: allRewards } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setRewards((allRewards ?? []) as Reward[]);
      } catch (err) {
        console.error("useAutoRewards error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndAward();
  }, [user]);

  const activeRewards = rewards.filter(
    (r) => r.status === "active" && (!r.expires_at || new Date(r.expires_at) > new Date())
  );

  return {
    rewards,
    activeRewards,
    isLoading,
    hasUnusedRewards: activeRewards.length > 0,
  };
}
