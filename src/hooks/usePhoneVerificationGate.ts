/**
 * usePhoneVerificationGate
 * Checks if the current user's phone is verified via v_customer_phone_status.
 * If not verified, redirects to /verify-phone.
 */


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PhoneGateResult {
  isChecking: boolean;
  isVerified: boolean;
}

export function usePhoneVerificationGate(enabled = false): PhoneGateResult {
  // Phone verification gate is currently disabled for all customers
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["phone-verification-gate", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("v_customer_phone_status" as any)
        .select("phone_status")
        .eq("customer_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Phone gate check failed:", error);
        return null;
      }
      return data as unknown as { phone_status: string } | null;
    },
    enabled: !!user?.id && enabled,
    staleTime: 1000 * 60 * 2,
  });

  const isVerified = data?.phone_status === "verified";

  return {
    isChecking: isLoading,
    isVerified,
  };
}
