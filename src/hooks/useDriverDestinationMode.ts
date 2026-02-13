/**
 * Driver Destination Mode Hook
 * Manages destination mode sessions and provides smart matching data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DestinationSession {
  id: string;
  driver_id: string;
  destination_lat: number;
  destination_lng: number;
  destination_address: string | null;
  target_arrival_time: string | null;
  started_at: string;
  ended_at: string | null;
  status: string;
  trips_completed: number;
  created_at: string;
}

// Get active destination mode session for a driver
export const useActiveDestinationSession = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["destination-session", driverId],
    queryFn: async () => {
      if (!driverId) return null;

      const { data, error } = await (supabase as any)
        .from("destination_mode_sessions")
        .select("*")
        .eq("driver_id", driverId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data as DestinationSession | null;
    },
    enabled: !!driverId,
    refetchInterval: 30000,
  });
};

// Get today's usage count
export const useDestinationModeUsageToday = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["destination-mode-usage-today", driverId],
    queryFn: async () => {
      if (!driverId) return 0;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count, error } = await (supabase as any)
        .from("destination_mode_sessions")
        .select("*", { count: "exact", head: true })
        .eq("driver_id", driverId)
        .gte("started_at", todayStart.toISOString());

      if (error) throw error;
      return count || 0;
    },
    enabled: !!driverId,
  });
};

// Start destination mode
export const useStartDestinationMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      destinationLat,
      destinationLng,
      destinationAddress,
      targetArrivalTime,
    }: {
      driverId: string;
      destinationLat: number;
      destinationLng: number;
      destinationAddress?: string;
      targetArrivalTime?: string;
    }) => {
      // Check daily limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await (supabase as any)
        .from("destination_mode_sessions")
        .select("*", { count: "exact", head: true })
        .eq("driver_id", driverId)
        .gte("started_at", todayStart.toISOString());

      if ((count || 0) >= 2) {
        throw new Error("Daily destination mode limit reached (max 2 per day)");
      }

      // Cancel any existing active session
      await (supabase as any)
        .from("destination_mode_sessions")
        .update({ status: "cancelled", ended_at: new Date().toISOString() })
        .eq("driver_id", driverId)
        .eq("status", "active");

      const { data, error } = await (supabase as any)
        .from("destination_mode_sessions")
        .insert({
          driver_id: driverId,
          destination_lat: destinationLat,
          destination_lng: destinationLng,
          destination_address: destinationAddress || null,
          target_arrival_time: targetArrivalTime || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-session"] });
      queryClient.invalidateQueries({ queryKey: ["destination-mode-usage-today"] });
      toast.success("Destination mode activated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// End destination mode
export const useEndDestinationMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await (supabase as any)
        .from("destination_mode_sessions")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destination-session"] });
      queryClient.invalidateQueries({ queryKey: ["destination-mode-usage-today"] });
      toast.success("Destination mode ended");
    },
    onError: (error) => {
      toast.error("Failed to end destination mode: " + error.message);
    },
  });
};

/**
 * Calculate direction alignment score between a trip and driver's destination.
 * Returns a value 0-1 where 1 = perfect alignment.
 */
export function calculateDirectionAlignment(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
  destLat: number,
  destLng: number
): number {
  // Vector from pickup to dropoff
  const tripDx = dropoffLng - pickupLng;
  const tripDy = dropoffLat - pickupLat;

  // Vector from pickup to destination
  const destDx = destLng - pickupLng;
  const destDy = destLat - pickupLat;

  // Dot product and magnitudes
  const dot = tripDx * destDx + tripDy * destDy;
  const magTrip = Math.sqrt(tripDx * tripDx + tripDy * tripDy);
  const magDest = Math.sqrt(destDx * destDx + destDy * destDy);

  if (magTrip === 0 || magDest === 0) return 0;

  // Cosine of angle between vectors
  const cosAngle = Math.max(-1, Math.min(1, dot / (magTrip * magDest)));
  
  // Convert to 0-1 score (1 = same direction, 0 = opposite)
  return Math.max(0, (cosAngle + 1) / 2);
}
