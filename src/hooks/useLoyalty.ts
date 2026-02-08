/**
 * LOYALTY HOOKS
 * React Query hooks for loyalty points, rewards, and admin management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  getPointsHistory,
  getLoyaltySettings,
  updateLoyaltySettings,
  getAvailableRewards,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  getUserRedemptions,
  getTopCustomers,
  adjustPoints,
  getLoyaltyProgramStats,
  type LoyaltySettings,
  type PlatformReward,
  type PointsLedgerEntry,
  type TopCustomer,
  type RewardRedemption,
} from "@/lib/loyalty";

const QUERY_KEYS = {
  settings: "loyalty-settings",
  rewards: "loyalty-rewards",
  allRewards: "loyalty-all-rewards",
  history: "loyalty-history",
  redemptions: "loyalty-redemptions",
  topCustomers: "loyalty-top-customers",
  stats: "loyalty-stats",
};

// ============================================
// LOYALTY SETTINGS
// ============================================

export function useLoyaltySettings() {
  return useQuery<LoyaltySettings>({
    queryKey: [QUERY_KEYS.settings],
    queryFn: getLoyaltySettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateLoyaltySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      updateLoyaltySettings(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.settings] });
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    },
  });
}

// ============================================
// POINTS HISTORY
// ============================================

export function usePointsHistory(userId?: string, limit = 50) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery<PointsLedgerEntry[]>({
    queryKey: [QUERY_KEYS.history, targetUserId, limit],
    queryFn: () => getPointsHistory(targetUserId!, limit),
    enabled: !!targetUserId,
  });
}

// ============================================
// REWARDS
// ============================================

export function useAvailableRewards() {
  return useQuery<PlatformReward[]>({
    queryKey: [QUERY_KEYS.rewards],
    queryFn: getAvailableRewards,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAllRewards() {
  return useQuery<PlatformReward[]>({
    queryKey: [QUERY_KEYS.allRewards],
    queryFn: getAllRewards,
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reward: Partial<PlatformReward>) => createReward(reward),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.rewards] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRewards] });
      toast.success("Reward created successfully");
    },
    onError: (error) => {
      console.error("Failed to create reward:", error);
      toast.error("Failed to create reward");
    },
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PlatformReward> }) =>
      updateReward(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.rewards] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRewards] });
      toast.success("Reward updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update reward:", error);
      toast.error("Failed to update reward");
    },
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.rewards] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRewards] });
      toast.success("Reward deleted");
    },
    onError: (error) => {
      console.error("Failed to delete reward:", error);
      toast.error("Failed to delete reward");
    },
  });
}

// ============================================
// REDEMPTIONS
// ============================================

export function useRedeemReward() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      return redeemReward(user.id, rewardId);
    },
    onSuccess: (redemption) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.history] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.redemptions] });
      toast.success("Reward redeemed! It will be applied to your next order.");
    },
    onError: (error) => {
      console.error("Failed to redeem reward:", error);
      toast.error(error instanceof Error ? error.message : "Failed to redeem reward");
    },
  });
}

export function useUserRedemptions() {
  const { user } = useAuth();

  return useQuery<RewardRedemption[]>({
    queryKey: [QUERY_KEYS.redemptions, user?.id],
    queryFn: () => getUserRedemptions(user!.id),
    enabled: !!user?.id,
  });
}

// ============================================
// ADMIN: TOP CUSTOMERS
// ============================================

export function useTopCustomers(limit = 20) {
  return useQuery<TopCustomer[]>({
    queryKey: [QUERY_KEYS.topCustomers, limit],
    queryFn: () => getTopCustomers(limit),
  });
}

// ============================================
// ADMIN: POINTS ADJUSTMENT
// ============================================

export function useAdjustPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      amount,
      reason,
    }: {
      userId: string;
      amount: number;
      reason: string;
    }) => adjustPoints(userId, amount, reason, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.topCustomers] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.history] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      toast.success("Points adjusted successfully");
    },
    onError: (error) => {
      console.error("Failed to adjust points:", error);
      toast.error("Failed to adjust points");
    },
  });
}

// ============================================
// ADMIN: PROGRAM STATS
// ============================================

export function useLoyaltyProgramStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: getLoyaltyProgramStats,
  });
}
