/**
 * Audit Log Hook
 * Fetch/filter tenant audit logs with pagination
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  created_at: string;
  tenant_id: string;
  actor_id: string | null;
  actor_role: string | null;
  ip_address: string | null;
  user_agent: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  severity: AuditSeverity;
  summary: string;
  before_values: Record<string, unknown> | null;
  after_values: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

export interface AuditLogFilters {
  dateFrom?: Date;
  dateTo?: Date;
  severity?: AuditSeverity | "all";
  entityType?: string;
  action?: string;
  actorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useAuditLog(tenantId: string | null, filters: AuditLogFilters = {}) {
  const limit = filters.limit || 50;
  const page = filters.page || 0;
  const offset = page * limit;

  const query = useQuery({
    queryKey: ["audit-log", tenantId, filters],
    queryFn: async () => {
      if (!tenantId) return { logs: [], total: 0 };

      let q = supabase
        .from("tenant_audit_log")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.dateFrom) {
        q = q.gte("created_at", filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        q = q.lte("created_at", filters.dateTo.toISOString());
      }
      if (filters.severity && filters.severity !== "all") {
        q = q.eq("severity", filters.severity);
      }
      if (filters.entityType) {
        q = q.eq("entity_type", filters.entityType);
      }
      if (filters.action) {
        q = q.ilike("action", `%${filters.action}%`);
      }
      if (filters.actorId) {
        q = q.eq("actor_id", filters.actorId);
      }
      if (filters.search) {
        q = q.or(`summary.ilike.%${filters.search}%,action.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await q;
      if (error) throw error;

      return {
        logs: (data || []) as AuditLogEntry[],
        total: count || 0,
      };
    },
    enabled: !!tenantId,
  });

  return {
    logs: query.data?.logs || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAuditLogDetail(logId: string | null) {
  return useQuery({
    queryKey: ["audit-log-detail", logId],
    queryFn: async () => {
      if (!logId) return null;
      const { data, error } = await supabase
        .from("tenant_audit_log")
        .select("*")
        .eq("id", logId)
        .single();
      if (error) throw error;
      return data as AuditLogEntry;
    },
    enabled: !!logId,
  });
}

// Entity types for filtering
export const ENTITY_TYPES = [
  "order",
  "driver",
  "merchant",
  "payout",
  "refund",
  "dispute",
  "tenant",
  "role",
  "permission",
  "zone",
  "pricing",
  "promotion",
  "support_ticket",
] as const;

// Severity badge styling
export function getSeverityBadge(severity: AuditSeverity) {
  switch (severity) {
    case "critical":
      return { className: "bg-red-500/10 text-red-500 border-red-500/20", label: "Critical" };
    case "warning":
      return { className: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Warning" };
    default:
      return { className: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Info" };
  }
}
