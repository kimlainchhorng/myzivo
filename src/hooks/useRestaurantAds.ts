/**
 * Restaurant Ads Hooks
 * React Query hooks for ad management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRestaurantAds,
  getAdById,
  createAd,
  updateAd,
  pauseAd,
  resumeAd,
  deleteAd,
  getAdStats,
  getMerchantAdStats,
  getMerchantBalance,
  getActiveAdsForPlacement,
  recordImpression,
  recordClick,
  getAllAds,
  approveAd,
  rejectAd,
  getAdsRevenue,
  getFraudSignals,
  getActiveAdCount,
  getPendingApprovalCount,
  type RestaurantAd,
  type AdFilters,
  type DateRange,
} from "@/lib/restaurantAds";

// ============================================
// MERCHANT HOOKS
// ============================================

export function useRestaurantAds(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["restaurant-ads", restaurantId],
    queryFn: () => getRestaurantAds(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useAdById(adId: string | undefined) {
  return useQuery({
    queryKey: ["ad", adId],
    queryFn: () => getAdById(adId!),
    enabled: !!adId,
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ad: Partial<RestaurantAd> & { restaurantId: string }) => createAd(ad),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-ads", variables.restaurantId] });
      toast.success("Campaign created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RestaurantAd> }) =>
      updateAd(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ad"] });
      toast.success("Campaign updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });
}

export function usePauseAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pauseAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-ads"] });
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      toast.success("Campaign paused");
    },
    onError: (error: Error) => {
      toast.error(`Failed to pause campaign: ${error.message}`);
    },
  });
}

export function useResumeAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-ads"] });
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      toast.success("Campaign resumed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to resume campaign: ${error.message}`);
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-ads"] });
      toast.success("Campaign deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });
}

export function useAdStats(adId: string | undefined) {
  return useQuery({
    queryKey: ["ad-stats", adId],
    queryFn: () => getAdStats(adId!),
    enabled: !!adId,
  });
}

export function useMerchantAdStats(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["merchant-ad-stats", restaurantId],
    queryFn: () => getMerchantAdStats(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useMerchantBalance(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["merchant-balance", restaurantId],
    queryFn: () => getMerchantBalance(restaurantId!),
    enabled: !!restaurantId,
  });
}

// ============================================
// CUSTOMER HOOKS
// ============================================

export function useSponsoredRestaurants(placement: string = "search") {
  return useQuery({
    queryKey: ["sponsored-restaurants", placement],
    queryFn: () => getActiveAdsForPlacement(placement),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useRecordImpression() {
  return useMutation({
    mutationFn: ({ adId, userId }: { adId: string; userId: string | null }) =>
      recordImpression(adId, userId),
  });
}

export function useRecordClick() {
  return useMutation({
    mutationFn: ({ adId, userId }: { adId: string; userId: string | null }) =>
      recordClick(adId, userId),
  });
}

// ============================================
// ADMIN HOOKS
// ============================================

export function useAllAds(filters?: AdFilters) {
  return useQuery({
    queryKey: ["all-ads", filters],
    queryFn: () => getAllAds(filters),
  });
}

export function useApproveAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approval-count"] });
      toast.success("Campaign approved");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve campaign: ${error.message}`);
    },
  });
}

export function useRejectAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectAd(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ads"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approval-count"] });
      toast.success("Campaign rejected");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject campaign: ${error.message}`);
    },
  });
}

export function useAdsRevenue(dateRange?: DateRange) {
  return useQuery({
    queryKey: ["ads-revenue", dateRange],
    queryFn: () => getAdsRevenue(dateRange),
  });
}

export function useAdFraudSignals() {
  return useQuery({
    queryKey: ["ad-fraud-signals"],
    queryFn: () => getFraudSignals(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useActiveAdCount() {
  return useQuery({
    queryKey: ["active-ad-count"],
    queryFn: () => getActiveAdCount(),
  });
}

export function usePendingApprovalCount() {
  return useQuery({
    queryKey: ["pending-approval-count"],
    queryFn: () => getPendingApprovalCount(),
  });
}
