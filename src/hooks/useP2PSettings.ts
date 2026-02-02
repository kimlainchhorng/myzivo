/**
 * P2P Settings Hooks
 * Hooks for fetching and managing P2P-specific settings like beta mode
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface P2PBetaSettings {
  betaMode: boolean;
  betaCities: string[];
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

const parseArray = (value: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
 * Fetch P2P beta mode settings
 * These settings are public and can be read by anyone
 */
export function useP2PBetaSettings() {
  return useQuery<P2PBetaSettings>({
    queryKey: ["p2pBetaSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [
          "p2p_owner_beta_mode",
          "p2p_beta_cities",
          "p2p_beta_message"
        ]);
      
      if (error) throw error;
      
      return {
        betaMode: parseBoolean(findByKey(data as SystemSetting[], "p2p_owner_beta_mode")),
        betaCities: parseArray(findByKey(data as SystemSetting[], "p2p_beta_cities")),
        betaMessage: parseString(findByKey(data as SystemSetting[], "p2p_beta_message")),
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Admin: Update P2P beta setting
 */
export function useUpdateP2PBetaSetting() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: "p2p_owner_beta_mode" | "p2p_beta_cities" | "p2p_beta_message"; 
      value: boolean | string[] | string;
    }) => {
      if (!isAdmin) {
        throw new Error("Admin access required");
      }

      // Serialize the value appropriately
      let serializedValue: string;
      if (typeof value === "boolean") {
        serializedValue = value.toString();
      } else if (Array.isArray(value)) {
        serializedValue = JSON.stringify(value);
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
      queryClient.invalidateQueries({ queryKey: ["p2pBetaSettings"] });
      toast.success("Setting updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update setting");
    },
  });
}

/**
 * Parse comma-separated string to array of cities
 */
export function parseCitiesToArray(input: string): string[] {
  return input
    .split(",")
    .map((city) => city.trim())
    .filter((city) => city.length > 0);
}

/**
 * Format cities array to comma-separated string
 */
export function formatCitiesArray(cities: string[]): string {
  return cities.join(", ");
}
