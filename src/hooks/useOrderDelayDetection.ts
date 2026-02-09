/**
 * useOrderDelayDetection Hook
 * Detects when an order is running late compared to its ETA
 * and provides recalculated ETA based on current driver position
 */
import { useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DelayLevel = "none" | "warning" | "delayed" | "critical";

interface DelayDetectionOptions {
  etaDropoff: string | null | undefined;
  createdAt: string | null | undefined;
  durationMinutes: number | null | undefined;
  orderStatus: string | undefined;
  driverLat?: number | null;
  driverLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  orderId?: string;
  restaurantName?: string;
}

interface DelayDetectionResult {
  isDelayed: boolean;
  delayLevel: DelayLevel;
  delayMinutes: number;
  originalEtaTime: Date | null;
  newEstimatedEtaMin: number | null;
  newEstimatedEtaMax: number | null;
  delayMessage: string | null;
  shouldNotify: boolean;
}

// Delay thresholds in minutes
const WARNING_THRESHOLD = 5;
const DELAYED_THRESHOLD = 10;
const CRITICAL_THRESHOLD = 20;

// Average speed in city traffic (miles per minute)
const AVG_SPEED_MILES_PER_MIN = 0.5;

// Haversine formula for distance calculation (miles)
function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.7613;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Status considered active for delay detection
const ACTIVE_STATUSES = ["placed", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery"];

export function useOrderDelayDetection({
  etaDropoff,
  createdAt,
  durationMinutes,
  orderStatus,
  driverLat,
  driverLng,
  deliveryLat,
  deliveryLng,
  orderId,
  restaurantName,
}: DelayDetectionOptions): DelayDetectionResult {
  const hasLoggedRef = useRef<Record<DelayLevel, boolean>>({
    none: true, // never log "none"
    warning: false,
    delayed: false,
    critical: false,
  });

  const result = useMemo(() => {
    // Skip detection for completed/cancelled orders
    if (!orderStatus || !ACTIVE_STATUSES.includes(orderStatus)) {
      return {
        isDelayed: false,
        delayLevel: "none" as DelayLevel,
        delayMinutes: 0,
        originalEtaTime: null,
        newEstimatedEtaMin: null,
        newEstimatedEtaMax: null,
        delayMessage: null,
        shouldNotify: false,
      };
    }

    // Determine original ETA time
    let originalEtaTime: Date | null = null;
    
    if (etaDropoff) {
      originalEtaTime = new Date(etaDropoff);
    } else if (createdAt && durationMinutes) {
      // Fallback: calculate from created_at + duration
      const created = new Date(createdAt);
      originalEtaTime = new Date(created.getTime() + durationMinutes * 60000);
    }

    if (!originalEtaTime) {
      return {
        isDelayed: false,
        delayLevel: "none" as DelayLevel,
        delayMinutes: 0,
        originalEtaTime: null,
        newEstimatedEtaMin: null,
        newEstimatedEtaMax: null,
        delayMessage: null,
        shouldNotify: false,
      };
    }

    const now = Date.now();
    const etaTime = originalEtaTime.getTime();
    const timePastEtaMs = now - etaTime;
    const timePastEtaMinutes = Math.floor(timePastEtaMs / 60000);

    // Determine delay level
    let delayLevel: DelayLevel = "none";
    let delayMessage: string | null = null;

    if (timePastEtaMinutes >= CRITICAL_THRESHOLD) {
      delayLevel = "critical";
      delayMessage = "We apologize — your order is significantly delayed.";
    } else if (timePastEtaMinutes >= DELAYED_THRESHOLD) {
      delayLevel = "delayed";
      delayMessage = "Your order is taking longer than expected.";
    } else if (timePastEtaMinutes >= WARNING_THRESHOLD) {
      delayLevel = "warning";
      delayMessage = "Your order is running slightly behind schedule.";
    }

    const isDelayed = delayLevel !== "none";

    // Recalculate ETA based on driver location if available
    let newEstimatedEtaMin: number | null = null;
    let newEstimatedEtaMax: number | null = null;

    if (isDelayed && driverLat != null && driverLng != null && deliveryLat != null && deliveryLng != null) {
      const distance = calculateDistanceMiles(driverLat, driverLng, deliveryLat, deliveryLng);
      const baseTravelTime = distance / AVG_SPEED_MILES_PER_MIN;
      
      // Apply buffer based on delay severity
      let buffer = 1.0;
      if (delayLevel === "warning") buffer = 1.1;
      if (delayLevel === "delayed") buffer = 1.15;
      if (delayLevel === "critical") buffer = 1.2;

      const adjustedEta = baseTravelTime * buffer;
      newEstimatedEtaMin = Math.max(1, Math.floor(adjustedEta * 0.85));
      newEstimatedEtaMax = Math.max(newEstimatedEtaMin + 2, Math.ceil(adjustedEta * 1.15));
      
      // Cap range spread
      if (newEstimatedEtaMax - newEstimatedEtaMin > 20) {
        newEstimatedEtaMax = newEstimatedEtaMin + 20;
      }
    } else if (isDelayed) {
      // Fallback: add delay time to remaining estimate
      const remainingFromOriginal = Math.max(0, Math.ceil((etaTime - now) / 60000));
      const baseEstimate = Math.max(10, remainingFromOriginal + timePastEtaMinutes);
      newEstimatedEtaMin = Math.max(1, Math.floor(baseEstimate * 0.9));
      newEstimatedEtaMax = Math.ceil(baseEstimate * 1.2);
    }

    // Only notify if this is a new delay level
    const shouldNotify = isDelayed;

    return {
      isDelayed,
      delayLevel,
      delayMinutes: Math.max(0, timePastEtaMinutes),
      originalEtaTime,
      newEstimatedEtaMin,
      newEstimatedEtaMax,
      delayMessage,
      shouldNotify,
    };
  }, [etaDropoff, createdAt, durationMinutes, orderStatus, driverLat, driverLng, deliveryLat, deliveryLng]);

  // Log delay events to order_events table
  useEffect(() => {
    if (!orderId || !result.isDelayed || !result.shouldNotify) return;
    
    const { delayLevel, delayMinutes, originalEtaTime } = result;
    
    // Check if we've already logged this delay level
    if (hasLoggedRef.current[delayLevel]) return;

    const eventType = delayLevel === "warning" 
      ? "order_delayed_warning"
      : delayLevel === "delayed"
      ? "order_delayed"
      : "order_delayed_critical";

    // Mark as logged to prevent duplicates
    hasLoggedRef.current[delayLevel] = true;

    // Log to order_events
    supabase
      .from("order_events")
      .insert({
        order_id: orderId,
        type: eventType,
        actor_role: "system",
        data: {
          delay_minutes: delayMinutes,
          delay_level: delayLevel,
          original_eta: originalEtaTime?.toISOString(),
          detected_at: new Date().toISOString(),
          restaurant_name: restaurantName,
        },
      })
      .then(({ error }) => {
        if (error) {
          console.error("[DelayDetection] Failed to log event:", error);
        }
      });
  }, [result.isDelayed, result.delayLevel, result.delayMinutes, result.originalEtaTime, orderId, restaurantName, result.shouldNotify]);

  return result;
}
