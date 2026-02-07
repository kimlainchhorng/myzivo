/**
 * useBatches Hook
 * CRUD operations for delivery batches with optimization and assignment
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BatchStop {
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

export interface BatchOrder {
  id: string;
  status: string;
  delivery_address: string;
  total_amount_cents: number;
  customer_name: string | null;
  restaurant_name: string | null;
}

export interface BatchDetails {
  id: string;
  status: string;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  region_id: string | null;
  region_name: string | null;
  total_distance_km: number | null;
  total_duration_minutes: number | null;
  total_stops: number;
  notes: string | null;
  planned_start: string | null;
  planned_end: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface BatchWithStops {
  batch: BatchDetails;
  stops: BatchStop[];
  orders: BatchOrder[];
}

export interface DeliveryBatch {
  id: string;
  status: string;
  driver_id: string | null;
  region_id: string | null;
  total_distance_km: number | null;
  total_duration_minutes: number | null;
  total_stops: number | null;
  notes: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  driver?: {
    id: string;
    full_name: string;
    phone: string | null;
  } | null;
  region?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    orders: number;
  };
}

type BatchStatus = "draft" | "assigned" | "in_progress" | "completed" | "cancelled";

export function useBatches(statusFilter?: BatchStatus | "all") {
  return useQuery({
    queryKey: ["delivery-batches", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("delivery_batches")
        .select(`
          id,
          status,
          driver_id,
          region_id,
          total_distance_km,
          total_duration_minutes,
          total_stops,
          notes,
          created_at,
          started_at,
          completed_at,
          drivers:driver_id (id, full_name, phone),
          regions:region_id (id, name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((b: any) => ({
        ...b,
        driver: b.drivers,
        region: b.regions,
      })) as DeliveryBatch[];
    },
  });
}

export function useBatchDetails(batchId: string | undefined) {
  return useQuery({
    queryKey: ["batch-details", batchId],
    queryFn: async () => {
      if (!batchId) return null;

      const { data, error } = await supabase.rpc("get_batch_details", {
        p_batch_id: batchId,
      });

      if (error) throw error;
      if (!data || !(data as any).success) {
        throw new Error((data as any)?.error || "Failed to load batch");
      }

      return data as unknown as { batch: BatchDetails; stops: BatchStop[]; orders: BatchOrder[] };
    },
    enabled: !!batchId,
  });
}

export function useUnbatchedOrders(regionId?: string) {
  return useQuery({
    queryKey: ["unbatched-orders", regionId],
    queryFn: async () => {
      let query = supabase
        .from("food_orders")
        .select(`
          id,
          status,
          created_at,
          delivery_address,
          delivery_lat,
          delivery_lng,
          pickup_lat,
          pickup_lng,
          total_amount_cents,
          customer_name,
          customer_phone,
          is_scheduled,
          deliver_by,
          pickup_window_start,
          pickup_window_end,
          restaurant_id,
          region_id,
          restaurants:restaurant_id (id, name, address, lat, lng)
        `)
        .is("batch_id", null)
        .is("driver_id", null)
        .in("status", ["pending", "confirmed", "ready_for_pickup"])
        .order("deliver_by", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (regionId) {
        query = query.eq("region_id", regionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((o: any) => ({
        ...o,
        restaurant: o.restaurants,
      }));
    },
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderIds,
      regionId,
      notes,
    }: {
      orderIds: string[];
      regionId?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc("create_batch_from_orders", {
        p_order_ids: orderIds,
        p_region_id: regionId || null,
        p_notes: notes || null,
      });

      if (error) throw error;
      return data as string; // Returns batch ID
    },
    onSuccess: (batchId) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
      queryClient.invalidateQueries({ queryKey: ["unbatched-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      toast.success("Batch created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create batch");
    },
  });
}

export function useOptimizeBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      batchId,
      startLat,
      startLng,
    }: {
      batchId: string;
      startLat?: number;
      startLng?: number;
    }) => {
      const { data, error } = await supabase.rpc("optimize_batch_route", {
        p_batch_id: batchId,
        p_start_lat: startLat || null,
        p_start_lng: startLng || null,
      });

      if (error) throw error;
      return data as { success: boolean; total_distance_miles: number; estimated_duration_minutes: number };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["batch-details", variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
      if (result.success) {
        toast.success(`Route optimized: ${result.total_distance_miles} mi, ~${result.estimated_duration_minutes} min`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to optimize route");
    },
  });
}

export function useAssignBatchDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, driverId }: { batchId: string; driverId: string }) => {
      const { data, error } = await supabase.rpc("assign_batch_to_driver", {
        p_batch_id: batchId,
        p_driver_id: driverId,
      });

      if (error) throw error;
      const result = data as any;
      if (!result.success) {
        throw new Error(result.error || "Failed to assign driver");
      }
      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["batch-details", variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      toast.success(`Driver assigned to batch with ${result.order_count} orders`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign driver");
    },
  });
}

export function useCancelBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchId: string) => {
      const { data, error } = await supabase.rpc("cancel_batch", {
        p_batch_id: batchId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-batches"] });
      queryClient.invalidateQueries({ queryKey: ["unbatched-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      toast.success("Batch cancelled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel batch");
    },
  });
}

export function useUpdateStopOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stopId, newOrder }: { stopId: string; newOrder: number; batchId: string }) => {
      const { error } = await supabase
        .from("batch_stops")
        .update({ stop_order: newOrder })
        .eq("id", stopId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["batch-details", variables.batchId] });
    },
  });
}

export function useReorderBatchStops() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId, stopIds }: { batchId: string; stopIds: string[] }) => {
      // Update each stop with new order
      const updates = stopIds.map((id, index) =>
        supabase
          .from("batch_stops")
          .update({ stop_order: index + 1 })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["batch-details", variables.batchId] });
      toast.success("Stop order updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reorder stops");
    },
  });
}
