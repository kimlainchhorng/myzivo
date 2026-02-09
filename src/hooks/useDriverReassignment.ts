/**
 * useDriverReassignment Hook
 * Tracks driver changes and detects reassignment scenarios
 * Provides state for showing reassignment-specific UI messaging
 */
import { useState, useEffect, useRef } from "react";

export interface DriverReassignmentState {
  // Reassignment detection
  wasReassigned: boolean;
  isSearchingForNewDriver: boolean;
  previousDriverId: string | null;
  
  // Timestamps
  reassignedAt: Date | null;
  
  // For display
  showReassignmentBanner: boolean;
  reassignmentMessage: string;
  reassignmentSubMessage: string;
}

interface UseDriverReassignmentOptions {
  currentDriverId: string | null | undefined;
  previousDriverId?: string | null;
  orderStatus: string;
}

// Statuses where reassignment is relevant
const ACTIVE_STATUSES = ["confirmed", "preparing", "ready", "ready_for_pickup", "out_for_delivery"];

export function useDriverReassignment({
  currentDriverId,
  previousDriverId,
  orderStatus,
}: UseDriverReassignmentOptions): DriverReassignmentState {
  const [wasReassigned, setWasReassigned] = useState(false);
  const [isSearchingForNewDriver, setIsSearchingForNewDriver] = useState(false);
  const [trackedPreviousDriverId, setTrackedPreviousDriverId] = useState<string | null>(null);
  const [reassignedAt, setReassignedAt] = useState<Date | null>(null);
  
  // Track previous driver ID across renders
  const prevDriverRef = useRef(currentDriverId);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize from database previous_driver_id on mount
  useEffect(() => {
    if (previousDriverId && !trackedPreviousDriverId) {
      setTrackedPreviousDriverId(previousDriverId);
      // If we have a previous driver but no current driver, we're reassigning
      if (!currentDriverId && ACTIVE_STATUSES.includes(orderStatus)) {
        setIsSearchingForNewDriver(true);
        setWasReassigned(true);
        setReassignedAt(new Date());
      }
      // If we have both previous and current, reassignment completed
      else if (currentDriverId && previousDriverId !== currentDriverId) {
        setWasReassigned(true);
        setReassignedAt(new Date());
      }
    }
  }, [previousDriverId, currentDriverId, orderStatus, trackedPreviousDriverId]);
  
  // Detect real-time driver changes
  useEffect(() => {
    const prevDriver = prevDriverRef.current;
    
    // Had a driver, now none (driver cancelled/unassigned)
    if (prevDriver && !currentDriverId && ACTIVE_STATUSES.includes(orderStatus)) {
      setIsSearchingForNewDriver(true);
      setWasReassigned(true);
      setTrackedPreviousDriverId(prevDriver);
      setReassignedAt(new Date());
      
      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    }
    
    // New driver assigned after searching
    if (isSearchingForNewDriver && currentDriverId) {
      setIsSearchingForNewDriver(false);
      
      // Clear wasReassigned after 15 seconds to reset state
      clearTimeoutRef.current = setTimeout(() => {
        setWasReassigned(false);
        setTrackedPreviousDriverId(null);
        setReassignedAt(null);
      }, 15000);
    }
    
    // Update ref
    prevDriverRef.current = currentDriverId;
    
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, [currentDriverId, orderStatus, isSearchingForNewDriver]);
  
  // Compute derived state
  const isActiveOrder = ACTIVE_STATUSES.includes(orderStatus);
  const showReassignmentBanner = isActiveOrder && (isSearchingForNewDriver || (wasReassigned && !!currentDriverId));
  
  let reassignmentMessage = "";
  let reassignmentSubMessage = "";
  
  if (isSearchingForNewDriver) {
    reassignmentMessage = "Finding another driver near you...";
    reassignmentSubMessage = "Your previous driver had to cancel";
  } else if (wasReassigned && currentDriverId) {
    reassignmentMessage = "New driver assigned!";
    reassignmentSubMessage = "Your order is back on track";
  }
  
  return {
    wasReassigned,
    isSearchingForNewDriver,
    previousDriverId: trackedPreviousDriverId,
    reassignedAt,
    showReassignmentBanner,
    reassignmentMessage,
    reassignmentSubMessage,
  };
}
