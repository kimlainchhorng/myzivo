/**
 * Stripe Connect Hooks
 * Hooks for owner Stripe Connect onboarding and status checking
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StripeConnectLinkResponse {
  success: boolean;
  url: string;
  account_id: string;
}

interface StripeConnectStatusResponse {
  connected: boolean;
  account_id?: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements?: string[];
  disabled_reason?: string | null;
}

// Create Stripe Connect onboarding link
export function useCreateStripeConnectLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<StripeConnectLinkResponse> => {
      const { data, error } = await supabase.functions.invoke("create-stripe-connect-link");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as StripeConnectLinkResponse;
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      }
      queryClient.invalidateQueries({ queryKey: ["ownerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["stripeConnectStatus"] });
    },
    onError: (error: Error) => {
      console.error("Stripe Connect error:", error);
      toast.error(error.message || "Failed to start Stripe onboarding");
    },
  });
}

// Check Stripe Connect account status
export function useCheckStripeConnectStatus() {
  return useQuery({
    queryKey: ["stripeConnectStatus"],
    queryFn: async (): Promise<StripeConnectStatusResponse> => {
      const { data, error } = await supabase.functions.invoke("check-stripe-connect-status");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as StripeConnectStatusResponse;
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
  });
}

// Refresh Stripe Connect status (manual trigger)
export function useRefreshStripeConnectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<StripeConnectStatusResponse> => {
      const { data, error } = await supabase.functions.invoke("check-stripe-connect-status");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data as StripeConnectStatusResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["stripeConnectStatus"], data);
      queryClient.invalidateQueries({ queryKey: ["ownerProfile"] });

      if (data.payouts_enabled) {
        toast.success("Your Stripe account is ready for payouts!");
      } else if (data.connected && !data.details_submitted) {
        toast.info("Please complete your Stripe account setup");
      }
    },
    onError: (error: Error) => {
      console.error("Status check error:", error);
      toast.error(error.message || "Failed to check account status");
    },
  });
}

// Execute payout (admin only)
export function useExecuteP2PPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payoutId,
      bookingId,
      force = false,
    }: {
      payoutId?: string;
      bookingId?: string;
      force?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("execute-p2p-payout", {
        body: {
          payout_id: payoutId,
          booking_id: bookingId,
          force,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminP2PPayouts"] });
      queryClient.invalidateQueries({ queryKey: ["ownerPayouts"] });
      queryClient.invalidateQueries({ queryKey: ["ownerEarnings"] });
      toast.success("Payout executed successfully");
    },
    onError: (error: Error) => {
      console.error("Execute payout error:", error);
      toast.error(error.message || "Failed to execute payout");
    },
  });
}

// Hold payout (admin only)
export function useHoldP2PPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payoutId,
      reason,
    }: {
      payoutId: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("p2p_payouts")
        .update({
          is_held: true,
          held_reason: reason,
          held_at: new Date().toISOString(),
          held_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payoutId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminP2PPayouts"] });
      toast.success("Payout placed on hold");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to hold payout");
    },
  });
}

// Release payout hold (admin only)
export function useReleaseP2PPayoutHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId }: { payoutId: string }) => {
      const { data, error } = await supabase
        .from("p2p_payouts")
        .update({
          is_held: false,
          held_reason: null,
          held_at: null,
          held_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payoutId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminP2PPayouts"] });
      toast.success("Payout hold released");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to release hold");
    },
  });
}

// Get Stripe Connect account status badge
export function getStripeConnectStatusBadge(status: StripeConnectStatusResponse | null | undefined): {
  className: string;
  label: string;
} {
  if (!status || !status.connected) {
    return {
      className: "bg-muted text-muted-foreground border-muted",
      label: "Not Connected",
    };
  }

  if (status.payouts_enabled && status.charges_enabled) {
    return {
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      label: "Active",
    };
  }

  if (status.details_submitted) {
    return {
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      label: "Pending Verification",
    };
  }

  return {
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    label: "Setup Required",
  };
}
