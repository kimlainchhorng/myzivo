/**
 * Customer System Status Hook
 * Lightweight hook for checking if any system incident or maintenance is active
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DELIVERY_KEYS = ["eats", "rides", "dispatch"];
const PAYMENT_KEYS = ["payments"];

const DELIVERY_MESSAGE = "High demand in your area – delivery times may be longer.";
const PAYMENT_MESSAGE = "Payment processing delays – please try again shortly.";
const GENERIC_MESSAGE = "Some services may be temporarily slower than usual.";
const MAINTENANCE_MESSAGE = "ZIVO is temporarily under maintenance. Please try again shortly.";

export type IncidentType = "delivery" | "payment" | "general";

function deriveIncident(serviceKeys: string[]): { message: string; type: IncidentType } {
  const hasPayment = serviceKeys.some((k) => PAYMENT_KEYS.includes(k));
  const hasDelivery = serviceKeys.some((k) => DELIVERY_KEYS.includes(k));

  if (hasPayment) return { message: PAYMENT_MESSAGE, type: "payment" };
  if (hasDelivery) return { message: DELIVERY_MESSAGE, type: "delivery" };
  return { message: GENERIC_MESSAGE, type: "general" };
}

export function useSystemStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["system-status-customer"],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from("service_health_status")
        .select("service_name, service_key, status, is_paused")
        .or("status.neq.operational,is_paused.eq.true");

      if (error) {
        console.error("Failed to fetch system status:", error);
        return { hasActiveIncident: false, isMaintenanceMode: false, incidentMessage: GENERIC_MESSAGE, incidentType: "general" as IncidentType };
      }

      const hasActiveIncident = services && services.length > 0;
      const isMaintenanceMode = services?.some(
        (s) => s.status === "maintenance" || s.is_paused === true
      ) ?? false;

      const degradedKeys = (services ?? []).map((s) => s.service_key).filter(Boolean) as string[];
      const { message, type } = deriveIncident(degradedKeys);

      return { hasActiveIncident, isMaintenanceMode, incidentMessage: message, incidentType: type };
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  return {
    hasActiveIncident: data?.hasActiveIncident ?? false,
    isMaintenanceMode: data?.isMaintenanceMode ?? false,
    incidentMessage: data?.incidentMessage ?? GENERIC_MESSAGE,
    incidentType: (data?.incidentType ?? "general") as IncidentType,
    maintenanceMessage: MAINTENANCE_MESSAGE,
    isLoading,
  };
}