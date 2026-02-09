/**
 * useUserRewards — Fetch and group user rewards by status
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserReward {
  id: string;
  user_id: string;
  reward_type: string;
  reward_value: number;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export function useUserRewards() {
  const { user } = useAuth();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["user-rewards", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserReward[];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const now = new Date();

  const active = rewards.filter(
    (r) => r.status === "active" && (!r.expires_at || new Date(r.expires_at) > now)
  );
  const redeemed = rewards.filter((r) => r.status === "redeemed");
  const expired = rewards.filter(
    (r) =>
      r.status === "expired" ||
      (r.status === "active" && r.expires_at && new Date(r.expires_at) <= now)
  );

  return { rewards, active, redeemed, expired, isLoading };
}
