/**
 * Renter Beta Settings Hooks
 * Hooks for fetching and managing renter beta mode settings
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RenterBetaSettings {
  betaMode: boolean;
  betaCity: string;
  betaMessage: string;
}

interface SystemSetting {
  key: string;
  value: string;
}

const findByKey = (data: SystemSetting[] | null, key: string): string | null => {
  if (!data) return null;
  const setting = data.find((s) => s.key === key);
  return setting?.value ?? null;
};

const parseBoolean = (value: string | null): boolean => {
  if (!value) return false;
  return value === "true" || value === '"true"';
};

const parseString = (value: string | null): string => {
  if (!value) return "";
  // Remove surrounding quotes if present
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
};

/**
 * Fetch renter beta mode settings
 * These settings control whether renter signups are invite-only
 */
export function useRenterBetaSettings() {
  return useQuery<RenterBetaSettings>({
    queryKey: ["renterBetaSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [
          "p2p_renter_beta_mode",
          "p2p_renter_beta_city",
          "p2p_renter_beta_message"
        ]);
      
      if (error) throw error;
      
      return {
        betaMode: parseBoolean(findByKey(data as SystemSetting[], "p2p_renter_beta_mode")),
        betaCity: parseString(findByKey(data as SystemSetting[], "p2p_renter_beta_city")),
        betaMessage: parseString(findByKey(data as SystemSetting[], "p2p_renter_beta_message")),
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Admin: Update renter beta setting
 */
export function useUpdateRenterBetaSetting() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: "p2p_renter_beta_mode" | "p2p_renter_beta_city" | "p2p_renter_beta_message"; 
      value: boolean | string;
    }) => {
      if (!isAdmin) {
        throw new Error("Admin access required");
      }

      // Serialize the value appropriately
      let serializedValue: string;
      if (typeof value === "boolean") {
        serializedValue = value.toString();
      } else {
        serializedValue = `"${value}"`;
      }

      const { error } = await supabase
        .from("system_settings")
        .update({ 
          value: serializedValue,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renterBetaSettings"] });
      toast.success("Setting updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update setting");
    },
  });
}

/**
 * Check if a user has a valid invite
 */
export function useRenterInviteStatus(email?: string) {
  return useQuery({
    queryKey: ["renterInviteStatus", email],
    queryFn: async () => {
      if (!email) return null;
      
      const { data, error } = await supabase
        .from("p2p_renter_invites")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("used", false)
        .maybeSingle();
      
      if (error) throw error;
      
      // Check expiration
      if (data?.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }
      
      return data;
    },
    enabled: !!email,
    staleTime: 1000 * 60, // Cache for 1 minute
  });
}
