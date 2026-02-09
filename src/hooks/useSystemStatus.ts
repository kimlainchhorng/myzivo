/**
 * Customer System Status Hook
 * Lightweight hook for checking if any system incident or maintenance is active
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const INCIDENT_MESSAGE = "Some services may be temporarily slower than usual.";
const MAINTENANCE_MESSAGE = "ZIVO is temporarily under maintenance. Please try again shortly.";

export function useSystemStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["system-status-customer"],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from("service_health_status")
        .select("service_name, status, is_paused")
        .or("status.neq.operational,is_paused.eq.true");

      if (error) {
        console.error("Failed to fetch system status:", error);
        return { hasActiveIncident: false, isMaintenanceMode: false };
      }

      const hasActiveIncident = services && services.length > 0;
      const isMaintenanceMode = services?.some(
        (s) => s.status === "maintenance" || s.is_paused === true
      ) ?? false;

      return { hasActiveIncident, isMaintenanceMode };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  return {
    hasActiveIncident: data?.hasActiveIncident ?? false,
    isMaintenanceMode: data?.isMaintenanceMode ?? false,
    incidentMessage: INCIDENT_MESSAGE,
    maintenanceMessage: MAINTENANCE_MESSAGE,
    isLoading,
  };
}
