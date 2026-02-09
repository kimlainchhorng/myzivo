/**
 * usePrepProgress Hook
 * Calculates real-time preparation progress and detects speed deviations
 * Enables dynamic ETA adjustment based on restaurant pace
 */
import { useState, useEffect, useMemo } from "react";

export type PrepStatus = "starting" | "preparing" | "almost_ready" | "ready";

export interface PrepProgressResult {
  // Progress tracking
  status: PrepStatus;
  progressPercent: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  
  // Speed deviation
  prepSpeedFactor: number;
  isRunningFast: boolean;
  isRunningSlow: boolean;
  speedMessage: string | null;
  
  // For ETA adjustment
  adjustedPrepMinutes: number;
}

interface UsePrepProgressOptions {
  acceptedAt?: string | null;
  learnedPrepMinutes?: number | null;
  isOrderReady?: boolean;
}

const SPEED_FAST_THRESHOLD = 0.8; // 20% faster
const SPEED_SLOW_THRESHOLD = 1.2; // 20% slower

export function usePrepProgress({
  acceptedAt,
  learnedPrepMinutes,
  isOrderReady = false,
}: UsePrepProgressOptions): PrepProgressResult {
  const [now, setNow] = useState(Date.now());

  // Update every 10 seconds for smooth progress
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    // If order is ready, return completed state
    if (isOrderReady) {
      return {
        status: "ready",
        progressPercent: 100,
        elapsedMinutes: 0,
        remainingMinutes: 0,
        prepSpeedFactor: 1.0,
        isRunningFast: false,
        isRunningSlow: false,
        speedMessage: null,
        adjustedPrepMinutes: 0,
      };
    }

    // Default values when no data
    if (!acceptedAt || !learnedPrepMinutes) {
      return {
        status: "preparing",
        progressPercent: 0,
        elapsedMinutes: 0,
        remainingMinutes: learnedPrepMinutes || 20,
        prepSpeedFactor: 1.0,
        isRunningFast: false,
        isRunningSlow: false,
        speedMessage: null,
        adjustedPrepMinutes: learnedPrepMinutes || 20,
      };
    }

    // Calculate elapsed time
    const acceptedTime = new Date(acceptedAt).getTime();
    const elapsedMs = now - acceptedTime;
    const elapsedMinutes = Math.max(0, elapsedMs / 60000);

    // Calculate progress percentage
    const rawProgress = (elapsedMinutes / learnedPrepMinutes) * 100;
    const progressPercent = Math.min(100, Math.max(0, rawProgress));

    // Determine prep status based on progress
    let status: PrepStatus;
    if (progressPercent < 30) {
      status = "starting";
    } else if (progressPercent < 75) {
      status = "preparing";
    } else if (progressPercent < 100) {
      status = "almost_ready";
    } else {
      status = "ready";
    }

    // Calculate speed factor
    // If we're at X% of time elapsed, we expect X% of prep to be done
    // Speed factor adjusts based on actual pace
    let prepSpeedFactor = 1.0;

    // After 50% of expected time, start tracking pace
    if (elapsedMinutes >= learnedPrepMinutes * 0.5) {
      // If elapsed > expected, restaurant is running slow
      if (elapsedMinutes >= learnedPrepMinutes) {
        // Running slow: adjust factor up
        prepSpeedFactor = Math.min(1.5, elapsedMinutes / learnedPrepMinutes);
      } else {
        // On track or slightly fast
        prepSpeedFactor = 1.0;
      }
    }

    // Detect significant deviations
    const isRunningFast = prepSpeedFactor < SPEED_FAST_THRESHOLD;
    const isRunningSlow = prepSpeedFactor > SPEED_SLOW_THRESHOLD;

    // Generate speed message
    let speedMessage: string | null = null;
    if (isRunningFast) {
      speedMessage = "Kitchen is ahead of schedule";
    } else if (isRunningSlow) {
      speedMessage = "Taking a bit longer than usual";
    }

    // Calculate remaining time
    const adjustedPrepMinutes = learnedPrepMinutes * prepSpeedFactor;
    const remainingMinutes = Math.max(0, adjustedPrepMinutes - elapsedMinutes);

    return {
      status,
      progressPercent: Math.round(progressPercent),
      elapsedMinutes: Math.round(elapsedMinutes * 10) / 10,
      remainingMinutes: Math.round(remainingMinutes * 10) / 10,
      prepSpeedFactor: Math.round(prepSpeedFactor * 100) / 100,
      isRunningFast,
      isRunningSlow,
      speedMessage,
      adjustedPrepMinutes: Math.round(adjustedPrepMinutes),
    };
  }, [acceptedAt, learnedPrepMinutes, isOrderReady, now]);
}
