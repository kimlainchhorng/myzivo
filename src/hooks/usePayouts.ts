/**
 * Payout System Hook
 * Manage partner payouts and scheduling
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PayoutSchedule {
  id: string;
  partner_type: string;
  schedule_type: string;
  day_of_week: number | null;
  day_of_month: number | null;
  min_payout_amount: number;
  hold_period_hours: number;
  auto_payout: boolean;
  is_active: boolean;
}

export interface Payout {
  id: string;
  partner_type: string;
  partner_id: string;
  payout_period_start: string;
  payout_period_end: string;
  gross_earnings: number;
  commission_deducted: number;
  adjustments: number;
  net_payout: number;
  currency: string;
  status: string;
  stripe_transfer_id: string | null;
  processed_at: string | null;
  failed_reason: string | null;
  created_at: string;
}

export interface PayoutItem {
  id: string;
  payout_id: string;
  service_type: string;
  reference_type: string;
  reference_id: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  description: string | null;
}

// Fetch payout schedules (admin)
export function usePayoutSchedules() {
  return useQuery({
    queryKey: ["payout-schedules"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("zivo_payout_schedules")
        .select("*")
        .order("partner_type");

      if (error) throw error;
      return (data || []) as PayoutSchedule[];
    },
  });
}

// Update payout schedule (admin)
export function useUpdatePayoutSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      partnerType,
      updates,
    }: {
      partnerType: string;
      updates: Partial<PayoutSchedule>;
    }) => {
      const { error } = await (supabase as any)
        .from("zivo_payout_schedules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("partner_type", partnerType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-schedules"] });
      toast.success("Payout schedule updated");
    },
  });
}

// Fetch partner's payouts
export function useMyPayouts(status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-payouts", user?.id, status],
    queryFn: async () => {
      let query = (supabase as any)
        .from("zivo_payouts")
        .select("*")
        .eq("partner_id", user!.id)
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as Payout[];
    },
    enabled: !!user,
  });
}

// Fetch payout details with items
export function usePayoutDetails(payoutId: string | undefined) {
  return useQuery({
    queryKey: ["payout-details", payoutId],
    queryFn: async () => {
      const { data: payout, error: payoutError } = await (supabase as any)
        .from("zivo_payouts")
        .select("*")
        .eq("id", payoutId!)
        .single();

      if (payoutError) throw payoutError;

      const { data: items, error: itemsError } = await (supabase as any)
        .from("zivo_payout_items")
        .select("*")
        .eq("payout_id", payoutId!)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      return {
        payout: payout as Payout,
        items: (items || []) as PayoutItem[],
      };
    },
    enabled: !!payoutId,
  });
}

// Admin: Fetch all payouts
export function useAllPayouts(filters?: {
  status?: string;
  partnerType?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["all-payouts", filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from("zivo_payouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.partnerType) query = query.eq("partner_type", filters.partnerType);

      const { data, error } = await query.limit(filters?.limit || 100);
      if (error) throw error;
      return (data || []) as Payout[];
    },
  });
}

// Admin: Process payout
export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payoutId: string) => {
      // In production, this would call a Stripe edge function
      const { error } = await (supabase as any)
        .from("zivo_payouts")
        .update({
          status: "processing",
          processed_at: new Date().toISOString(),
        })
        .eq("id", payoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      toast.success("Payout processing initiated");
    },
  });
}

// Calculate payout summary
export function usePayoutSummary(partnerId?: string) {
  const { user } = useAuth();
  const effectivePartnerId = partnerId || user?.id;

  return useQuery({
    queryKey: ["payout-summary", effectivePartnerId],
    queryFn: async () => {
      const { data: payouts, error } = await (supabase as any)
        .from("zivo_payouts")
        .select("status, net_payout")
        .eq("partner_id", effectivePartnerId!);

      if (error) throw error;

      const summary = {
        totalEarned: 0,
        totalPaid: 0,
        pendingPayout: 0,
        processingPayout: 0,
      };

      (payouts || []).forEach((p: any) => {
        summary.totalEarned += Number(p.net_payout);
        if (p.status === "completed") summary.totalPaid += Number(p.net_payout);
        if (p.status === "pending") summary.pendingPayout += Number(p.net_payout);
        if (p.status === "processing") summary.processingPayout += Number(p.net_payout);
      });

      return summary;
    },
    enabled: !!effectivePartnerId,
  });
}
