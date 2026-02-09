/**
 * useCompanyInviteCode Hook
 * Validate and redeem company invite codes
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ValidateResult {
  isValid: boolean;
  companyName?: string;
  error?: string;
}

interface RedeemResult {
  success: boolean;
  companyId?: string;
  companyName?: string;
  error?: string;
}

export function useValidateCompanyCode() {
  const [isValidating, setIsValidating] = useState(false);

  const validate = async (code: string): Promise<ValidateResult> => {
    if (!code || code.length < 4) {
      return { isValid: false, error: "Code must be at least 4 characters" };
    }

    setIsValidating(true);
    try {
      // Check if code exists and is active
      const { data, error } = await supabase
        .from("company_invite_codes")
        .select(`
          id,
          expires_at,
          max_uses,
          uses_count,
          is_active,
          business_accounts!inner (
            company_name
          )
        `)
        .ilike("invite_code", code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        return { isValid: false, error: "Failed to validate code" };
      }

      if (!data) {
        return { isValid: false, error: "Invalid invite code" };
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { isValid: false, error: "Invite code has expired" };
      }

      // Check max uses
      if (data.max_uses !== null && data.uses_count >= data.max_uses) {
        return { isValid: false, error: "Invite code has reached maximum uses" };
      }

      const businessAccount = data.business_accounts as unknown as { company_name: string };

      return {
        isValid: true,
        companyName: businessAccount.company_name,
      };
    } catch (err) {
      return { isValid: false, error: "Failed to validate code" };
    } finally {
      setIsValidating(false);
    }
  };

  return { validate, isValidating };
}

export function useRedeemCompanyCode() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (code: string): Promise<RedeemResult> => {
      if (!user?.id) {
        return { success: false, error: "You must be logged in to join a company" };
      }

      // Call the secure RPC function
      const { data, error } = await supabase
        .rpc("redeem_company_invite_code", { _code: code.toUpperCase() });

      if (error) {
        console.error("Error redeeming code:", error);
        return { success: false, error: "Failed to redeem invite code" };
      }

      const result = data as { success: boolean; company_id?: string; company_name?: string; error?: string };

      if (!result.success) {
        return { success: false, error: result.error || "Failed to join company" };
      }

      return {
        success: true,
        companyId: result.company_id,
        companyName: result.company_name,
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["business-membership", user?.id] });
      }
    },
  });
}
