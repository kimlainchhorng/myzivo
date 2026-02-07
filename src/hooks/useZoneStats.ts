/**
 * Zone Statistics Hooks
 * Fetch zone-level stats for dispatch management
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ZoneStats {
  online_drivers: number;
  pending_orders: number;
  surge_multiplier: number;
  avg_wait_minutes: number;
}

export interface ZoneWithStats {
  id: string;
  name: string;
  city: string;
  state: string;
  is_active: boolean;
  center_lat: number | null;
  center_lng: number | null;
  stats: ZoneStats;
}

// Get stats for a single zone
export const useZoneStats = (regionId: string | null) => {
  return useQuery({
    queryKey: ["zone-stats", regionId],
    queryFn: async () => {
      if (!regionId) return null;

      const { data, error } = await supabase.rpc("get_zone_stats", {
        p_region_id: regionId,
      });

      if (error) throw error;
      return data as unknown as ZoneStats;
    },
    enabled: !!regionId,
    refetchInterval: 30000,
  });
};

// Get all zones with their stats
export const useAllZonesWithStats = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["all-zones-with-stats"],
    queryFn: async () => {
      // Fetch all regions
      const { data: regions, error: regionsError } = await supabase
        .from("regions")
        .select("id, name, city, state, is_active, center_lat, center_lng")
        .order("name");

      if (regionsError) throw regionsError;

      // Fetch stats for each region
      const zonesWithStats = await Promise.all(
        (regions || []).map(async (region) => {
          const { data: stats } = await supabase.rpc("get_zone_stats", {
            p_region_id: region.id,
          });

          return {
            ...region,
            stats: (stats as unknown as ZoneStats) || {
              online_drivers: 0,
              pending_orders: 0,
              surge_multiplier: 1.0,
              avg_wait_minutes: 0,
            },
          };
        })
      );

      return zonesWithStats as ZoneWithStats[];
    },
    refetchInterval: 30000,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("zones-stats-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-zones-with-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-zones-with-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Get drivers in a zone
export const useZoneDrivers = (regionId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["zone-drivers", regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const { data, error } = await supabase
        .from("drivers")
        .select(`
          id,
          full_name,
          phone,
          avatar_url,
          vehicle_type,
          is_online,
          status,
          rating,
          total_trips,
          last_active_at,
          current_lat,
          current_lng
        `)
        .eq("region_id", regionId)
        .eq("status", "verified")
        .order("is_online", { ascending: false })
        .order("rating", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!regionId,
    refetchInterval: 15000,
  });

  // Subscribe to driver updates
  useEffect(() => {
    if (!regionId) return;

    const channel = supabase
      .channel(`zone-drivers-${regionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `region_id=eq.${regionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["zone-drivers", regionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [regionId, queryClient]);

  return query;
};

// Get restaurants in a zone
export const useZoneRestaurants = (regionId: string | null) => {
  return useQuery({
    queryKey: ["zone-restaurants", regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const { data, error } = await supabase
        .from("restaurants")
        .select(`
          id,
          name,
          address,
          is_open,
          rating,
          lat,
          lng
        `)
        .eq("region_id", regionId)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!regionId,
  });
};

// Get pending orders in a zone
export const useZonePendingOrders = (regionId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["zone-pending-orders", regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          created_at,
          delivery_address,
          delivery_fee_cents,
          restaurants:restaurant_id (name)
        `)
        .eq("region_id", regionId)
        .in("status", ["pending", "confirmed", "ready_for_pickup"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!regionId,
    refetchInterval: 10000,
  });

  // Subscribe to order updates
  useEffect(() => {
    if (!regionId) return;

    const channel = supabase
      .channel(`zone-orders-${regionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
          filter: `region_id=eq.${regionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["zone-pending-orders", regionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [regionId, queryClient]);

  return query;
};
