/**
 * useScheduledDriverForecast Hook
 * 
 * Looks ahead at driver schedules to predict upcoming supply levels.
 * Used to improve ETA accuracy and show positive messaging during peak periods.
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAvailableDriversCount } from "./useAvailableDrivers";

interface DriverSchedule {
  driver_id: string;
  start_time: string;
  end_time: string;
}

export interface ScheduledDriverForecast {
  // Current state
  currentOnlineCount: number;
  
  // Upcoming schedule counts
  driversScheduledNow: number;
  driversScheduledNext15Min: number;
  driversScheduledNext30Min: number;
  
  // Peak detection
  isPeakPeriod: boolean;
  isPeakApproaching: boolean;
  peakStartsIn: number | null;
  peakMessage: string | null;
  
  // ETA adjustment multiplier (0.85-1.0)
  scheduleForecastMultiplier: number;
  
  isLoading: boolean;
}

/**
 * Add minutes to a time string (HH:MM format)
 */
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

/**
 * Check if a time is within a schedule window
 */
function isTimeInWindow(
  currentTime: string,
  startTime: string,
  endTime: string
): boolean {
  // Handle overnight schedules
  if (endTime < startTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Check if schedule will be active within next N minutes
 */
function willBeActiveIn(
  currentTime: string,
  futureTime: string,
  startTime: string,
  endTime: string
): boolean {
  // Check if already active
  if (isTimeInWindow(currentTime, startTime, endTime)) {
    return true;
  }
  // Check if will be active by future time
  if (startTime <= futureTime && startTime > currentTime) {
    return true;
  }
  return false;
}

/**
 * Get minutes until a schedule starts (null if already started or passed)
 */
function getMinutesUntilStart(currentTime: string, startTime: string): number | null {
  const [currentH, currentM] = currentTime.split(":").map(Number);
  const [startH, startM] = startTime.split(":").map(Number);
  
  const currentMins = currentH * 60 + currentM;
  const startMins = startH * 60 + startM;
  
  if (startMins <= currentMins) return null;
  return startMins - currentMins;
}

/**
 * Calculate forecast multiplier based on scheduled driver count
 */
function getMultiplier(scheduledCount: number): number {
  if (scheduledCount >= 8) return 0.85;
  if (scheduledCount >= 6) return 0.90;
  if (scheduledCount >= 4) return 0.95;
  return 1.0;
}

export function useScheduledDriverForecast(): ScheduledDriverForecast {
  const { count: currentOnlineCount, isLoading: driversLoading } = useAvailableDriversCount();
  
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["driver-schedules-forecast", dayOfWeek],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_schedules")
        .select("driver_id, start_time, end_time")
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true);
      
      if (error) throw error;
      return (data || []) as DriverSchedule[];
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });

  const forecast = useMemo<ScheduledDriverForecast>(() => {
    const safeSchedules = schedules || [];
    
    const time15 = addMinutesToTime(currentTime, 15);
    const time30 = addMinutesToTime(currentTime, 30);
    
    // Count unique drivers scheduled in each window
    const driversNow = new Set<string>();
    const drivers15 = new Set<string>();
    const drivers30 = new Set<string>();
    
    for (const schedule of safeSchedules) {
      if (isTimeInWindow(currentTime, schedule.start_time, schedule.end_time)) {
        driversNow.add(schedule.driver_id);
      }
      if (willBeActiveIn(currentTime, time15, schedule.start_time, schedule.end_time)) {
        drivers15.add(schedule.driver_id);
      }
      if (willBeActiveIn(currentTime, time30, schedule.start_time, schedule.end_time)) {
        drivers30.add(schedule.driver_id);
      }
    }
    
    const scheduledNow = driversNow.size;
    const scheduled15 = drivers15.size;
    const scheduled30 = drivers30.size;
    
    // Peak detection logic
    const isPeakPeriod = scheduledNow >= 6;
    const isPeakApproaching = !isPeakPeriod && scheduled30 >= 6;
    const significantIncrease = scheduled30 - currentOnlineCount >= 3;
    
    // Calculate when peak starts (if approaching)
    let peakStartsIn: number | null = null;
    if (isPeakApproaching) {
      // Find earliest schedule that pushes us to 6+
      const upcomingStarts = safeSchedules
        .filter(s => s.start_time > currentTime && s.start_time <= time30)
        .map(s => getMinutesUntilStart(currentTime, s.start_time))
        .filter((m): m is number => m !== null)
        .sort((a, b) => a - b);
      
      if (upcomingStarts.length > 0) {
        peakStartsIn = upcomingStarts[0];
      }
    }
    
    // Determine message
    let peakMessage: string | null = null;
    if (isPeakPeriod) {
      peakMessage = "More drivers scheduled in your area for faster delivery.";
    } else if (isPeakApproaching && peakStartsIn !== null) {
      peakMessage = `More drivers coming online soon — expect faster delivery in ~${peakStartsIn} min.`;
    } else if (significantIncrease) {
      peakMessage = "More drivers coming online soon — expect faster delivery.";
    }
    
    // Calculate multiplier
    // Use current scheduled if peak, otherwise slight optimism if approaching
    let multiplier = 1.0;
    if (isPeakPeriod) {
      multiplier = getMultiplier(scheduledNow);
    } else if (isPeakApproaching || significantIncrease) {
      multiplier = 0.95; // Slight optimism
    }
    
    return {
      currentOnlineCount,
      driversScheduledNow: scheduledNow,
      driversScheduledNext15Min: scheduled15,
      driversScheduledNext30Min: scheduled30,
      isPeakPeriod,
      isPeakApproaching,
      peakStartsIn,
      peakMessage,
      scheduleForecastMultiplier: multiplier,
      isLoading: driversLoading || schedulesLoading,
    };
  }, [schedules, currentTime, currentOnlineCount, driversLoading, schedulesLoading]);

  return forecast;
}
