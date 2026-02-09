import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerVerification } from "@/hooks/useCustomerVerification";
import { TRUST_SIGNALS, TRUST_TIERS, getTierForScore, TrustLevel, TrustSignal } from "@/config/trustLevel";

export interface SignalResult {
  signal: TrustSignal;
  earned: boolean;
}

export interface TrustLevelResult {
  level: TrustLevel;
  score: number;
  signals: SignalResult[];
  improvements: { label: string; path?: string }[];
  benefits: string[];
  isLoading: boolean;
}

export function useAccountTrustLevel(): TrustLevelResult {
  const { user } = useAuth();
  const { verification, isLoading: verificationLoading } = useCustomerVerification();

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["trust-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email_verified, phone_verified, created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching profile for trust:", error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Fetch order count (lightweight)
  const { data: orderCount = 0, isLoading: ordersLoading } = useQuery({
    queryKey: ["trust-order-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("food_orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", user.id)
        .eq("status", "delivered");
      if (error) {
        console.error("Error fetching order count for trust:", error);
        return 0;
      }
      return count ?? 0;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const isLoading = profileLoading || verificationLoading || ordersLoading;

  return useMemo(() => {
    const now = new Date();
    const createdAt = profile?.created_at ? new Date(profile.created_at) : now;
    const accountAgeDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const earnedMap: Record<string, boolean> = {
      email_verified: !!profile?.email_verified,
      phone_verified: !!profile?.phone_verified,
      identity_verified: verification?.status === "verified",
      account_age_30: accountAgeDays >= 30,
      account_age_90: accountAgeDays >= 90,
      has_orders: orderCount > 0,
      frequent_user: orderCount >= 5,
      profile_complete: !!(profile?.full_name && profile?.phone),
    };

    const signals: SignalResult[] = TRUST_SIGNALS.map((signal) => ({
      signal,
      earned: earnedMap[signal.id] ?? false,
    }));

    const score = signals.reduce((sum, s) => sum + (s.earned ? s.signal.weight : 0), 0);
    const level = getTierForScore(score);
    const tier = TRUST_TIERS[level];

    const improvements = signals
      .filter((s) => !s.earned && s.signal.improvement)
      .map((s) => ({ label: s.signal.improvement!, path: s.signal.improvementPath }));

    return {
      level,
      score,
      signals,
      improvements,
      benefits: tier.benefits,
      isLoading,
    };
  }, [profile, verification, orderCount, isLoading]);
}
