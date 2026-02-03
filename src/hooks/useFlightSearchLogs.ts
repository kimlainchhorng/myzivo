/**
 * Hook for fetching flight search logs (admin only)
 * Used by the admin debug panel to diagnose Duffel search issues
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FlightSearchLog {
  id: string;
  session_id: string | null;
  user_id: string | null;
  origin_iata: string;
  destination_iata: string;
  departure_date: string;
  return_date: string | null;
  passengers: number;
  cabin_class: string;
  duffel_request_id: string | null;
  duffel_status_code: number | null;
  duffel_error: string | null;
  offers_count: number;
  response_time_ms: number | null;
  environment: string;
  created_at: string;
}

interface FlightSearchStats {
  total_searches: number;
  success_rate: number;
  avg_response_time: number;
  zero_results_count: number;
  error_count: number;
}

/**
 * Fetch flight search logs for admin debug panel
 */
export function useFlightSearchLogs(limit = 50) {
  return useQuery({
    queryKey: ['flight-search-logs', limit],
    queryFn: async (): Promise<FlightSearchLog[]> => {
      const { data, error } = await supabase
        .from('flight_search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as FlightSearchLog[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Calculate stats from flight search logs
 */
export function useFlightSearchStats() {
  const { data: logs, ...rest } = useFlightSearchLogs(100);

  const stats: FlightSearchStats | null = logs ? {
    total_searches: logs.length,
    success_rate: logs.length > 0 
      ? (logs.filter(l => !l.duffel_error && l.offers_count > 0).length / logs.length) * 100 
      : 0,
    avg_response_time: logs.length > 0
      ? logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length
      : 0,
    zero_results_count: logs.filter(l => l.offers_count === 0 && !l.duffel_error).length,
    error_count: logs.filter(l => !!l.duffel_error).length,
  } : null;

  return { stats, logs, ...rest };
}

/**
 * Fetch logs filtered by route
 */
export function useFlightSearchLogsByRoute(origin: string, destination: string, limit = 20) {
  return useQuery({
    queryKey: ['flight-search-logs-route', origin, destination, limit],
    queryFn: async (): Promise<FlightSearchLog[]> => {
      const { data, error } = await supabase
        .from('flight_search_logs')
        .select('*')
        .eq('origin_iata', origin.toUpperCase())
        .eq('destination_iata', destination.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as FlightSearchLog[];
    },
    enabled: !!origin && !!destination,
    staleTime: 30 * 1000,
  });
}
