/**
 * Enterprise Security Hooks
 * Handles security incidents, audit logs, compliance exports
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  SecurityIncident,
  FailedLoginAttempt,
  PIIAccessLog,
  DataRetentionPolicy,
  ComplianceExportRequest,
  SecurityStats,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@/types/security";

// ============================================================
// SECURITY INCIDENTS
// ============================================================

export function useSecurityIncidents(filters?: {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["security-incidents", filters],
    queryFn: async () => {
      let query = supabase
        .from("security_incidents" as any)
        .select("*")
        .order("detected_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.severity) query = query.eq("severity", filters.severity);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as SecurityIncident[];
    },
  });
}

export function useCreateSecurityIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      incident_type: IncidentType;
      severity: IncidentSeverity;
      title: string;
      description?: string;
      detection_method?: string;
    }) => {
      const { data, error } = await supabase
        .from("security_incidents" as any)
        .insert({ ...params, detected_by: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as SecurityIncident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      toast.success("Security incident created");
    },
  });
}

export function useUpdateSecurityIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { id: string; status?: IncidentStatus; resolution_notes?: string }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (params.status) updates.status = params.status;
      if (params.resolution_notes) updates.resolution_notes = params.resolution_notes;
      if (params.status === "resolved") {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id;
      }

      const { error } = await supabase.from("security_incidents" as any).update(updates).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      toast.success("Incident updated");
    },
  });
}

export function useFailedLoginAttempts(limit: number = 50) {
  return useQuery({
    queryKey: ["failed-logins", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("failed_login_attempts" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as FailedLoginAttempt[];
    },
  });
}

export function usePIIAccessLogs(filters?: { limit?: number }) {
  return useQuery({
    queryKey: ["pii-access-logs", filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pii_access_logs" as any)
        .select("*")
        .order("accessed_at", { ascending: false })
        .limit(filters?.limit || 100);
      if (error) throw error;
      return (data || []) as unknown as PIIAccessLog[];
    },
  });
}

export function useDataRetentionPolicies() {
  return useQuery({
    queryKey: ["data-retention-policies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("data_retention_policies" as any).select("*").order("entity_type");
      if (error) throw error;
      return (data || []) as unknown as DataRetentionPolicy[];
    },
  });
}

export function useComplianceExports() {
  return useQuery({
    queryKey: ["compliance-exports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_export_requests" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as ComplianceExportRequest[];
    },
  });
}

export function useRequestComplianceExport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { export_type: string; date_range_start?: string; date_range_end?: string }) => {
      const { data, error } = await supabase
        .from("compliance_export_requests" as any)
        .insert({ ...params, requested_by: user?.id, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ComplianceExportRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exports"] });
      toast.success("Export requested");
    },
  });
}

export function useSecurityStats() {
  return useQuery({
    queryKey: ["security-stats"],
    queryFn: async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [incidents, failedLogins, piiAccess, pendingExports] = await Promise.all([
        supabase.from("security_incidents" as any).select("id, status, severity").neq("status", "closed"),
        supabase.from("failed_login_attempts" as any).select("id").gte("created_at", yesterday.toISOString()),
        supabase.from("pii_access_logs" as any).select("id").gte("accessed_at", yesterday.toISOString()),
        supabase.from("compliance_export_requests" as any).select("id").eq("status", "pending"),
      ]);

      const list = (incidents.data || []) as any[];
      return {
        totalIncidents: list.length,
        openIncidents: list.filter((i) => i.status === "detected" || i.status === "investigating").length,
        criticalIncidents: list.filter((i) => i.severity === "critical").length,
        failedLogins24h: (failedLogins.data || []).length,
        piiAccessCount24h: (piiAccess.data || []).length,
        pendingExports: (pendingExports.data || []).length,
      } as SecurityStats;
    },
    staleTime: 30 * 1000,
  });
}

export function useAuditLogs(filters?: { limit?: number }) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 100);
      if (error) throw error;
      return data || [];
    },
  });
}
