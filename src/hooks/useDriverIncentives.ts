/**
 * useDriverIncentives Hook
 * 
 * Checks if current time falls within an active driver incentive period.
 * Used to adjust ETA predictions and show positive messaging to customers.
 */

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface ActiveIncentive {
  id: string;
  name: string;
  bonusAmount: number;
}

export interface DriverIncentivesInfo {
  isIncentivePeriod: boolean;
  activeIncentives: ActiveIncentive[];
  isLoading: boolean;
}

/**
 * Hook to check if we're in an active driver incentive period
 */
export function useDriverIncentives(): DriverIncentivesInfo {
  const [incentives, setIncentives] = useState<ActiveIncentive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchIncentives = async () => {
      try {
        const { data, error } = await supabase
          .from("driver_incentives")
          .select("id, name, bonus_amount, start_time, end_time")
          .not("start_time", "is", null)
          .not("end_time", "is", null);

        if (error) throw error;
        if (!mounted) return;

        // Filter client-side for current time window
        const currentTime = format(new Date(), "HH:mm");
        const active = (data || []).filter((incentive) => {
          const startTime = incentive.start_time;
          const endTime = incentive.end_time;
          if (!startTime || !endTime) return false;
          return currentTime >= startTime && currentTime <= endTime;
        });

        setIncentives(
          active.map((i) => ({
            id: i.id,
            name: i.name || "Bonus Period",
            bonusAmount: i.bonus_amount || 0,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch driver incentives:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchIncentives();

    // Re-check every 5 minutes
    const interval = setInterval(fetchIncentives, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const result = useMemo(
    () => ({
      isIncentivePeriod: incentives.length > 0,
      activeIncentives: incentives,
      isLoading,
    }),
    [incentives, isLoading]
  );

  return result;
}
