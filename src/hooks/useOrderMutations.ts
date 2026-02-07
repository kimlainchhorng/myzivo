/**
 * useOrderMutations Hook
 * Mutations for managing order assignments and status changes
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Assign driver to order
export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      driverId,
    }: {
      orderId: string;
      driverId: string;
    }) => {
      const { error } = await supabase
        .from("food_orders")
        .update({
          driver_id: driverId,
          status: "confirmed",
          assigned_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      toast.success("Driver assigned successfully");
    },
    onError: (error) => {
      toast.error("Failed to assign driver: " + error.message);
    },
  });
};

// Unassign driver from order
export const useUnassignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("food_orders")
        .update({
          driver_id: null,
          status: "pending",
          assigned_at: null,
        })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      toast.success("Driver unassigned");
    },
    onError: (error) => {
      toast.error("Failed to unassign driver: " + error.message);
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      insertEarnings,
    }: {
      orderId: string;
      status: string;
      insertEarnings?: boolean;
    }) => {
      const updates: any = { status };

      // Set timestamp based on status
      if (status === "in_progress") {
        updates.picked_up_at = new Date().toISOString();
      } else if (status === "completed") {
        updates.delivered_at = new Date().toISOString();
      } else if (status === "cancelled") {
        updates.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("food_orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      // If completing order, insert earnings (idempotent)
      if (status === "completed" && insertEarnings) {
        // Get order details
        const { data: order } = await supabase
          .from("food_orders")
          .select("driver_id, driver_payout_cents")
          .eq("id", orderId)
          .single();

        if (order?.driver_id) {
          // Check if earnings already exist
          const { data: existing } = await supabase
            .from("driver_earnings")
            .select("id")
            .eq("trip_id", orderId)
            .maybeSingle();

          if (!existing) {
            await supabase.from("driver_earnings").insert({
              driver_id: order.driver_id,
              trip_id: orderId,
              base_amount: (order.driver_payout_cents || 0) / 100,
              tip_amount: 0,
              net_amount: (order.driver_payout_cents || 0) / 100,
              earning_type: "delivery",
            });
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });
};

// Toggle driver online/offline status
export const useToggleDriverOnline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      driverId,
      isOnline,
    }: {
      driverId: string;
      isOnline: boolean;
    }) => {
      const { error } = await supabase
        .from("drivers")
        .update({ is_online: isOnline, updated_at: new Date().toISOString() })
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      toast.success(
        variables.isOnline ? "Driver set to online" : "Driver set to offline"
      );
    },
    onError: (error) => {
      toast.error("Failed to update driver status: " + error.message);
    },
  });
};
