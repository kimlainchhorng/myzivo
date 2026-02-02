/**
 * P2P Commission Settings Hooks
 * Hooks for managing P2P marketplace commission configuration
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { P2PCommissionSettings } from "@/types/p2p";

// Fetch active commission settings
export function useP2PCommissionSettings() {
  return useQuery({
    queryKey: ["p2pCommissionSettings"],
    queryFn: async (): Promise<P2PCommissionSettings | null> => {
      const { data, error } = await supabase
        .from("p2p_commission_settings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });
}

// Fetch all commission settings (admin)
export function useAllP2PCommissionSettings() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ["allP2pCommissionSettings"],
    queryFn: async (): Promise<P2PCommissionSettings[]> => {
      const { data, error } = await supabase
        .from("p2p_commission_settings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });
}

// Update commission settings (admin only)
export function useUpdateP2PCommissionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<P2PCommissionSettings>;
    }) => {
      // Validate commission percentage range
      if (
        updates.owner_commission_pct !== undefined &&
        (updates.owner_commission_pct < 15 || updates.owner_commission_pct > 30)
      ) {
        throw new Error("Platform commission must be between 15% and 30%");
      }

      const { data, error } = await supabase
        .from("p2p_commission_settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["p2pCommissionSettings"] });
      queryClient.invalidateQueries({ queryKey: ["allP2pCommissionSettings"] });
      toast.success("Commission settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
}

// Create new commission settings (admin only)
export function useCreateP2PCommissionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: {
      name: string;
      owner_commission_pct: number;
      renter_service_fee_pct: number;
      insurance_daily_fee: number;
      is_active?: boolean;
    }) => {
      // Validate commission percentage range
      if (settings.owner_commission_pct < 15 || settings.owner_commission_pct > 30) {
        throw new Error("Platform commission must be between 15% and 30%");
      }

      // If setting as active, deactivate others
      if (settings.is_active) {
        await supabase
          .from("p2p_commission_settings")
          .update({ is_active: false })
          .eq("is_active", true);
      }

      const { data, error } = await supabase
        .from("p2p_commission_settings")
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["p2pCommissionSettings"] });
      queryClient.invalidateQueries({ queryKey: ["allP2pCommissionSettings"] });
      toast.success("Commission settings created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create settings");
    },
  });
}

// Toggle commission settings active state
export function useToggleP2PCommissionActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // If activating, deactivate all others first
      if (isActive) {
        await supabase
          .from("p2p_commission_settings")
          .update({ is_active: false })
          .neq("id", id);
      }

      const { data, error } = await supabase
        .from("p2p_commission_settings")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["p2pCommissionSettings"] });
      queryClient.invalidateQueries({ queryKey: ["allP2pCommissionSettings"] });
      toast.success("Settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to toggle settings");
    },
  });
}

// Calculate fees preview
export function calculateFeePreview(
  dailyRate: number,
  days: number,
  settings: P2PCommissionSettings | null
) {
  if (!settings) {
    return {
      subtotal: 0,
      platformFee: 0,
      serviceFee: 0,
      insuranceFee: 0,
      total: 0,
      ownerPayout: 0,
    };
  }

  const subtotal = dailyRate * days;
  const platformFee = subtotal * (settings.owner_commission_pct / 100);
  const serviceFee = subtotal * ((settings.renter_service_fee_pct || 0) / 100);
  const insuranceFee = (settings.insurance_daily_fee || 0) * days;
  const total = subtotal + serviceFee + insuranceFee;
  const ownerPayout = subtotal - platformFee;

  return {
    subtotal,
    platformFee,
    serviceFee,
    insuranceFee,
    total,
    ownerPayout,
  };
}
