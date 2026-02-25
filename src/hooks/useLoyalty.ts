/**
 * Loyalty Hooks - Stub
 */
import { useQuery, useMutation } from "@tanstack/react-query";

export function usePointsHistory() {
  return useQuery({ queryKey: ["loyalty-history"], queryFn: async () => [] as any[], enabled: false });
}

export function useLoyaltySettings() {
  return useQuery({ queryKey: ["loyalty-settings"], queryFn: async () => ({} as any), enabled: false });
}

export function useAvailableRewards() {
  return useQuery({ queryKey: ["loyalty-rewards"], queryFn: async () => [] as any[], enabled: false });
}

export function useUserRedemptions() {
  return useQuery({ queryKey: ["loyalty-redemptions"], queryFn: async () => [] as any[], enabled: false });
}

export function useRedeemReward() {
  return useMutation({ mutationFn: async (_data: any) => ({} as any) });
}
