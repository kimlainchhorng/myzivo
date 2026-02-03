/**
 * Hook for flight admin status and alerts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FlightAdminAlert {
  id: string;
  booking_id: string | null;
  alert_type: 'ticketing_failed' | 'refund_failed' | 'api_error' | 'payment_failed';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export function useFlightAdminAlerts(limit = 20) {
  return useQuery({
    queryKey: ['flight-admin-alerts', limit],
    queryFn: async (): Promise<FlightAdminAlert[]> => {
      const { data, error } = await supabase
        .from('flight_admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as FlightAdminAlert[];
    },
    staleTime: 30 * 1000,
  });
}

export function useUnresolvedAlerts() {
  return useQuery({
    queryKey: ['flight-admin-alerts-unresolved'],
    queryFn: async (): Promise<FlightAdminAlert[]> => {
      const { data, error } = await supabase
        .from('flight_admin_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FlightAdminAlert[];
    },
    staleTime: 30 * 1000,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('flight_admin_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flight-admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['flight-admin-alerts-unresolved'] });
    },
  });
}

export function useFlightBookingStats(hoursAgo = 24) {
  return useQuery({
    queryKey: ['flight-booking-stats', hoursAgo],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      const { data: bookings, error } = await supabase
        .from('flight_bookings')
        .select('id, payment_status, ticketing_status, created_at')
        .gte('created_at', cutoff);

      if (error) throw error;

      const total = bookings?.length || 0;
      const issued = bookings?.filter(b => b.ticketing_status === 'issued').length || 0;
      const failed = bookings?.filter(b => b.ticketing_status === 'failed').length || 0;
      const pending = bookings?.filter(b => b.ticketing_status === 'pending' || b.ticketing_status === 'processing').length || 0;
      const refunded = bookings?.filter(b => b.payment_status === 'refunded').length || 0;

      return {
        total,
        issued,
        failed,
        pending,
        refunded,
        successRate: total > 0 ? Math.round((issued / total) * 100) : 0,
      };
    },
    staleTime: 60 * 1000,
  });
}
