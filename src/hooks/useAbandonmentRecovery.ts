/**
 * Abandonment Recovery Hook
 * Tracks checkout abandonment and triggers recovery flows
 */

import { useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEventTracking } from "./useEventTracking";
import { ServiceType, SavedSearchParams } from "@/types/personalization";

interface CheckoutState {
  serviceType: ServiceType;
  searchParams: SavedSearchParams;
  cartValue: number;
  step: number;
  stepName: string;
  startedAt: number;
  lastActivityAt: number;
}

// Map service types to analytics-compatible types
const SERVICE_TYPE_MAP: Record<ServiceType, "hotel" | "activity" | "flight" | "transfer"> = {
  hotels: "hotel",
  flights: "flight",
  activities: "activity",
  transfers: "transfer",
  cars: "hotel",
};

const ABANDONMENT_THRESHOLD_MS = 5 * 60 * 1000;
const CHECKOUT_STEPS = ["search", "details", "traveler_info", "payment", "confirmation"];

export function useAbandonmentRecovery() {
  const { user } = useAuth();
  const { track, sessionId } = useEventTracking();
  const checkoutState = useRef<CheckoutState | null>(null);
  const abandonmentTimer = useRef<NodeJS.Timeout | null>(null);

  const resetAbandonmentTimer = useCallback(() => {
    if (abandonmentTimer.current) {
      clearTimeout(abandonmentTimer.current);
    }
    abandonmentTimer.current = setTimeout(() => {
      handleAbandonmentDetected();
    }, ABANDONMENT_THRESHOLD_MS);
  }, []);

  const handleAbandonmentDetected = useCallback(async () => {
    const state = checkoutState.current;
    if (!state) return;
    if (state.stepName === "confirmation") return;

    const timeSpentSeconds = Math.floor((Date.now() - state.startedAt) / 1000);

    track("error", {
      error_type: "checkout_abandoned",
      product_type: SERVICE_TYPE_MAP[state.serviceType],
      checkout_step: state.step,
      step_name: state.stepName,
      cart_value: state.cartValue,
      time_spent_seconds: timeSpentSeconds,
    });

    checkoutState.current = null;
  }, [track]);

  const startCheckout = useCallback((
    serviceType: ServiceType,
    searchParams: SavedSearchParams,
    cartValue: number
  ) => {
    checkoutState.current = {
      serviceType,
      searchParams,
      cartValue,
      step: 0,
      stepName: "search",
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    };

    track("checkout_started", {
      product_type: SERVICE_TYPE_MAP[serviceType],
      cart_value: cartValue,
    });

    resetAbandonmentTimer();
  }, [track, resetAbandonmentTimer]);

  const updateStep = useCallback((step: number, stepName: string, cartValue?: number) => {
    if (!checkoutState.current) return;

    checkoutState.current.step = step;
    checkoutState.current.stepName = stepName;
    checkoutState.current.lastActivityAt = Date.now();
    
    if (cartValue !== undefined) {
      checkoutState.current.cartValue = cartValue;
    }

    track("button_click", {
      action: "checkout_step",
      step,
      step_name: stepName,
    });

    resetAbandonmentTimer();
  }, [track, resetAbandonmentTimer]);

  const recordActivity = useCallback(() => {
    if (checkoutState.current) {
      checkoutState.current.lastActivityAt = Date.now();
      resetAbandonmentTimer();
    }
  }, [resetAbandonmentTimer]);

  const completeCheckout = useCallback((orderId: string) => {
    if (abandonmentTimer.current) {
      clearTimeout(abandonmentTimer.current);
    }

    const state = checkoutState.current;
    if (state) {
      track("booking_confirmed", {
        product_type: SERVICE_TYPE_MAP[state.serviceType],
      }, { orderId, value: state.cartValue });
    }

    checkoutState.current = null;
  }, [track]);

  const cancelCheckout = useCallback(() => {
    handleAbandonmentDetected();
    if (abandonmentTimer.current) {
      clearTimeout(abandonmentTimer.current);
    }
    checkoutState.current = null;
  }, [handleAbandonmentDetected]);

  useEffect(() => {
    return () => {
      if (abandonmentTimer.current) {
        clearTimeout(abandonmentTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        recordActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [recordActivity]);

  return {
    startCheckout,
    updateStep,
    recordActivity,
    completeCheckout,
    cancelCheckout,
    currentStep: checkoutState.current?.step ?? -1,
    isInCheckout: !!checkoutState.current,
    CHECKOUT_STEPS,
  };
}
