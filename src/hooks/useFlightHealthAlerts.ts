/**
 * Flight Health Alerts Hook
 * Proactive alerting when failure rates spike
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subHours, subMinutes } from 'date-fns';

export interface HealthAlert {
  id: string;
  type: 'no_results' | 'payment_failures' | 'ticketing_failures' | 'api_degradation';
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  value: number;
  threshold: number;
  detectedAt: Date;
}

interface AlertThresholds {
  noResultsRatePercent: number;
  paymentFailuresCount: number;
  ticketingFailuresCount: number;
  avgResponseTimeMs: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  noResultsRatePercent: 30, // >30% zero-result searches in 1 hour
  paymentFailuresCount: 3, // >3 payment failures in 15 minutes
  ticketingFailuresCount: 2, // >2 ticketing failures in 15 minutes
  avgResponseTimeMs: 5000, // avg response >5s
};

/**
 * Check for health alerts based on recent activity
 */
export function useFlightHealthAlerts(thresholds: Partial<AlertThresholds> = {}) {
  const config = { ...DEFAULT_THRESHOLDS, ...thresholds };

  return useQuery({
    queryKey: ['flight-health-alerts'],
    queryFn: async (): Promise<HealthAlert[]> => {
      const alerts: HealthAlert[] = [];
      const now = new Date();
      const oneHourAgo = subHours(now, 1).toISOString();
      const fifteenMinAgo = subMinutes(now, 15).toISOString();

      // Check no-results rate (last hour)
      const { data: recentSearches } = await supabase
        .from('flight_search_logs')
        .select('offers_count, response_time_ms')
        .gte('created_at', oneHourAgo);

      if (recentSearches && recentSearches.length > 10) {
        const zeroResults = recentSearches.filter(s => s.offers_count === 0).length;
        const rate = (zeroResults / recentSearches.length) * 100;

        if (rate > config.noResultsRatePercent) {
          alerts.push({
            id: 'no_results_high',
            type: 'no_results',
            severity: 'warning',
            title: 'High No-Results Rate',
            message: `${rate.toFixed(1)}% of searches returned zero results in the last hour (threshold: ${config.noResultsRatePercent}%)`,
            value: rate,
            threshold: config.noResultsRatePercent,
            detectedAt: now,
          });
        }

        // Check API response time
        const avgResponseTime = recentSearches.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / recentSearches.length;
        if (avgResponseTime > config.avgResponseTimeMs) {
          alerts.push({
            id: 'api_slow',
            type: 'api_degradation',
            severity: 'warning',
            title: 'API Response Degradation',
            message: `Average response time is ${(avgResponseTime / 1000).toFixed(1)}s (threshold: ${config.avgResponseTimeMs / 1000}s)`,
            value: avgResponseTime,
            threshold: config.avgResponseTimeMs,
            detectedAt: now,
          });
        }
      }

      // Check payment failures (last 15 minutes)
      const { count: paymentFailures } = await supabase
        .from('flight_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('payment_status', 'failed')
        .gte('created_at', fifteenMinAgo);

      if ((paymentFailures || 0) >= config.paymentFailuresCount) {
        alerts.push({
          id: 'payment_failures',
          type: 'payment_failures',
          severity: 'critical',
          title: 'Payment Failures Detected',
          message: `${paymentFailures} payment failures in the last 15 minutes (threshold: ${config.paymentFailuresCount})`,
          value: paymentFailures || 0,
          threshold: config.paymentFailuresCount,
          detectedAt: now,
        });
      }

      // Check ticketing failures (last 15 minutes)
      const { count: ticketingFailures } = await supabase
        .from('flight_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('ticketing_status', 'failed')
        .gte('created_at', fifteenMinAgo);

      if ((ticketingFailures || 0) >= config.ticketingFailuresCount) {
        alerts.push({
          id: 'ticketing_failures',
          type: 'ticketing_failures',
          severity: 'critical',
          title: 'Ticketing Failures Detected',
          message: `${ticketingFailures} ticketing failures in the last 15 minutes (threshold: ${config.ticketingFailuresCount})`,
          value: ticketingFailures || 0,
          threshold: config.ticketingFailuresCount,
          detectedAt: now,
        });
      }

      // Check for unresolved admin alerts
      const { data: adminAlerts } = await supabase
        .from('flight_admin_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Add critical admin alerts
      (adminAlerts || []).forEach(alert => {
        if (alert.severity === 'critical') {
          alerts.push({
            id: `admin_${alert.id}`,
            type: alert.alert_type === 'payment_failed' ? 'payment_failures' : 'ticketing_failures',
            severity: 'critical',
            title: alert.alert_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            message: alert.message,
            value: 0,
            threshold: 0,
            detectedAt: new Date(alert.created_at),
          });
        }
      });

      return alerts;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
  });
}

/**
 * Get severity color class
 */
export function getAlertSeverityColor(severity: 'warning' | 'critical'): string {
  return severity === 'critical' 
    ? 'text-destructive bg-destructive/10 border-destructive/30' 
    : 'text-amber-600 bg-amber-500/10 border-amber-500/30';
}
