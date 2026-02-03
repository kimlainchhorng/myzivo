/**
 * Vehicle Delivery Hooks
 * Manage delivery/pickup options, pricing, and task creation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VehicleDeliverySettings {
  delivery_enabled: boolean;
  max_delivery_distance_miles: number;
  delivery_fee_type: "flat" | "per_mile";
  delivery_base_fee: number;
  delivery_per_mile_fee: number;
  delivery_hours_start: string;
  delivery_hours_end: string;
  pickup_enabled: boolean;
  pickup_fee_type: "flat" | "per_mile";
  pickup_base_fee: number;
  pickup_per_mile_fee: number;
}

export interface DeliveryTask {
  id: string;
  booking_id: string;
  task_type: "delivery" | "pickup";
  driver_id: string | null;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  distance_miles: number | null;
  status: "pending" | "assigned" | "accepted" | "en_route" | "arrived" | "completed" | "cancelled";
  scheduled_at: string;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  vehicle_photos: string[];
  condition_notes: string | null;
  handoff_verified: boolean;
  total_fee: number;
  driver_payout: number | null;
  platform_fee: number | null;
  created_at: string;
}

export interface DeliveryFeeCalculation {
  deliveryFee: number;
  pickupFee: number;
  totalDeliveryFee: number;
  deliveryDistance: number;
  isWithinRange: boolean;
}

// Fetch vehicle delivery settings
export function useVehicleDeliverySettings(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["vehicleDeliverySettings", vehicleId],
    queryFn: async (): Promise<VehicleDeliverySettings | null> => {
      if (!vehicleId) return null;

      const { data, error } = await supabase
        .from("p2p_vehicles")
        .select(`
          delivery_enabled, max_delivery_distance_miles,
          delivery_fee_type, delivery_base_fee, delivery_per_mile_fee,
          delivery_hours_start, delivery_hours_end,
          pickup_enabled, pickup_fee_type, pickup_base_fee, pickup_per_mile_fee
        `)
        .eq("id", vehicleId)
        .single();

      if (error) throw error;
      return data as unknown as VehicleDeliverySettings;
    },
    enabled: !!vehicleId,
  });
}

// Update vehicle delivery settings (for owners)
export function useUpdateVehicleDeliverySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      settings,
    }: {
      vehicleId: string;
      settings: Partial<VehicleDeliverySettings>;
    }) => {
      const { data, error } = await supabase
        .from("p2p_vehicles")
        .update(settings)
        .eq("id", vehicleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleDeliverySettings", variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["p2pVehicle", variables.vehicleId] });
      toast.success("Delivery settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update delivery settings");
    },
  });
}

// Calculate delivery fees
export function calculateDeliveryFees(
  settings: VehicleDeliverySettings,
  distanceMiles: number,
  option: "delivery" | "pickup" | "both"
): DeliveryFeeCalculation {
  const isWithinRange = distanceMiles <= settings.max_delivery_distance_miles;

  let deliveryFee = 0;
  let pickupFee = 0;

  if (option === "delivery" || option === "both") {
    if (settings.delivery_enabled) {
      if (settings.delivery_fee_type === "flat") {
        deliveryFee = settings.delivery_base_fee;
      } else {
        deliveryFee = settings.delivery_base_fee + (distanceMiles * settings.delivery_per_mile_fee);
      }
    }
  }

  if (option === "pickup" || option === "both") {
    if (settings.pickup_enabled) {
      if (settings.pickup_fee_type === "flat") {
        pickupFee = settings.pickup_base_fee;
      } else {
        pickupFee = settings.pickup_base_fee + (distanceMiles * settings.pickup_per_mile_fee);
      }
    }
  }

  return {
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    pickupFee: Math.round(pickupFee * 100) / 100,
    totalDeliveryFee: Math.round((deliveryFee + pickupFee) * 100) / 100,
    deliveryDistance: distanceMiles,
    isWithinRange,
  };
}

// Fetch delivery tasks for a booking
export function useDeliveryTasks(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["deliveryTasks", bookingId],
    queryFn: async (): Promise<DeliveryTask[]> => {
      if (!bookingId) return [];

      const { data, error } = await supabase
        .from("vehicle_delivery_tasks")
        .select("*")
        .eq("booking_id", bookingId)
        .order("scheduled_at");

      if (error) throw error;
      return (data || []) as DeliveryTask[];
    },
    enabled: !!bookingId,
  });
}

// Create delivery task
export function useCreateDeliveryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<DeliveryTask, "id" | "created_at" | "vehicle_photos" | "handoff_verified">) => {
      const { data, error } = await supabase
        .from("vehicle_delivery_tasks")
        .insert({
          ...task,
          vehicle_photos: [],
          handoff_verified: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deliveryTasks", variables.booking_id] });
      toast.success(`${variables.task_type === "delivery" ? "Delivery" : "Pickup"} task created`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create delivery task");
    },
  });
}

// Update delivery task status (for drivers)
export function useUpdateDeliveryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<DeliveryTask>;
    }) => {
      const { data, error } = await supabase
        .from("vehicle_delivery_tasks")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveryTasks"] });
      toast.success("Task updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
}

// Fetch pending delivery tasks (for driver app)
export function usePendingDeliveryTasks() {
  return useQuery({
    queryKey: ["pendingDeliveryTasks"],
    queryFn: async (): Promise<DeliveryTask[]> => {
      const { data, error } = await supabase
        .from("vehicle_delivery_tasks")
        .select("*")
        .in("status", ["pending", "assigned"])
        .order("scheduled_at");

      if (error) throw error;
      return (data || []) as DeliveryTask[];
    },
  });
}

// Driver accepts a delivery task
export function useAcceptDeliveryTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, driverId }: { taskId: string; driverId: string }) => {
      const { data, error } = await supabase
        .from("vehicle_delivery_tasks")
        .update({
          driver_id: driverId,
          status: "accepted",
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveryTasks"] });
      queryClient.invalidateQueries({ queryKey: ["pendingDeliveryTasks"] });
      toast.success("Task accepted!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to accept task");
    },
  });
}

// Complete handoff with verification
export function useCompleteHandoff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      photos,
      conditionNotes,
      signatureUrl,
    }: {
      taskId: string;
      photos: string[];
      conditionNotes?: string;
      signatureUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from("vehicle_delivery_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          vehicle_photos: photos,
          condition_notes: conditionNotes,
          handoff_signature_url: signatureUrl,
          handoff_verified: true,
          handoff_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveryTasks"] });
      toast.success("Handoff completed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete handoff");
    },
  });
}
