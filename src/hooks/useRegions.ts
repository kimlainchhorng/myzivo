/**
 * Region management hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Region, RegionWithSettings } from "@/types/region";

// Fetch all regions with their settings
export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*, region_settings(*)")
        .order("city");

      if (error) throw error;
      return data as unknown as RegionWithSettings[];
    },
  });
}

// Fetch single region with settings
export function useRegionById(regionId: string | null) {
  return useQuery({
    queryKey: ["region", regionId],
    queryFn: async () => {
      if (!regionId) return null;
      const { data, error } = await supabase
        .from("regions")
        .select("*, region_settings(*)")
        .eq("id", regionId)
        .single();

      if (error) throw error;
      return data as unknown as RegionWithSettings;
    },
    enabled: !!regionId,
  });
}

// Create a new region
export function useCreateRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (region: {
      name: string;
      city: string;
      state: string;
      country?: string;
      timezone?: string;
      currency?: string;
    }) => {
      const { data, error } = await supabase
        .from("regions")
        .insert({
          name: region.name,
          city: region.city,
          state: region.state,
          country: region.country || "US",
          timezone: region.timezone || "America/New_York",
          currency: region.currency || "USD",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create region: " + error.message);
    },
  });
}

// Update region
export function useUpdateRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Region> }) => {
      const { error } = await supabase
        .from("regions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update region: " + error.message);
    },
  });
}

// Disable region (forces all drivers offline)
export function useDisableRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ regionId, reason }: { regionId: string; reason?: string }) => {
      // Update region status
      const { error: regionError } = await supabase
        .from("regions")
        .update({
          is_active: false,
          disabled_at: new Date().toISOString(),
          disabled_reason: reason || null,
        })
        .eq("id", regionId);

      if (regionError) throw regionError;

      // Force all drivers in region offline
      const { error: driverError } = await supabase
        .from("drivers")
        .update({ is_online: false })
        .eq("region_id", regionId);

      if (driverError) throw driverError;

      // Log the change
      await supabase.from("region_change_logs").insert({
        entity_type: "region",
        entity_id: regionId,
        action: "region_disabled",
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Region disabled - all drivers forced offline");
    },
    onError: (error: Error) => {
      toast.error("Failed to disable region: " + error.message);
    },
  });
}

// Enable region
export function useEnableRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (regionId: string) => {
      const { error } = await supabase
        .from("regions")
        .update({
          is_active: true,
          disabled_at: null,
          disabled_reason: null,
        })
        .eq("id", regionId);

      if (error) throw error;

      // Log the change
      await supabase.from("region_change_logs").insert({
        entity_type: "region",
        entity_id: regionId,
        action: "region_enabled",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region enabled");
    },
    onError: (error: Error) => {
      toast.error("Failed to enable region: " + error.message);
    },
  });
}

// Update region settings
export function useUpdateRegionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ regionId, updates }: { regionId: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("region_settings")
        .update(updates)
        .eq("region_id", regionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      toast.success("Region settings updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update settings: " + error.message);
    },
  });
}

// Move driver to different region (admin only)
export function useMoveDriverToRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      newRegionId,
      reason,
    }: {
      driverId: string;
      newRegionId: string;
      reason?: string;
    }) => {
      // Get current region
      const { data: driver } = await supabase
        .from("drivers")
        .select("region_id")
        .eq("id", driverId)
        .single();

      // Update driver (trigger will log the change)
      const { error } = await supabase
        .from("drivers")
        .update({ region_id: newRegionId, is_online: false })
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver moved to new region");
    },
    onError: (error: Error) => {
      toast.error("Failed to move driver: " + error.message);
    },
  });
}

// Assign driver to region (for unassigned drivers)
export function useAssignDriverToRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      regionId,
    }: {
      driverId: string;
      regionId: string;
    }) => {
      const { error } = await supabase
        .from("drivers")
        .update({ region_id: regionId })
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver assigned to region");
    },
    onError: (error: Error) => {
      toast.error("Failed to assign driver: " + error.message);
    },
  });
}

// Get region stats
export function useRegionStats(regionId: string | null) {
  return useQuery({
    queryKey: ["region-stats", regionId],
    queryFn: async () => {
      let driverQuery = supabase.from("drivers").select("*", { count: "exact", head: true });
      let tripQuery = supabase.from("trips").select("fare_amount, status");
      let orderQuery = supabase.from("food_orders").select("total_amount, status");

      if (regionId) {
        driverQuery = driverQuery.eq("region_id", regionId);
        tripQuery = tripQuery.eq("region_id", regionId);
        orderQuery = orderQuery.eq("region_id", regionId);
      }

      const [drivers, trips, orders] = await Promise.all([
        driverQuery,
        tripQuery,
        orderQuery,
      ]);

      const completedTrips = trips.data?.filter(t => t.status === "completed") || [];
      const deliveredOrders = orders.data?.filter((o: { status: string }) => o.status === "delivered") || [];

      return {
        totalDrivers: drivers.count || 0,
        totalTrips: trips.data?.length || 0,
        completedTrips: completedTrips.length,
        totalOrders: orders.data?.length || 0,
        deliveredOrders: deliveredOrders.length,
        tripRevenue: completedTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0),
        orderRevenue: deliveredOrders.reduce((sum, o: { total_amount?: number }) => sum + (o.total_amount || 0), 0),
      };
    },
    enabled: true,
  });
}
