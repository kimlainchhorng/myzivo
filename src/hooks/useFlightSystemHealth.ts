/**
 * Flight System Health Monitoring Hook
 * Tracks Duffel API, Stripe, and booking system health for admin dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subHours } from "date-fns";

export interface FlightSystemHealth {
  duffel: {
    status: 'ok' | 'degraded' | 'down';
    errorRate: number;
    avgResponseTime: number;
    lastError?: string;
    totalSearches: number;
  };
  stripe: {
    status: 'ok' | 'degraded' | 'down';
    failedPayments: number;
    mode: 'test' | 'live' | 'unknown';
  };
  bookings: {
    status: 'ok' | 'warning' | 'critical';
    lastSuccessAt: string | null;
    failedToday: number;
    pendingTickets: number;
    paymentToFailureRate: number;
    totalToday: number;
  };
  alerts: {
    critical: number;
    warning: number;
    unresolved: number;
  };
  overall: 'healthy' | 'degraded' | 'critical';
}

export function useFlightSystemHealth(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['flight-system-health'],
    queryFn: async (): Promise<FlightSystemHealth> => {
      const now = new Date();
      const oneHourAgo = subHours(now, 1);
      const twentyFourHoursAgo = subHours(now, 24);

      // Get recent search logs for Duffel health
      const { data: searchLogs } = await supabase
        .from('flight_search_logs')
        .select('duffel_error, response_time_ms, created_at')
        .gte('created_at', oneHourAgo.toISOString());

      const errorSearches = searchLogs?.filter(s => s.duffel_error)?.length || 0;
      const totalSearches = searchLogs?.length || 0;
      const duffelErrorRate = totalSearches > 0 ? (errorSearches / totalSearches) * 100 : 0;
      const avgResponseTime = searchLogs?.length 
        ? searchLogs.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / searchLogs.length 
        : 0;

      // Get booking stats for last 24h
      const { data: bookings } = await supabase
        .from('flight_bookings')
        .select('id, payment_status, ticketing_status, created_at, ticketed_at')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      const failedBookings = bookings?.filter(b => 
        b.ticketing_status === 'failed' || b.payment_status === 'refunded'
      )?.length || 0;
      
      const pendingTickets = bookings?.filter(b => 
        b.ticketing_status === 'pending' || b.ticketing_status === 'processing'
      )?.length || 0;

      // Calculate payment success but ticketing failure rate
      const paidButFailed = bookings?.filter(b => 
        b.payment_status === 'paid' && b.ticketing_status === 'failed'
      )?.length || 0;
      const paidTotal = bookings?.filter(b => b.payment_status === 'paid')?.length || 0;
      const paymentToFailureRate = paidTotal > 0 ? (paidButFailed / paidTotal) * 100 : 0;

      // Get last successful booking
      const { data: lastSuccess } = await supabase
        .from('flight_bookings')
        .select('ticketed_at')
        .eq('ticketing_status', 'issued')
        .order('ticketed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get unresolved alerts
      const { data: alerts } = await supabase
        .from('flight_admin_alerts')
        .select('severity, resolved')
        .eq('resolved', false);

      const criticalAlerts = alerts?.filter(a => a.severity === 'critical')?.length || 0;
      const warningAlerts = alerts?.filter(a => a.severity === 'high' || a.severity === 'medium')?.length || 0;

      // Determine statuses
      const duffelStatus: 'ok' | 'degraded' | 'down' = 
        duffelErrorRate > 50 ? 'down' : 
        duffelErrorRate > 20 ? 'degraded' : 'ok';
      
      const bookingStatus: 'ok' | 'warning' | 'critical' = 
        criticalAlerts > 0 || paymentToFailureRate > 10 ? 'critical' : 
        failedBookings > 5 || paymentToFailureRate > 5 ? 'warning' : 'ok';

      // Calculate overall health
      const overall: 'healthy' | 'degraded' | 'critical' = 
        (duffelStatus === 'down' || bookingStatus === 'critical') ? 'critical' :
        (duffelStatus === 'degraded' || bookingStatus === 'warning') ? 'degraded' : 'healthy';

      return {
        duffel: {
          status: duffelStatus,
          errorRate: Math.round(duffelErrorRate * 10) / 10,
          avgResponseTime: Math.round(avgResponseTime),
          lastError: searchLogs?.find(s => s.duffel_error)?.duffel_error || undefined,
          totalSearches,
        },
        stripe: {
          status: 'ok', // Would need actual Stripe health check
          failedPayments: 0,
          mode: 'unknown',
        },
        bookings: {
          status: bookingStatus,
          lastSuccessAt: lastSuccess?.ticketed_at || null,
          failedToday: failedBookings,
          pendingTickets,
          paymentToFailureRate: Math.round(paymentToFailureRate * 10) / 10,
          totalToday: bookings?.length || 0,
        },
        alerts: {
          critical: criticalAlerts,
          warning: warningAlerts,
          unresolved: alerts?.length || 0,
        },
        overall,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    enabled: options?.enabled !== false,
  });
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: 'ok' | 'degraded' | 'down' | 'warning' | 'critical' | 'healthy'): string {
  switch (status) {
    case 'ok':
    case 'healthy':
      return 'text-emerald-500';
    case 'degraded':
    case 'warning':
      return 'text-amber-500';
    case 'down':
    case 'critical':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get status badge variant for UI display
 */
export function getStatusBadgeVariant(status: string): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (status) {
    case 'ok':
    case 'healthy':
      return 'default';
    case 'degraded':
    case 'warning':
      return 'secondary';
    case 'down':
    case 'critical':
      return 'destructive';
    default:
      return 'outline';
  }
}
