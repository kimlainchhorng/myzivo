/**
 * Incident Logs Hooks
 * Manage flight incident tracking and resolution
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { FlightIncidentLog, IncidentReasonCode } from "@/types/flightsLaunch";

/**
 * Get the currently active (unresolved) incident
 */
export function useActiveIncident() {
  return useQuery({
    queryKey: ["flight-incident-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_incident_logs")
        .select("*")
        .is("resolved_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as FlightIncidentLog | null;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Get incident history
 */
export function useIncidentHistory(limit: number = 20) {
  return useQuery({
    queryKey: ["flight-incident-history", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_incident_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as FlightIncidentLog[];
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Create a new incident log when pausing
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      incidentType: 'manual_pause' | 'auto_pause' | 'failure_spike' | 'api_outage';
      reasonCode: IncidentReasonCode;
      description?: string;
      affectedBookingIds?: string[];
      failureCountTrigger?: number;
    }) => {
      const { data, error } = await supabase
        .from("flight_incident_logs")
        .insert({
          incident_type: params.incidentType,
          reason_code: params.reasonCode,
          description: params.description,
          affected_booking_ids: params.affectedBookingIds || [],
          affected_bookings_count: params.affectedBookingIds?.length || 0,
          failure_count_trigger: params.failureCountTrigger,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FlightIncidentLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-incident-active"] });
      queryClient.invalidateQueries({ queryKey: ["flight-incident-history"] });
    },
    onError: (error: Error) => {
      console.error("[CreateIncident] Error:", error);
      toast.error("Failed to create incident log");
    },
  });
}

/**
 * Resolve an active incident
 */
export function useResolveIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      incidentId: string;
      resolutionNotes?: string;
      notifyCustomers?: boolean;
    }) => {
      const { error } = await supabase
        .from("flight_incident_logs")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: params.resolutionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.incidentId);

      if (error) throw error;

      // If notifying customers, call the edge function
      if (params.notifyCustomers) {
        try {
          await supabase.functions.invoke('resolve-flight-incident', {
            body: {
              incidentId: params.incidentId,
              notifyCustomers: true,
            },
          });
        } catch (notifyError) {
          console.error("[ResolveIncident] Failed to notify customers:", notifyError);
          // Don't throw - resolution succeeded even if notification failed
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flight-incident-active"] });
      queryClient.invalidateQueries({ queryKey: ["flight-incident-history"] });
      queryClient.invalidateQueries({ queryKey: ["flights-launch-settings"] });
      toast.success("Incident resolved");
    },
    onError: (error: Error) => {
      console.error("[ResolveIncident] Error:", error);
      toast.error("Failed to resolve incident");
    },
  });
}

/**
 * Get incident statistics
 */
export function useIncidentStats() {
  return useQuery({
    queryKey: ["flight-incident-stats"],
    queryFn: async () => {
      // Get last 30 days of incidents
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("flight_incident_logs")
        .select("*")
        .gte("started_at", thirtyDaysAgo.toISOString());

      if (error) throw error;

      const incidents = (data || []) as unknown as FlightIncidentLog[];
      
      // Calculate stats
      const totalIncidents = incidents.length;
      const resolvedIncidents = incidents.filter(i => i.resolved_at).length;
      const totalAffectedBookings = incidents.reduce((sum, i) => sum + (i.affected_bookings_count || 0), 0);
      const totalCustomersNotified = incidents.reduce((sum, i) => sum + (i.customers_notified || 0), 0);
      
      // Average resolution time in minutes
      const resolvedWithTime = incidents.filter(i => i.resolved_at);
      const avgResolutionMinutes = resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, i) => {
            const start = new Date(i.started_at).getTime();
            const end = new Date(i.resolved_at!).getTime();
            return sum + (end - start) / 1000 / 60;
          }, 0) / resolvedWithTime.length
        : 0;

      // Count by reason
      const byReason = incidents.reduce((acc, i) => {
        acc[i.reason_code] = (acc[i.reason_code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalIncidents,
        resolvedIncidents,
        openIncidents: totalIncidents - resolvedIncidents,
        totalAffectedBookings,
        totalCustomersNotified,
        avgResolutionMinutes: Math.round(avgResolutionMinutes),
        byReason,
      };
    },
    staleTime: 60 * 1000,
  });
}
