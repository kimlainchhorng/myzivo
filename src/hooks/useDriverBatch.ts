/**
 * useDriverBatch Hook
 * Driver-side batch management and stop status updates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface DriverBatchStop {
  id: string;
  stop_order: number;
  kind: "pickup" | "dropoff";
  stop_type: string;
  address: string;
  lat: number | null;
  lng: number | null;
  status: string;
  food_order_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  eta: string | null;
}

export interface DriverBatch {
  id: string;
  status: string;
  total_distance_km: number | null;
  total_duration_minutes: number | null;
  total_stops: number;
  notes: string | null;
  started_at: string | null;
  created_at: string;
  stops: DriverBatchStop[];
}

export function useDriverActiveBatch(driverId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["driver-active-batch", driverId],
    queryFn: async () => {
      if (!driverId) return null;

      // Get active batch for this driver
      const { data: batches, error: batchError } = await supabase
        .from("delivery_batches")
        .select(`
          id,
          status,
          total_distance_km,
          total_duration_minutes,
          total_stops,
          notes,
          started_at,
          created_at
        `)
        .eq("driver_id", driverId)
        .in("status", ["assigned", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (batchError) throw batchError;
      if (!batches || batches.length === 0) return null;

      const batch = batches[0];

      // Get stops for this batch
      const { data: stops, error: stopsError } = await supabase
        .from("batch_stops")
        .select(`
          id,
          stop_order,
          kind,
          stop_type,
          address,
          lat,
          lng,
          status,
          food_order_id,
          customer_name,
          customer_phone,
          arrived_at,
          completed_at,
          eta
        `)
        .eq("batch_id", batch.id)
        .order("stop_order", { ascending: true });

      if (stopsError) throw stopsError;

      return {
        ...batch,
        stops: (stops || []) as DriverBatchStop[],
      } as DriverBatch;
    },
    enabled: !!driverId,
    refetchInterval: 30000, // Refetch every 30s
  });

  // Subscribe to batch changes
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-batch-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_batches",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["driver-active-batch", driverId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "batch_stops",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["driver-active-batch", driverId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, queryClient]);

  return query;
}

export function useStartBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, driverId }: { batchId: string; driverId: string }) => {
      const { data, error } = await supabase.rpc("start_batch", {
        p_batch_id: batchId,
        p_driver_id: driverId,
      });

      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || "Failed to start batch");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-batch"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
      toast.success("Batch started! Navigate to your first stop.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start batch");
    },
  });
}

export function useUpdateStopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stopId,
      status,
      driverId,
    }: {
      stopId: string;
      status: "arrived" | "completed";
      driverId: string;
    }) => {
      const { data, error } = await supabase.rpc("update_batch_stop_status", {
        p_stop_id: stopId,
        p_status: status,
        p_driver_id: driverId,
      });

      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || "Failed to update stop");
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-batch"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      
      if (result.batch_completed) {
        toast.success("🎉 All deliveries complete! Great job!");
      } else {
        toast.success("Stop updated");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stop");
    },
  });
}

export function useDriverCurrentLocation(driverId: string | undefined) {
  return useQuery({
    queryKey: ["driver-location", driverId],
    queryFn: async () => {
      if (!driverId) return null;

      const { data, error } = await supabase
        .from("drivers")
        .select("current_lat, current_lng, last_active_at")
        .eq("id", driverId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!driverId,
    refetchInterval: 10000, // Refresh every 10s
  });
}
