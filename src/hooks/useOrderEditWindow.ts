/**
 * useOrderEditWindow Hook
 * Calculates remaining edit time and determines if editing is allowed
 * Window closes when timer expires OR restaurant confirms order
 */
import { useState, useEffect, useMemo, useCallback } from "react";

export interface OrderEditWindowResult {
  // Window state
  isEditWindowOpen: boolean;
  canEdit: boolean;
  canCancel: boolean;
  
  // Timer
  remainingSeconds: number;
  remainingDisplay: string;  // "02:30" format
  
  // Closure reason
  closedReason: "expired" | "confirmed" | null;
  
  // Urgency level for UI styling
  urgency: "normal" | "warning" | "critical";
}

interface UseOrderEditWindowOptions {
  placedAt: string | null | undefined;
  status: string;
  acceptedAt?: string | null;
  graceMinutes?: number;  // Default 2.5 minutes
}

const DEFAULT_GRACE_MINUTES = 2.5; // 150 seconds

export function useOrderEditWindow({
  placedAt,
  status,
  acceptedAt,
  graceMinutes = DEFAULT_GRACE_MINUTES,
}: UseOrderEditWindowOptions): OrderEditWindowResult {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [closedReason, setClosedReason] = useState<"expired" | "confirmed" | null>(null);

  // Editable statuses (before restaurant confirms)
  const editableStatuses = useMemo(() => ["placed", "pending"], []);
  
  // Calculate if status allows editing
  const isStatusEditable = useMemo(() => {
    return editableStatuses.includes(status);
  }, [status, editableStatuses]);

  // Grace period in seconds
  const gracePeriodSeconds = useMemo(() => graceMinutes * 60, [graceMinutes]);

  // Calculate remaining time
  const calculateRemaining = useCallback(() => {
    if (!placedAt) return 0;
    
    const placedTime = new Date(placedAt).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - placedTime) / 1000);
    const remaining = gracePeriodSeconds - elapsedSeconds;
    
    return Math.max(0, remaining);
  }, [placedAt, gracePeriodSeconds]);

  // Update timer every second
  useEffect(() => {
    // If restaurant already confirmed, set closed reason
    if (!isStatusEditable && acceptedAt) {
      setClosedReason("confirmed");
      setRemainingSeconds(0);
      return;
    }

    // Initial calculation
    const remaining = calculateRemaining();
    setRemainingSeconds(remaining);

    if (remaining <= 0) {
      setClosedReason("expired");
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();
      setRemainingSeconds(newRemaining);
      
      if (newRemaining <= 0) {
        setClosedReason("expired");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [placedAt, isStatusEditable, acceptedAt, calculateRemaining]);

  // Format display time as MM:SS
  const remainingDisplay = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  // Determine urgency level for styling
  const urgency = useMemo((): "normal" | "warning" | "critical" => {
    if (remainingSeconds > 60) return "normal";
    if (remainingSeconds > 30) return "warning";
    return "critical";
  }, [remainingSeconds]);

  // Determine if window is open
  const isEditWindowOpen = useMemo(() => {
    return isStatusEditable && remainingSeconds > 0 && !closedReason;
  }, [isStatusEditable, remainingSeconds, closedReason]);

  return {
    isEditWindowOpen,
    canEdit: isEditWindowOpen,
    canCancel: isEditWindowOpen,
    remainingSeconds,
    remainingDisplay,
    closedReason,
    urgency,
  };
}
