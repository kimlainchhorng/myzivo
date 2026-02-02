/**
 * P2P Payment Hooks
 * Hooks for handling P2P booking payments, payouts, and refunds
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { P2PPayout } from "@/types/p2p";

// Create checkout session for P2P booking
export function useCreateP2PCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string }) => {
      const { data, error } = await supabase.functions.invoke("create-p2p-checkout", {
        body: { booking_id: bookingId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as { url: string; session_id: string; booking_id: string };
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.open(data.url, "_blank");
      }
      queryClient.invalidateQueries({ queryKey: ["bookingDetail"] });
    },
    onError: (error: Error) => {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to create checkout session");
    },
  });
}

// Process P2P refund
export function useProcessP2PRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
      refundType = "full",
      partialAmount,
    }: {
      bookingId: string;
      reason?: string;
      refundType?: "full" | "partial";
      partialAmount?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("process-p2p-refund", {
        body: {
          booking_id: bookingId,
          reason,
          refund_type: refundType,
          partial_amount: partialAmount,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookingDetail", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminP2PBookings"] });
      toast.success("Refund processed successfully");
    },
    onError: (error: Error) => {
      console.error("Refund error:", error);
      toast.error(error.message || "Failed to process refund");
    },
  });
}

// Process owner payouts (admin only)
export function useProcessP2PPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      ownerId,
      processAllPending,
    }: {
      bookingId?: string;
      ownerId?: string;
      processAllPending?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("process-p2p-payout", {
        body: {
          booking_id: bookingId,
          owner_id: ownerId,
          process_all_pending: processAllPending,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerPayouts"] });
      queryClient.invalidateQueries({ queryKey: ["adminP2PPayouts"] });
      queryClient.invalidateQueries({ queryKey: ["ownerBookings"] });
      toast.success("Payouts processed successfully");
    },
    onError: (error: Error) => {
      console.error("Payout error:", error);
      toast.error(error.message || "Failed to process payouts");
    },
  });
}

// Fetch owner's payouts
export function useOwnerPayouts(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["ownerPayouts", ownerId],
    queryFn: async (): Promise<P2PPayout[]> => {
      if (!ownerId) return [];

      const { data, error } = await supabase
        .from("p2p_payouts")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!ownerId,
  });
}

// Fetch owner's earnings summary
export function useOwnerEarnings(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["ownerEarnings", ownerId],
    queryFn: async () => {
      if (!ownerId) return null;

      // Get completed bookings with captured payment status
      const { data: bookings, error: bookingsError } = await supabase
        .from("p2p_bookings")
        .select("owner_payout, status, payment_status, created_at, payout_id")
        .eq("owner_id", ownerId)
        .eq("payment_status", "captured");

      if (bookingsError) throw bookingsError;

      // Get payouts
      const { data: payouts, error: payoutsError } = await supabase
        .from("p2p_payouts")
        .select("amount, status")
        .eq("owner_id", ownerId);

      if (payoutsError) throw payoutsError;

      const completedBookings = bookings?.filter((b) => b.status === "completed") || [];
      const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);
      
      const pendingPayoutBookings = completedBookings.filter((b) => !b.payout_id);
      const pendingAmount = pendingPayoutBookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

      const paidPayouts = payouts?.filter((p) => p.status === "completed") || [];
      const totalPaid = paidPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

      const processingPayouts = payouts?.filter((p) => p.status === "pending" || p.status === "processing") || [];
      const processingAmount = processingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Monthly earnings
      const now = new Date();
      const thisMonth = bookings?.filter((b) => {
        const bookingDate = new Date(b.created_at!);
        return (
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        );
      }) || [];
      const monthlyEarnings = thisMonth.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

      return {
        totalEarnings,
        pendingAmount,
        totalPaid,
        processingAmount,
        monthlyEarnings,
        totalBookings: bookings?.length || 0,
        completedBookings: completedBookings.length,
      };
    },
    enabled: !!ownerId,
  });
}

// Admin: Fetch all payouts
export function useAdminP2PPayouts() {
  return useQuery({
    queryKey: ["adminP2PPayouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("p2p_payouts")
        .select(`
          *,
          owner:car_owner_profiles!p2p_payouts_owner_id_fkey(id, full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });
}

// Admin: Update payout status
export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payoutId,
      status,
      notes,
      stripeTransferId,
    }: {
      payoutId: string;
      status: "pending" | "processing" | "completed" | "failed" | "cancelled";
      notes?: string;
      stripeTransferId?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes) updateData.notes = notes;
      if (stripeTransferId) updateData.stripe_transfer_id = stripeTransferId;
      if (status === "completed") updateData.processed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("p2p_payouts")
        .update(updateData)
        .eq("id", payoutId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminP2PPayouts"] });
      queryClient.invalidateQueries({ queryKey: ["ownerPayouts"] });
      toast.success("Payout status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payout");
    },
  });
}

// Get payment status badge styling
export function getP2PPaymentStatusBadge(status: string | null): {
  className: string;
  label: string;
} {
  switch (status) {
    case "paid":
      return {
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Paid",
      };
    case "pending":
      return {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Pending",
      };
    case "refunded":
      return {
        className: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        label: "Refunded",
      };
    case "partial_refund":
      return {
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "Partial Refund",
      };
    case "failed":
      return {
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        label: "Failed",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: "Unpaid",
      };
  }
}

// Get payout status badge styling
export function getPayoutStatusBadge(status: string | null): {
  className: string;
  label: string;
} {
  switch (status) {
    case "completed":
      return {
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Completed",
      };
    case "processing":
      return {
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "Processing",
      };
    case "pending":
      return {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Pending",
      };
    case "failed":
      return {
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        label: "Failed",
      };
    case "cancelled":
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: "Cancelled",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: status || "Unknown",
      };
  }
}
