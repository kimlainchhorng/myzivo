/**
 * Customer System Status Hook
 * Lightweight hook for checking if any system incident is active
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const INCIDENT_MESSAGE = "Some services may be temporarily slower than usual.";

export function useSystemStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["system-status-customer"],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from("service_health_status")
        .select("status, is_paused")
        .or("status.neq.operational,is_paused.eq.true");

      if (error) {
        console.error("Failed to fetch system status:", error);
        return { hasActiveIncident: false };
      }

      return {
        hasActiveIncident: services && services.length > 0,
      };
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Poll every minute
  });

  return {
    hasActiveIncident: data?.hasActiveIncident ?? false,
    incidentMessage: INCIDENT_MESSAGE,
    isLoading,
  };
}
