/**
 * Zone Surge Pricing Hooks
 * Manage surge rules, overrides, and real-time multipliers per zone
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface SurgeRule {
  id: string;
  created_at: string;
  updated_at: string;
  region_id: string;
  name: string;
  is_active: boolean;
  min_pending_orders: number;
  max_online_drivers: number;
  surge_multiplier: number;
  max_multiplier: number;
  starts_at: string | null;
  ends_at: string | null;
  day_of_week: number[] | null;
  priority: number;
}

export interface SurgeOverride {
  id: string;
  created_at: string;
  region_id: string;
  forced_multiplier: number;
  reason: string | null;
  created_by: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface ZoneSurgeInfo {
  regionId: string;
  multiplier: number;
  isOverride: boolean;
  onlineDrivers: number;
  pendingOrders: number;
}

// Fetch surge rules for a region or all
export const useSurgeRules = (regionId?: string | null) => {
  return useQuery({
    queryKey: ["surge-rules", regionId],
    queryFn: async () => {
      let query = supabase
        .from("surge_rules")
        .select("*")
        .order("priority", { ascending: false });

      if (regionId) {
        query = query.eq("region_id", regionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SurgeRule[];
    },
  });
};

// Create surge rule
export const useCreateSurgeRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Partial<SurgeRule>) => {
      const { data, error } = await supabase
        .from("surge_rules")
        .insert(rule as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surge-rules"] });
      toast.success("Surge rule created");
    },
    onError: (error) => {
      toast.error("Failed to create surge rule: " + error.message);
    },
  });
};

// Update surge rule
export const useUpdateSurgeRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SurgeRule> & { id: string }) => {
      const { data, error } = await supabase
        .from("surge_rules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surge-rules"] });
      toast.success("Surge rule updated");
    },
    onError: (error) => {
      toast.error("Failed to update surge rule: " + error.message);
    },
  });
};

// Delete surge rule
export const useDeleteSurgeRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("surge_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surge-rules"] });
      toast.success("Surge rule deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete surge rule: " + error.message);
    },
  });
};

// Fetch surge overrides
export const useSurgeOverrides = (regionId?: string | null) => {
  return useQuery({
    queryKey: ["surge-overrides", regionId],
    queryFn: async () => {
      let query = supabase
        .from("surge_overrides")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (regionId) {
        query = query.eq("region_id", regionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SurgeOverride[];
    },
  });
};

// Create surge override
export const useCreateSurgeOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (override: Partial<SurgeOverride>) => {
      // Deactivate existing overrides for this region
      if (override.region_id) {
        await supabase
          .from("surge_overrides")
          .update({ is_active: false })
          .eq("region_id", override.region_id)
          .eq("is_active", true);
      }

      const { data, error } = await supabase
        .from("surge_overrides")
        .insert(override as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surge-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["zone-surge"] });
      toast.success("Surge override applied");
    },
    onError: (error) => {
      toast.error("Failed to apply surge override: " + error.message);
    },
  });
};

// Clear surge override
export const useClearSurgeOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (regionId: string) => {
      const { error } = await supabase
        .from("surge_overrides")
        .update({ is_active: false })
        .eq("region_id", regionId)
        .eq("is_active", true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surge-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["zone-surge"] });
      toast.success("Surge override cleared");
    },
    onError: (error) => {
      toast.error("Failed to clear surge override: " + error.message);
    },
  });
};

// Get zone surge multiplier (real-time polling)
export const useZoneSurgeMultiplier = (regionId: string | null) => {
  return useQuery({
    queryKey: ["zone-surge", regionId],
    queryFn: async () => {
      if (!regionId) return 1.0;

      const { data, error } = await supabase.rpc("get_zone_surge_multiplier", {
        p_region_id: regionId,
      });

      if (error) throw error;
      return data as number;
    },
    enabled: !!regionId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

// Get all zones surge multipliers
export const useAllZonesSurge = (regionIds: string[]) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["all-zones-surge", regionIds],
    queryFn: async () => {
      if (!regionIds.length) return [];

      const results = await Promise.all(
        regionIds.map(async (regionId) => {
          const [surgeResult, statsResult] = await Promise.all([
            supabase.rpc("get_zone_surge_multiplier", { p_region_id: regionId }),
            supabase.rpc("get_zone_stats", { p_region_id: regionId }),
          ]);

          const stats = statsResult.data as {
            online_drivers: number;
            pending_orders: number;
            surge_multiplier: number;
            avg_wait_minutes: number;
          } | null;

          return {
            regionId,
            multiplier: surgeResult.data as number,
            onlineDrivers: stats?.online_drivers ?? 0,
            pendingOrders: stats?.pending_orders ?? 0,
          };
        })
      );

      return results;
    },
    enabled: regionIds.length > 0,
    refetchInterval: 30000,
  });

  // Subscribe to surge_overrides changes
  useEffect(() => {
    const channel = supabase
      .channel("surge-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "surge_overrides" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-zones-surge"] });
          queryClient.invalidateQueries({ queryKey: ["zone-surge"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
