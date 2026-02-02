/**
 * P2P Dispute Hooks
 * Hooks for managing disputes between renters and owners
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { P2PDispute, P2PDisputeType, P2PDisputeStatus } from "@/types/p2p";

interface CreateDisputeData {
  bookingId: string;
  disputeType: P2PDisputeType;
  description: string;
  evidence?: unknown;
}

// Create a new dispute
export function useCreateDispute() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDisputeData) => {
      if (!user) throw new Error("Not authenticated");

      const { data: dispute, error } = await supabase
        .from("p2p_disputes")
        .insert([{
          booking_id: data.bookingId,
          dispute_type: data.disputeType,
          description: data.description,
          evidence: data.evidence ? JSON.parse(JSON.stringify(data.evidence)) : null,
          raised_by: user.id,
          status: "open" as const,
          priority: "medium",
        }])
        .select()
        .single();

      if (error) throw error;
      return dispute;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookingDisputes", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["userDisputes"] });
      toast.success("Dispute filed successfully. Our team will review it shortly.");
    },
    onError: (error: Error) => {
      console.error("Dispute error:", error);
      toast.error(error.message || "Failed to file dispute");
    },
  });
}

// Get disputes for a booking
export function useBookingDisputes(bookingId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookingDisputes", bookingId],
    queryFn: async (): Promise<P2PDispute[]> => {
      if (!bookingId || !user) return [];

      const { data, error } = await supabase
        .from("p2p_disputes")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!bookingId && !!user,
  });
}

// Get user's disputes
export function useUserDisputes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userDisputes", user?.id],
    queryFn: async (): Promise<P2PDispute[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("p2p_disputes")
        .select("*")
        .eq("raised_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Admin: Get all disputes
export function useAdminDisputes() {
  return useQuery({
    queryKey: ["adminDisputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("p2p_disputes")
        .select(`
          *,
          booking:p2p_bookings(
            id,
            pickup_date,
            return_date,
            total_amount,
            vehicle:p2p_vehicles(id, make, model, year),
            renter:profiles(id, email),
            owner:car_owner_profiles!p2p_bookings_owner_id_fkey(id, full_name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

// Admin: Update dispute status
export function useUpdateDisputeStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      status,
      adminNotes,
      resolution,
      resolutionAmount,
    }: {
      disputeId: string;
      status: P2PDisputeStatus;
      adminNotes?: string;
      resolution?: string;
      resolutionAmount?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (adminNotes) updateData.admin_notes = adminNotes;
      if (resolution) updateData.resolution = resolution;
      if (resolutionAmount !== undefined) updateData.resolution_amount = resolutionAmount;

      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user.id;
      }

      const { data, error } = await supabase
        .from("p2p_disputes")
        .update(updateData)
        .eq("id", disputeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDisputes"] });
      queryClient.invalidateQueries({ queryKey: ["userDisputes"] });
      queryClient.invalidateQueries({ queryKey: ["bookingDisputes"] });
      toast.success("Dispute updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update dispute");
    },
  });
}

// Get dispute status badge styling
export function getDisputeStatusBadge(status: string | null): {
  className: string;
  label: string;
} {
  switch (status) {
    case "open":
      return {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Open",
      };
    case "investigating":
      return {
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "Investigating",
      };
    case "resolved":
      return {
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Resolved",
      };
    case "closed":
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: "Closed",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: status || "Unknown",
      };
  }
}

// Get dispute type label
export function getDisputeTypeLabel(type: string): string {
  const types: Record<string, string> = {
    damage: "Vehicle Damage",
    cleanliness: "Cleanliness Issue",
    late_return: "Late Return",
    cancellation: "Cancellation",
    payment: "Payment Issue",
    other: "Other",
  };
  return types[type] || type;
}
