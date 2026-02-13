/**
 * useUnifiedTimeline Hook
 * Normalizes trip and food order data into a unified timeline structure
 * with real-time Supabase subscriptions and ETA computation.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceType = "ride" | "eats";
export type ViewerRole = "customer" | "driver" | "restaurant";
export type StepState = "completed" | "current" | "pending" | "delayed";

export interface TimelineStep {
  key: string;
  label: string;
  state: StepState;
  timestamp: string | null;
  etaMinutes: number | null;
}

export interface UnifiedTimelineData {
  steps: TimelineStep[];
  currentStepIndex: number;
  isDelayed: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  loading: boolean;
}

// Step definitions per service type
const RIDE_STEPS = [
  "requested",
  "accepted",
  "en_route",
  "arrived",
  "in_progress",
  "completed",
] as const;

const EATS_STEPS = [
  "placed",
  "confirmed",
  "preparing",
  "picked_up",
  "out_for_delivery",
  "delivered",
] as const;

// Role-aware labels
const RIDE_LABELS: Record<string, Record<ViewerRole, string>> = {
  requested: { customer: "Finding driver", driver: "New request", restaurant: "Ride requested" },
  accepted: { customer: "Driver assigned", driver: "Trip accepted", restaurant: "Driver assigned" },
  en_route: { customer: "Driver en route", driver: "Heading to pickup", restaurant: "Driver en route" },
  arrived: { customer: "Driver is here", driver: "You've arrived", restaurant: "Driver arrived" },
  in_progress: { customer: "Trip in progress", driver: "Trip in progress", restaurant: "Trip in progress" },
  completed: { customer: "Trip completed", driver: "Trip completed", restaurant: "Trip completed" },
};

const EATS_LABELS: Record<string, Record<ViewerRole, string>> = {
  placed: { customer: "Order placed", driver: "Order placed", restaurant: "New order" },
  confirmed: { customer: "Order confirmed", driver: "Order confirmed", restaurant: "Order confirmed" },
  preparing: { customer: "Being prepared", driver: "Kitchen cooking", restaurant: "Preparing" },
  picked_up: { customer: "Picked up", driver: "Picked up", restaurant: "Picked up" },
  out_for_delivery: { customer: "On the way", driver: "Delivering", restaurant: "Out for delivery" },
  delivered: { customer: "Delivered", driver: "Delivered", restaurant: "Delivered" },
};

// Map DB statuses to normalized step keys
function normalizeRideStatus(dbStatus: string): string {
  return dbStatus;
}

function normalizeEatsStatus(dbStatus: string): string {
  const map: Record<string, string> = {
    placed: "placed",
    pending: "placed",
    confirmed: "confirmed",
    accepted: "confirmed",
    preparing: "preparing",
    ready: "picked_up",
    ready_for_pickup: "picked_up",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
  };
  return map[dbStatus] || dbStatus;
}

interface UseUnifiedTimelineOptions {
  serviceType: ServiceType;
  viewerRole: ViewerRole;
  tripId?: string;
  orderId?: string;
  // Allow passing pre-loaded data to avoid extra queries
  currentStatus?: string;
  timestamps?: Record<string, string | null | undefined>;
  etaPickup?: string | null;
  etaDropoff?: string | null;
}

export function useUnifiedTimeline({
  serviceType,
  viewerRole,
  tripId,
  orderId,
  currentStatus: externalStatus,
  timestamps: externalTimestamps,
  etaPickup,
  etaDropoff,
}: UseUnifiedTimelineOptions): UnifiedTimelineData {
  const queryClient = useQueryClient();
  const [dbData, setDbData] = useState<{
    status: string;
    timestamps: Record<string, string | null>;
    eta_pickup?: string | null;
    eta_dropoff?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(!externalStatus);
  const prevStepRef = useRef<number>(-1);

  // Use external data if provided, otherwise use fetched data
  const status = externalStatus || dbData?.status || "";
  const timestamps = externalTimestamps || dbData?.timestamps || {};
  const etaPick = etaPickup ?? dbData?.eta_pickup;
  const etaDrop = etaDropoff ?? dbData?.eta_dropoff;

  // Fetch data from DB if no external data provided
  useEffect(() => {
    if (externalStatus) return; // Skip if data is passed in

    const fetchData = async () => {
      setLoading(true);
      try {
        if (serviceType === "ride" && tripId) {
          const { data } = await supabase
            .from("trips")
            .select("status, created_at, accepted_at, started_at, completed_at, cancelled_at")
            .eq("id", tripId)
            .maybeSingle();

          if (data) {
            setDbData({
              status: data.status || "",
              timestamps: {
                requested: data.created_at,
                accepted: data.accepted_at,
                in_progress: data.started_at,
                completed: data.completed_at,
              },
            });
          }
        } else if (serviceType === "eats" && orderId) {
          const { data } = await supabase
            .from("food_orders")
            .select("status, created_at, placed_at, accepted_at, prepared_at, ready_at, picked_up_at, delivered_at, eta_pickup, eta_dropoff")
            .eq("id", orderId)
            .maybeSingle();

          if (data) {
            setDbData({
              status: data.status || "",
              timestamps: {
                placed: data.placed_at || data.created_at,
                confirmed: data.accepted_at,
                preparing: data.prepared_at,
                picked_up: data.picked_up_at || data.ready_at,
                out_for_delivery: data.picked_up_at,
                delivered: data.delivered_at,
              },
              eta_pickup: data.eta_pickup,
              eta_dropoff: data.eta_dropoff,
            });
          }
        }
      } catch (err) {
        console.error("useUnifiedTimeline fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceType, tripId, orderId, externalStatus]);

  // Real-time subscription
  useEffect(() => {
    const entityId = serviceType === "ride" ? tripId : orderId;
    const table = serviceType === "ride" ? "trips" : "food_orders";
    if (!entityId) return;

    const channel = supabase
      .channel(`unified-timeline-${entityId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table,
          filter: `id=eq.${entityId}`,
        },
        () => {
          // Invalidate relevant queries to trigger re-render with fresh data
          if (serviceType === "ride") {
            queryClient.invalidateQueries({ queryKey: ["active-rider-trip"] });
            queryClient.invalidateQueries({ queryKey: ["trips"] });
          } else {
            queryClient.invalidateQueries({ queryKey: ["live-eats-order", orderId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceType, tripId, orderId, queryClient]);

  // Build normalized timeline
  return useMemo(() => {
    const stepKeys = serviceType === "ride" ? RIDE_STEPS : EATS_STEPS;
    const labels = serviceType === "ride" ? RIDE_LABELS : EATS_LABELS;
    const normalizedStatus = serviceType === "ride"
      ? normalizeRideStatus(status)
      : normalizeEatsStatus(status);

    const isCancelled = status === "cancelled";
    const currentIdx = (stepKeys as readonly string[]).indexOf(normalizedStatus);

    // Compute ETA minutes for current step
    const computeEta = (stepKey: string): number | null => {
      if (stepKey !== normalizedStatus) return null;
      const etaStr = serviceType === "ride"
        ? (["en_route", "arrived"].includes(stepKey) ? etaPick : etaDrop)
        : (["out_for_delivery"].includes(stepKey) ? etaDrop : etaPick);

      if (!etaStr) return null;
      const diff = (new Date(etaStr).getTime() - Date.now()) / 60000;
      return diff > 0 ? Math.round(diff) : null;
    };

    const steps: TimelineStep[] = stepKeys.map((key, idx) => {
      let state: StepState = "pending";
      if (isCancelled) {
        state = idx <= currentIdx ? "completed" : "pending";
      } else if (idx < currentIdx) {
        state = "completed";
      } else if (idx === currentIdx) {
        state = "current";
      }

      return {
        key,
        label: labels[key]?.[viewerRole] || key,
        state,
        timestamp: (timestamps as any)?.[key] || null,
        etaMinutes: computeEta(key),
      };
    });

    // Detect delay: if ETA for current step is negative or status hasn't changed in a long time
    const isDelayed = steps.some(s => s.state === "current" && s.etaMinutes !== null && s.etaMinutes <= 0);

    if (isDelayed) {
      const currentStep = steps.find(s => s.state === "current");
      if (currentStep) currentStep.state = "delayed";
    }

    return {
      steps,
      currentStepIndex: Math.max(0, currentIdx),
      isDelayed,
      isCompleted: normalizedStatus === (serviceType === "ride" ? "completed" : "delivered"),
      isCancelled,
      loading,
    };
  }, [serviceType, viewerRole, status, timestamps, etaPick, etaDrop, loading]);
}
