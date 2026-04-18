/**
 * useStripeConnect — Stripe Connect Express + Instant Payouts
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ConnectStatus {
  connected: boolean;
  account_id?: string;
  charges_enabled?: boolean;
  details_submitted?: boolean;
  payouts_enabled?: boolean;
  instant_eligible?: boolean;
  requirements?: string[];
}

export function useConnectStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stripe-connect-status", user?.id],
    queryFn: async (): Promise<ConnectStatus> => {
      const { data, error } = await supabase.functions.invoke("connect-status", { body: {} });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });
}

export function useConnectOnboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (country: string = "US") => {
      const returnUrl = `${window.location.origin}${window.location.pathname}?connect=done`;
      const { data, error } = await supabase.functions.invoke("connect-onboard", {
        body: { country, return_url: returnUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { url: string; account_id: string };
    },
    onSuccess: (data) => {
      // Open Stripe onboarding in a centered popup so the user stays in-app.
      const w = 520;
      const h = 720;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      const popup = window.open(
        data.url,
        "stripe-connect-onboarding",
        `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );

      if (!popup) {
        // Popup blocked → fallback to same-tab redirect
        window.location.href = data.url;
        return;
      }

      toast.info("Complete Stripe setup in the popup window…");

      // Poll for popup close, then refresh status
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          queryClient.invalidateQueries({ queryKey: ["stripe-connect-status"] });
          toast.success("Checking Stripe status…");
        }
      }, 800);
    },
    onError: (e: any) => toast.error(e?.message || "Onboarding failed"),
  });
}

export function useInstantPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { amount_cents: number; method?: "instant" | "standard" }) => {
      const { data, error } = await supabase.functions.invoke("connect-instant-payout", {
        body: { amount_cents: params.amount_cents, method: params.method ?? "instant" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      const arrival = data?.arrival_date ? new Date(data.arrival_date * 1000).toLocaleDateString() : "soon";
      toast.success(
        data?.method === "instant" ? "Instant payout sent! ⚡" : "Standard payout submitted",
        { description: `Funds arrive ${arrival}` }
      );
    },
    onError: (e: any) => toast.error(e?.message || "Payout failed"),
  });
}
