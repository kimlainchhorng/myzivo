/**
 * Loyalty Hooks — reads from loyalty_points, loyalty_rewards tables
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePointsHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loyalty-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useLoyaltySettings() {
  return useQuery({
    queryKey: ["loyalty-settings"],
    queryFn: async () => {
      // Settings are global; fetch first row
      const { data, error } = await (supabase as any)
        .from("loyalty_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) return {} as any;
      return data || {};
    },
  });
}

export function useAvailableRewards() {
  return useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUserRedemptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loyalty-redemptions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("loyalty_redemptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!user,
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reward_id: string; points: number }) => {
      const { error } = await (supabase as any)
        .from("loyalty_redemptions")
        .insert({ reward_id: data.reward_id, points_spent: data.points });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-history"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
      toast.success("Reward redeemed!");
    },
    onError: () => {
      toast.error("Failed to redeem reward");
    },
  });
}
