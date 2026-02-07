/**
 * Driver Queue Hooks
 * Manage driver priority queue for zone-based dispatch
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface DriverQueueEntry {
  id: string;
  created_at: string;
  updated_at: string;
  region_id: string;
  driver_id: string;
  score: number;
  last_assigned_at: string | null;
  total_assigned_today: number;
  is_active: boolean;
  driver?: {
    id: string;
    full_name: string;
    phone: string;
    avatar_url: string | null;
    rating: number | null;
    is_online: boolean | null;
    last_active_at: string | null;
    current_lat: number | null;
    current_lng: number | null;
  };
}

export interface DriverScoreBreakdown {
  driverId: string;
  driverName: string;
  totalScore: number;
  distanceScore: number;
  ratingScore: number;
  fairnessScore: number;
  freshnessScore: number;
}

// Get driver queue for a region
export const useDriverQueue = (regionId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["driver-queue", regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const { data, error } = await supabase
        .from("driver_queue")
        .select(`
          *,
          driver:drivers!driver_id (
            id,
            full_name,
            phone,
            avatar_url,
            rating,
            is_online,
            last_active_at,
            current_lat,
            current_lng
          )
        `)
        .eq("region_id", regionId)
        .eq("is_active", true)
        .order("score", { ascending: false });

      if (error) throw error;
      return data as DriverQueueEntry[];
    },
    enabled: !!regionId,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Subscribe to queue changes
  useEffect(() => {
    if (!regionId) return;

    const channel = supabase
      .channel(`driver-queue-${regionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_queue",
          filter: `region_id=eq.${regionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["driver-queue", regionId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["driver-queue", regionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [regionId, queryClient]);

  return query;
};

// Get online drivers with scores for a region (for queue visualization)
export const useDriversWithScores = (regionId: string | null, pickupLat?: number, pickupLng?: number) => {
  return useQuery({
    queryKey: ["drivers-with-scores", regionId, pickupLat, pickupLng],
    queryFn: async () => {
      if (!regionId) return [];

      // Get online drivers in the region
      const { data: drivers, error: driversError } = await supabase
        .from("drivers")
        .select("*")
        .eq("region_id", regionId)
        .eq("is_online", true)
        .eq("status", "verified")
        .order("rating", { ascending: false });

      if (driversError) throw driversError;

      // Get queue entries
      const { data: queueEntries, error: queueError } = await supabase
        .from("driver_queue")
        .select("*")
        .eq("region_id", regionId)
        .eq("is_active", true);

      if (queueError) throw queueError;

      // Build map of queue entries by driver
      const queueMap = new Map(queueEntries?.map((q) => [q.driver_id, q]) || []);

      // Calculate scores for each driver
      const scoredDrivers = (drivers || []).map((driver) => {
        const queueEntry = queueMap.get(driver.id);
        
        // Calculate distance score (40 max)
        let distanceScore = 20; // Default if no coordinates
        if (driver.current_lat && driver.current_lng && pickupLat && pickupLng) {
          const distanceKm = haversineDistance(
            pickupLat,
            pickupLng,
            Number(driver.current_lat),
            Number(driver.current_lng)
          );
          distanceScore = Math.max(0, 40 - distanceKm * 4);
        }

        // Rating score (25 max)
        const ratingScore = (driver.rating || 4.0) * 5;

        // Fairness score (25 max)
        let fairnessScore = 25;
        if (queueEntry?.last_assigned_at) {
          const secondsSinceAssigned =
            (Date.now() - new Date(queueEntry.last_assigned_at).getTime()) / 1000;
          fairnessScore = Math.min(25, secondsSinceAssigned / 144);
        }

        // Freshness score (10 max)
        let freshnessScore = 0;
        if (driver.last_active_at) {
          const secondsSinceActive =
            (Date.now() - new Date(driver.last_active_at).getTime()) / 1000;
          if (secondsSinceActive < 30) freshnessScore = 10;
          else if (secondsSinceActive < 60) freshnessScore = 7;
          else if (secondsSinceActive < 120) freshnessScore = 4;
        }

        const totalScore = distanceScore + ratingScore + fairnessScore + freshnessScore;

        return {
          driverId: driver.id,
          driverName: driver.full_name,
          phone: driver.phone,
          avatarUrl: driver.avatar_url,
          rating: driver.rating,
          isOnline: driver.is_online,
          lastActiveAt: driver.last_active_at,
          lastAssignedAt: queueEntry?.last_assigned_at,
          totalAssignedToday: queueEntry?.total_assigned_today || 0,
          totalScore: Math.round(totalScore * 100) / 100,
          distanceScore: Math.round(distanceScore * 100) / 100,
          ratingScore: Math.round(ratingScore * 100) / 100,
          fairnessScore: Math.round(fairnessScore * 100) / 100,
          freshnessScore,
        };
      });

      // Sort by total score descending
      return scoredDrivers.sort((a, b) => b.totalScore - a.totalScore);
    },
    enabled: !!regionId,
    refetchInterval: 15000,
  });
};

// Manually trigger v2 dispatch for an order
export const useAutoAssignV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      serviceType = "eats",
    }: {
      orderId: string;
      serviceType?: "eats" | "rides";
    }) => {
      const { data, error } = await supabase.rpc("auto_assign_order_v2", {
        p_order_id: orderId,
        p_service_type: serviceType,
      });

      if (error) throw error;

      const result = data as {
        success: boolean;
        error?: string;
        driver_id?: string;
        driver_name?: string;
        score?: number;
      };

      if (!result.success) {
        throw new Error(result.error || "Assignment failed");
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["driver-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      toast.success(`Assigned to ${data.driver_name} (Score: ${data.score})`);
    },
    onError: (error) => {
      toast.error("Auto-assign failed: " + error.message);
    },
  });
};

// Rebuild queue scores for a region
export const useRebuildQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (regionId: string) => {
      // Get all online drivers in the region
      const { data: drivers, error: driversError } = await supabase
        .from("drivers")
        .select("id")
        .eq("region_id", regionId)
        .eq("is_online", true)
        .eq("status", "verified");

      if (driversError) throw driversError;

      // Ensure all drivers have queue entries
      for (const driver of drivers || []) {
        await supabase.from("driver_queue").upsert(
          {
            region_id: regionId,
            driver_id: driver.id,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "region_id,driver_id" }
        );
      }

      return drivers?.length || 0;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["driver-queue"] });
      toast.success(`Queue rebuilt with ${count} drivers`);
    },
    onError: (error) => {
      toast.error("Failed to rebuild queue: " + error.message);
    },
  });
};

// Helper function to calculate haversine distance
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
