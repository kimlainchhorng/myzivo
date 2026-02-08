import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DriverSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean | null;
}

interface DriverWithSchedule {
  id: string;
  full_name: string;
  current_lat: number | null;
  current_lng: number | null;
  driver_schedules: DriverSchedule[];
}

export interface AvailableDriver {
  id: string;
  full_name: string;
  current_lat: number;
  current_lng: number;
}

export function useAvailableDrivers(enableRealtime: boolean = true) {
  const queryClient = useQueryClient();

  // Subscribe to realtime driver updates for instant availability changes
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel("available-drivers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        (payload) => {
          // Immediately invalidate on online status or location changes
          const newData = payload.new as { is_online?: boolean; current_lat?: number; current_lng?: number };
          if (newData.is_online !== undefined || newData.current_lat !== undefined || newData.current_lng !== undefined) {
            queryClient.invalidateQueries({ queryKey: ["available-drivers"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, queryClient]);

  return useQuery({
    queryKey: ["available-drivers"],
    queryFn: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

      // Fetch online, verified drivers with their schedules
      const { data: drivers, error } = await supabase
        .from("drivers")
        .select(`
          id, 
          full_name, 
          current_lat, 
          current_lng,
          driver_schedules(
            day_of_week,
            start_time,
            end_time,
            is_active
          )
        `)
        .eq("is_online", true)
        .eq("status", "verified")
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (error) throw error;

      // Filter by current day and time
      const available = ((drivers as DriverWithSchedule[]) || []).filter(driver => {
        // If driver has no schedules, consider them available when online
        if (!driver.driver_schedules || driver.driver_schedules.length === 0) {
          return true;
        }
        
        const schedule = driver.driver_schedules.find(
          s => s.day_of_week === dayOfWeek && s.is_active
        );
        
        // No schedule for today means not available
        if (!schedule) return false;
        
        // Check if current time is within schedule
        return currentTime >= schedule.start_time && 
               currentTime <= schedule.end_time;
      });

      return available.map(d => ({
        id: d.id,
        full_name: d.full_name,
        current_lat: d.current_lat!,
        current_lng: d.current_lng!,
      })) as AvailableDriver[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}

export function useAvailableDriversCount(enableRealtime: boolean = true) {
  const { data, isLoading, error, refetch } = useAvailableDrivers(enableRealtime);
  return {
    count: data?.length || 0,
    isLoading,
    hasDrivers: (data?.length || 0) > 0,
    error,
    refetch,
    drivers: data || [],
  };
}
