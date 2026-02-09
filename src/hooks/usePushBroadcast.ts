/**
 * Push Broadcast Hooks
 * React Query hooks for push segments and campaigns
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSegments,
  getSegment,
  createSegment,
  updateSegment,
  deleteSegment,
  estimateSegmentSize,
  previewSegmentUsers,
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  cancelCampaign,
  sendCampaignNow,
  scheduleCampaign,
  sendTestPush,
  getCampaignDeliveryLogs,
  getPushStats,
  type PushSegment,
  type PushCampaign,
  type SegmentRules,
} from "@/lib/pushBroadcast";

// ============ Segment Hooks ============

export function useSegments() {
  return useQuery({
    queryKey: ["push-segments"],
    queryFn: getSegments,
    staleTime: 30 * 1000,
  });
}

export function useSegment(id: string | undefined) {
  return useQuery({
    queryKey: ["push-segment", id],
    queryFn: () => (id ? getSegment(id) : null),
    enabled: !!id,
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (segment: Partial<PushSegment>) => createSegment(segment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-segments"] });
      toast.success("Segment created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create segment", { description: error.message });
    },
  });
}

export function useUpdateSegment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PushSegment> }) =>
      updateSegment(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["push-segments"] });
      queryClient.invalidateQueries({ queryKey: ["push-segment", id] });
      toast.success("Segment updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update segment", { description: error.message });
    },
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-segments"] });
      toast.success("Segment deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete segment", { description: error.message });
    },
  });
}

export function useSegmentPreview(rules: SegmentRules, enabled = true) {
  return useQuery({
    queryKey: ["segment-preview", rules],
    queryFn: async () => {
      const [count, users] = await Promise.all([
        estimateSegmentSize(rules),
        previewSegmentUsers(rules, 5),
      ]);
      return { count, users };
    },
    enabled,
    staleTime: 10 * 1000,
  });
}

// ============ Campaign Hooks ============

export function usePushCampaigns() {
  return useQuery({
    queryKey: ["push-campaigns"],
    queryFn: getCampaigns,
    staleTime: 30 * 1000,
  });
}

export function usePushCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ["push-campaign", id],
    queryFn: () => (id ? getCampaign(id) : null),
    enabled: !!id && id !== "new",
  });
}

export function useCreatePushCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaign: Partial<PushCampaign>) => createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-campaigns"] });
      toast.success("Campaign created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create campaign", { description: error.message });
    },
  });
}

export function useUpdatePushCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PushCampaign> }) =>
      updateCampaign(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["push-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["push-campaign", id] });
      toast.success("Campaign updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update campaign", { description: error.message });
    },
  });
}

export function useDeletePushCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-campaigns"] });
      toast.success("Campaign deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete campaign", { description: error.message });
    },
  });
}

export function useCancelPushCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cancelCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-campaigns"] });
      toast.success("Campaign cancelled");
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel campaign", { description: error.message });
    },
  });
}

export function useSendPushCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) => sendCampaignNow(campaignId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["push-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["push-stats"] });
      toast.success("Campaign sent", {
        description: `${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to send campaign", { description: error.message });
    },
  });
}

export function useSchedulePushCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, sendAt }: { id: string; sendAt: Date }) =>
      scheduleCampaign(id, sendAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-campaigns"] });
      toast.success("Campaign scheduled");
    },
    onError: (error: Error) => {
      toast.error("Failed to schedule campaign", { description: error.message });
    },
  });
}

export function useSendTestPush() {
  return useMutation({
    mutationFn: ({ userId, title, body, url }: { 
      userId: string; 
      title: string; 
      body: string; 
      url?: string;
    }) => sendTestPush(userId, title, body, url),
    onSuccess: () => {
      toast.success("Test notification sent");
    },
    onError: (error: Error) => {
      toast.error("Failed to send test", { description: error.message });
    },
  });
}

// ============ Delivery Logs ============

export function usePushDeliveryLogs(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["push-delivery-logs", campaignId],
    queryFn: () => (campaignId ? getCampaignDeliveryLogs(campaignId) : []),
    enabled: !!campaignId,
  });
}

// ============ Stats ============

export function usePushStats() {
  return useQuery({
    queryKey: ["push-stats"],
    queryFn: getPushStats,
    staleTime: 60 * 1000,
  });
}
