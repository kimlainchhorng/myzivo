/**
 * Eats Order Mutations with Validation
 * Enforces status transition rules and logs events
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  EatsOrderStatus,
  ActorRole,
  ActorRoleType,
  isOrderLocked,
  isValidTransition,
  getStatusTimestampField,
  getStatusLabel,
} from "@/lib/orderStatus";
import { EATS_TABLES } from "@/lib/eatsTables";

// ============================================
// TYPES
// ============================================

interface UpdateStatusParams {
  orderId: string;
  newStatus: string;
  actorRole: ActorRoleType;
  actorId?: string;
}

interface AssignDriverParams {
  orderId: string;
  driverId: string;
  actorRole?: ActorRoleType;
  actorId?: string;
}

interface CancelOrderParams {
  orderId: string;
  reason?: string;
  actorRole: ActorRoleType;
  actorId?: string;
}

// ============================================
// VALIDATED ORDER STATUS UPDATE
// ============================================

/**
 * Update order status with validation and event logging
 * Enforces transition rules based on actor role
 */
export function useUpdateEatsOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus, actorRole, actorId }: UpdateStatusParams) => {
      // 1. Fetch current order status
      const { data: order, error: fetchError } = await supabase
        .from(EATS_TABLES.orders)
        .select("status, customer_id")
        .eq("id", orderId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      const currentStatus = order.status;

      // 2. Check if order is locked
      if (isOrderLocked(currentStatus)) {
        throw new Error(`Cannot modify ${getStatusLabel(currentStatus)} orders`);
      }

      // 3. Validate transition based on role
      if (!isValidTransition(currentStatus, newStatus, actorRole)) {
        throw new Error(
          `Invalid status transition: ${getStatusLabel(currentStatus)} → ${getStatusLabel(newStatus)}`
        );
      }

      // 4. Build update with correct timestamp
      const timestampField = getStatusTimestampField(newStatus);
      const updates: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set the appropriate timestamp
      if (timestampField !== "updated_at") {
        updates[timestampField] = new Date().toISOString();
      }

      // 5. Update order
      const { error: updateError } = await supabase
        .from(EATS_TABLES.orders)
        .update(updates)
        .eq("id", orderId);

      if (updateError) throw updateError;

      // 6. Log event to order_events (backup - trigger also logs)
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: `status_${newStatus}`,
        actor_id: actorId || null,
        actor_role: actorRole,
        data: {
          previous_status: currentStatus,
          new_status: newStatus,
          source: "app",
        },
      });

      return { orderId, previousStatus: currentStatus, newStatus };
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["eats-order", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });

      toast.success("Order Updated", {
        description: `Status changed to ${getStatusLabel(data.newStatus)}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Update Failed", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: () => {
            // Retry handled by component
          },
        },
      });
    },
  });
}

// ============================================
// ASSIGN DRIVER TO ORDER
// ============================================

/**
 * Assign a driver to an order with validation
 */
export function useAssignEatsDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, driverId, actorRole = ActorRole.ADMIN, actorId }: AssignDriverParams) => {
      // 1. Fetch current order
      const { data: order, error: fetchError } = await supabase
        .from(EATS_TABLES.orders)
        .select("status, driver_id")
        .eq("id", orderId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      // 2. Check if order is locked
      if (isOrderLocked(order.status)) {
        throw new Error(`Cannot assign driver to ${getStatusLabel(order.status)} orders`);
      }

      // 3. Check if already assigned to same driver
      if (order.driver_id === driverId) {
        throw new Error("Driver is already assigned to this order");
      }

      // 4. Update order with driver
      const { error: updateError } = await supabase
        .from(EATS_TABLES.orders)
        .update({
          driver_id: driverId,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // 5. Log event (backup - trigger also logs)
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: "driver_assigned",
        actor_id: actorId || null,
        actor_role: actorRole,
        data: {
          driver_id: driverId,
          previous_driver_id: order.driver_id || null,
          source: "app",
        },
      });

      return { orderId, driverId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });

      toast.success("Driver Assigned", {
        description: "Driver has been assigned to the order",
      });
    },
    onError: (error: Error) => {
      toast.error("Assignment Failed", {
        description: error.message,
      });
    },
  });
}

// ============================================
// UNASSIGN DRIVER FROM ORDER
// ============================================

/**
 * Remove driver from an order
 */
export function useUnassignEatsDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, actorRole = ActorRole.ADMIN, actorId }: Omit<AssignDriverParams, "driverId">) => {
      // 1. Fetch current order
      const { data: order, error: fetchError } = await supabase
        .from(EATS_TABLES.orders)
        .select("status, driver_id")
        .eq("id", orderId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      // 2. Check if order is locked
      if (isOrderLocked(order.status)) {
        throw new Error(`Cannot modify ${getStatusLabel(order.status)} orders`);
      }

      // 3. Check if there's a driver to unassign
      if (!order.driver_id) {
        throw new Error("No driver assigned to this order");
      }

      const previousDriverId = order.driver_id;

      // 4. Update order - remove driver and reset status if needed
      const updates: Record<string, unknown> = {
        driver_id: null,
        assigned_at: null,
        updated_at: new Date().toISOString(),
      };

      // If order was out for delivery, reset to ready
      if (order.status === EatsOrderStatus.OUT_FOR_DELIVERY) {
        updates.status = EatsOrderStatus.READY;
        updates.picked_up_at = null;
      }

      const { error: updateError } = await supabase
        .from(EATS_TABLES.orders)
        .update(updates)
        .eq("id", orderId);

      if (updateError) throw updateError;

      // 5. Log event
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: "driver_unassigned",
        actor_id: actorId || null,
        actor_role: actorRole,
        data: {
          previous_driver_id: previousDriverId,
          source: "app",
        },
      });

      return { orderId, previousDriverId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });

      toast.success("Driver Unassigned", {
        description: "Driver has been removed from the order",
      });
    },
    onError: (error: Error) => {
      toast.error("Unassign Failed", {
        description: error.message,
      });
    },
  });
}

// ============================================
// CANCEL ORDER
// ============================================

/**
 * Cancel an order with reason logging
 */
export function useCancelEatsOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason, actorRole, actorId }: CancelOrderParams) => {
      // 1. Fetch current order
      const { data: order, error: fetchError } = await supabase
        .from(EATS_TABLES.orders)
        .select("status")
        .eq("id", orderId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      // 2. Check if order is already locked
      if (isOrderLocked(order.status)) {
        throw new Error(`Cannot cancel ${getStatusLabel(order.status)} orders`);
      }

      const previousStatus = order.status;

      // 3. Update order to cancelled
      const { error: updateError } = await supabase
        .from(EATS_TABLES.orders)
        .update({
          status: EatsOrderStatus.CANCELLED,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // 4. Log cancellation event with reason
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: "status_cancelled",
        actor_id: actorId || null,
        actor_role: actorRole,
        data: {
          previous_status: previousStatus,
          new_status: EatsOrderStatus.CANCELLED,
          reason: reason || "No reason provided",
          source: "app",
        },
      });

      return { orderId, previousStatus, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });

      toast.warning("Order Cancelled", {
        description: "The order has been cancelled",
      });
    },
    onError: (error: Error) => {
      toast.error("Cancellation Failed", {
        description: error.message,
      });
    },
  });
}

// ============================================
// QUICK STATUS UPDATES FOR SPECIFIC ROLES
// ============================================

/**
 * Merchant confirms an order
 */
export function useMerchantConfirmOrder() {
  const updateStatus = useUpdateEatsOrderStatus();

  return useMutation({
    mutationFn: async ({ orderId, merchantId }: { orderId: string; merchantId: string }) => {
      return updateStatus.mutateAsync({
        orderId,
        newStatus: EatsOrderStatus.CONFIRMED,
        actorRole: ActorRole.MERCHANT,
        actorId: merchantId,
      });
    },
  });
}

/**
 * Merchant marks order as preparing
 */
export function useMerchantStartPreparing() {
  const updateStatus = useUpdateEatsOrderStatus();

  return useMutation({
    mutationFn: async ({ orderId, merchantId }: { orderId: string; merchantId: string }) => {
      return updateStatus.mutateAsync({
        orderId,
        newStatus: EatsOrderStatus.PREPARING,
        actorRole: ActorRole.MERCHANT,
        actorId: merchantId,
      });
    },
  });
}

/**
 * Merchant marks order as ready
 */
export function useMerchantMarkReady() {
  const updateStatus = useUpdateEatsOrderStatus();

  return useMutation({
    mutationFn: async ({ orderId, merchantId }: { orderId: string; merchantId: string }) => {
      return updateStatus.mutateAsync({
        orderId,
        newStatus: EatsOrderStatus.READY,
        actorRole: ActorRole.MERCHANT,
        actorId: merchantId,
      });
    },
  });
}

/**
 * Driver picks up order
 */
export function useDriverPickupOrder() {
  const updateStatus = useUpdateEatsOrderStatus();

  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      return updateStatus.mutateAsync({
        orderId,
        newStatus: EatsOrderStatus.OUT_FOR_DELIVERY,
        actorRole: ActorRole.DRIVER,
        actorId: driverId,
      });
    },
  });
}

/**
 * Driver delivers order
 */
export function useDriverDeliverOrder() {
  const updateStatus = useUpdateEatsOrderStatus();

  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      return updateStatus.mutateAsync({
        orderId,
        newStatus: EatsOrderStatus.DELIVERED,
        actorRole: ActorRole.DRIVER,
        actorId: driverId,
      });
    },
  });
}
