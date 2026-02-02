/**
 * Region bonus campaign hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RegionBonus, BonusType, ServiceType } from "@/types/region";

// Fetch bonuses for a region
export function useRegionBonuses(regionId: string | null) {
  return useQuery({
    queryKey: ["region-bonuses", regionId],
    queryFn: async () => {
      if (!regionId) return [];
      
      const { data, error } = await supabase
        .from("region_bonuses")
        .select("*")
        .eq("region_id", regionId)
        .order("starts_at", { ascending: false });

      if (error) throw error;
      return data as RegionBonus[];
    },
    enabled: !!regionId,
  });
}

// Fetch all active bonuses (for driver app)
export function useActiveBonuses(regionId: string | null) {
  return useQuery({
    queryKey: ["active-bonuses", regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("region_bonuses")
        .select("*")
        .eq("region_id", regionId)
        .eq("is_active", true)
        .lte("starts_at", now)
        .gte("ends_at", now)
        .order("bonus_amount", { ascending: false });

      if (error) throw error;
      return data as RegionBonus[];
    },
    enabled: !!regionId,
  });
}

// Create bonus campaign
export function useCreateRegionBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bonus: {
      region_id: string;
      name: string;
      description?: string;
      bonus_type: BonusType;
      target_value: number;
      bonus_amount: number;
      service_type?: ServiceType;
      starts_at: string;
      ends_at: string;
    }) => {
      const { data, error } = await supabase
        .from("region_bonuses")
        .insert(bonus)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["region-bonuses", variables.region_id] });
      toast.success("Bonus campaign created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create bonus: " + error.message);
    },
  });
}

// Update bonus
export function useUpdateRegionBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RegionBonus> }) => {
      const { data, error } = await supabase
        .from("region_bonuses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["region-bonuses", data.region_id] });
      toast.success("Bonus updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update bonus: " + error.message);
    },
  });
}

// Delete bonus
export function useDeleteRegionBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, regionId }: { id: string; regionId: string }) => {
      const { error } = await supabase
        .from("region_bonuses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return regionId;
    },
    onSuccess: (regionId) => {
      queryClient.invalidateQueries({ queryKey: ["region-bonuses", regionId] });
      toast.success("Bonus deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete bonus: " + error.message);
    },
  });
}

// Toggle bonus active status
export function useToggleRegionBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("region_bonuses")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["region-bonuses", data.region_id] });
      toast.success(data.is_active ? "Bonus activated" : "Bonus deactivated");
    },
    onError: (error: Error) => {
      toast.error("Failed to toggle bonus: " + error.message);
    },
  });
}
