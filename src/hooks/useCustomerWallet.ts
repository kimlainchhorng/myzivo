/**
 * Customer Wallet Hook
 * Manages wallet balance, transaction history, and credit application
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CustomerWallet {
  id: string;
  user_id: string;
  balance_cents: number;
  lifetime_credits_cents: number;
  pending_credits_cents: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount_cents: number;
  balance_after_cents: number;
  type: string;
  description: string | null;
  order_id: string | null;
  is_redeemed: boolean;
  reference_id: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface ApplyCreditInput {
  amount_cents: number;
  order_id: string;
}

// Max credit per order in cents ($25)
export const MAX_CREDIT_PER_ORDER = 2500;

export function useCustomerWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch wallet (or create if not exists)
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["customer-wallet", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to get existing wallet
      const { data: existing, error: fetchError } = await supabase
        .from("customer_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existing) return existing as CustomerWallet;

      // Create new wallet if none exists
      const { data: newWallet, error: createError } = await supabase
        .from("customer_wallets")
        .insert({
          user_id: user.id,
          balance_cents: 0,
          lifetime_credits_cents: 0,
          pending_credits_cents: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newWallet as CustomerWallet;
    },
    enabled: !!user?.id,
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions", user?.id],
    queryFn: async (): Promise<WalletTransaction[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("customer_wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as WalletTransaction[];
    },
    enabled: !!user?.id,
  });

  // Apply credit to order (calls apply_wallet_credit RPC)
  const applyCredit = useMutation({
    mutationFn: async (input: ApplyCreditInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("apply_wallet_credit", {
        p_user_id: user.id,
        p_amount_cents: input.amount_cents,
        p_order_id: input.order_id,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; new_balance?: number };
      if (!result.success) throw new Error(result.error || "Failed to apply credit");
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
    onError: (error: Error) => {
      console.error("Error applying credit:", error);
      toast.error(error.message || "Failed to apply credit");
    },
  });

  // Calculate max applicable credit for an order
  const calculateApplicableCredit = (orderTotalCents: number): number => {
    const balance = wallet?.balance_cents || 0;
    return Math.min(orderTotalCents, balance, MAX_CREDIT_PER_ORDER);
  };

  return {
    wallet,
    transactions,
    balanceCents: wallet?.balance_cents || 0,
    balanceDollars: (wallet?.balance_cents || 0) / 100,
    lifetimeEarnedDollars: (wallet?.lifetime_credits_cents || 0) / 100,
    applyCredit,
    calculateApplicableCredit,
    isLoading: walletLoading || transactionsLoading,
  };
}

// Hook for calculating credit to apply based on toggle state
export function useAppliedCredit(
  useCredits: boolean,
  orderTotalCents: number,
  walletBalanceCents: number
) {
  if (!useCredits || walletBalanceCents <= 0) {
    return {
      creditAppliedCents: 0,
      creditAppliedDollars: 0,
    };
  }

  const creditAppliedCents = Math.min(
    orderTotalCents,
    walletBalanceCents,
    MAX_CREDIT_PER_ORDER
  );

  return {
    creditAppliedCents,
    creditAppliedDollars: creditAppliedCents / 100,
  };
}
