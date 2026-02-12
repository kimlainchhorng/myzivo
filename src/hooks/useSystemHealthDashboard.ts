/**
 * System Health Dashboard Hook
 * Combines service status, uptime logs, system logs, and performance metrics
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subHours, subDays } from "date-fns";

export interface ServiceStatus {
  id: string;
  service_name: string;
  service_key: string;
  status: string;
  is_paused: boolean;
  response_time_ms: number | null;
  error_rate: number | null;
  uptime_percent: number | null;
  last_check_at: string | null;
  incident_count: number | null;
}

export interface UptimeLogEntry {
  id: string;
  service_key: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  duration_seconds: number | null;
}

export interface SystemLogEntry {
  id: string;
  level: string;
  source: string;
  message: string;
  meta: Record<string, unknown>;
  created_at: string;
}

export function useServiceStatuses() {
  return useQuery({
    queryKey: ["system-health-services"],
    queryFn: async (): Promise<ServiceStatus[]> => {
      const { data, error } = await supabase
        .from("service_health_status")
        .select("*")
        .order("service_name");

      if (error) throw error;
      return (data || []) as ServiceStatus[];
    },
    refetchInterval: 30_000,
  });
}

export function useUptimeLogs(serviceKey?: string, days = 7) {
  return useQuery({
    queryKey: ["uptime-logs", serviceKey, days],
    queryFn: async (): Promise<UptimeLogEntry[]> => {
      const since = subDays(new Date(), days).toISOString();
      let query = supabase
        .from("service_uptime_log")
        .select("*")
        .gte("changed_at", since)
        .order("changed_at", { ascending: false })
        .limit(200);

      if (serviceKey) {
        query = query.eq("service_key", serviceKey);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as UptimeLogEntry[];
    },
    refetchInterval: 60_000,
  });
}

export function useSystemLogs(filters?: {
  level?: string;
  source?: string;
  hours?: number;
}) {
  const hours = filters?.hours || 24;
  return useQuery({
    queryKey: ["system-logs", filters?.level, filters?.source, hours],
    queryFn: async (): Promise<SystemLogEntry[]> => {
      const since = subHours(new Date(), hours).toISOString();
      let query = supabase
        .from("system_logs")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filters?.level) {
        query = query.eq("level", filters.level);
      }
      if (filters?.source) {
        query = query.eq("source", filters.source);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as SystemLogEntry[];
    },
    refetchInterval: 30_000,
  });
}

export function usePerformanceMetrics(hours = 1) {
  return useQuery({
    queryKey: ["perf-metrics-summary", hours],
    queryFn: async () => {
      const since = subHours(new Date(), hours).toISOString();
      const { data, error } = await supabase
        .from("performance_metrics")
        .select("service, value_ms, success, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      // Aggregate by service
      const byService: Record<string, { total: number; errors: number; sumMs: number }> = {};
      (data || []).forEach((row: any) => {
        if (!byService[row.service]) {
          byService[row.service] = { total: 0, errors: 0, sumMs: 0 };
        }
        byService[row.service].total++;
        if (!row.success) byService[row.service].errors++;
        byService[row.service].sumMs += row.value_ms || 0;
      });

      return Object.entries(byService).map(([service, stats]) => ({
        service,
        avgResponseTime: Math.round(stats.sumMs / stats.total),
        errorRate: Math.round((stats.errors / stats.total) * 100 * 10) / 10,
        totalCalls: stats.total,
      }));
    },
    refetchInterval: 30_000,
  });
}
