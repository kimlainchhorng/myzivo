/**
 * Service Maintenance Hook
 * Check if a specific service is in maintenance mode
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ServiceName = "eats" | "rides" | "flights" | "hotels" | "cars" | "payments";

interface MaintenanceResult {
  isInMaintenance: boolean;
  isPaused: boolean;
  status: string | null;
  isLoading: boolean;
}

export function useServiceMaintenance(serviceName: ServiceName): MaintenanceResult {
  const { data, isLoading } = useQuery({
    queryKey: ["service-maintenance", serviceName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_health_status")
        .select("status, is_paused")
        .eq("service_name", serviceName)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch service maintenance status:", error);
        return { isInMaintenance: false, isPaused: false, status: null };
      }

      if (!data) {
        return { isInMaintenance: false, isPaused: false, status: null };
      }

      const isInMaintenance = 
        data.status === "maintenance" || 
        data.status === "outage" || 
        data.is_paused === true;

      return {
        isInMaintenance,
        isPaused: data.is_paused ?? false,
        status: data.status,
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });

  return {
    isInMaintenance: data?.isInMaintenance ?? false,
    isPaused: data?.isPaused ?? false,
    status: data?.status ?? null,
    isLoading,
  };
}
