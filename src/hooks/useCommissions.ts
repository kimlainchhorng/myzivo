/**
 * Commission Engine Hook
 * Manage service-level and partner-specific commissions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceCommission {
  id: string;
  service_type: string;
  commission_type: string;
  commission_value: number;
  min_commission: number;
  max_commission: number | null;
  service_fee: number;
  is_active: boolean;
  notes: string | null;
  updated_at: string;
}

export interface PartnerCommission {
  id: string;
  partner_type: string;
  partner_id: string;
  service_type: string;
  commission_type: string;
  commission_value: number;
  min_commission: number;
  max_commission: number | null;
  effective_from: string;
  effective_until: string | null;
  reason: string | null;
  is_active: boolean;
}

// Fetch all service commissions
export function useServiceCommissions() {
  return useQuery({
    queryKey: ["service-commissions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("zivo_service_commissions")
        .select("*")
        .order("service_type");

      if (error) throw error;
      return (data || []) as ServiceCommission[];
    },
  });
}

// Update service commission (admin)
export function useUpdateServiceCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceType,
      updates,
    }: {
      serviceType: string;
      updates: Partial<ServiceCommission>;
    }) => {
      const { error } = await (supabase as any)
        .from("zivo_service_commissions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("service_type", serviceType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-commissions"] });
      toast.success("Commission updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update commission");
    },
  });
}

// Fetch partner-specific commissions
export function usePartnerCommissions(partnerType?: string, partnerId?: string) {
  return useQuery({
    queryKey: ["partner-commissions", partnerType, partnerId],
    queryFn: async () => {
      let query = (supabase as any)
        .from("zivo_partner_commissions")
        .select("*")
        .eq("is_active", true);

      if (partnerType) query = query.eq("partner_type", partnerType);
      if (partnerId) query = query.eq("partner_id", partnerId);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PartnerCommission[];
    },
    enabled: !!partnerType || !!partnerId,
  });
}

// Create/update partner commission override
export function useSetPartnerCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commission: Omit<PartnerCommission, "id">) => {
      const { data, error } = await (supabase as any)
        .from("zivo_partner_commissions")
        .upsert(commission, {
          onConflict: "partner_type,partner_id,service_type",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-commissions"] });
      toast.success("Partner commission set");
    },
  });
}

// Calculate commission for a transaction
export function calculateCommission(
  grossAmount: number,
  commission: ServiceCommission | PartnerCommission
): { commissionAmount: number; netAmount: number } {
  let commissionAmount = 0;

  if (commission.commission_type === "percentage") {
    commissionAmount = grossAmount * (commission.commission_value / 100);
  } else if (commission.commission_type === "fixed") {
    commissionAmount = commission.commission_value;
  } else if (commission.commission_type === "margin") {
    // Margin is already included in gross, just track it
    commissionAmount = grossAmount * (commission.commission_value / 100);
  }

  // Apply min/max bounds
  if (commission.min_commission && commissionAmount < commission.min_commission) {
    commissionAmount = commission.min_commission;
  }
  if (commission.max_commission && commissionAmount > commission.max_commission) {
    commissionAmount = commission.max_commission;
  }

  // Add service fee if exists
  const serviceFee = (commission as ServiceCommission).service_fee || 0;
  const totalCommission = commissionAmount + serviceFee;

  return {
    commissionAmount: totalCommission,
    netAmount: grossAmount - totalCommission,
  };
}

// Get commission for a specific service (with partner override check)
export async function getEffectiveCommission(
  serviceType: string,
  partnerType?: string,
  partnerId?: string
): Promise<ServiceCommission | PartnerCommission | null> {
  // First check for partner override
  if (partnerType && partnerId) {
    const { data: partnerCommission } = await (supabase as any)
      .from("zivo_partner_commissions")
      .select("*")
      .eq("partner_type", partnerType)
      .eq("partner_id", partnerId)
      .eq("service_type", serviceType)
      .eq("is_active", true)
      .single();

    if (partnerCommission) return partnerCommission;
  }

  // Fall back to service default
  const { data: serviceCommission } = await (supabase as any)
    .from("zivo_service_commissions")
    .select("*")
    .eq("service_type", serviceType)
    .single();

  return serviceCommission || null;
}
