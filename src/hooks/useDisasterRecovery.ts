/**
 * ZIVO Disaster Recovery & Business Continuity Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  BackupLog,
  DRConfiguration,
  ServiceHealthStatus,
  RecoveryTest,
  IncidentTemplate,
  RestoreOperation,
  SystemHealthHistory,
  RecoverySummary,
  BackupType,
  BackupTarget,
  ServiceStatus,
  RestoreStatus,
} from "@/types/recovery";

// ============================================
// BACKUP LOGS
// ============================================

export function useBackupLogs(limit = 50) {
  return useQuery({
    queryKey: ["backup-logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as BackupLog[];
    },
  });
}

export function useTriggerBackup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      backupType,
      backupTarget,
    }: {
      backupType: BackupType;
      backupTarget: BackupTarget;
    }) => {
      const { data, error } = await supabase
        .from("backup_logs")
        .insert({
          backup_type: backupType,
          backup_target: backupTarget,
          status: "in_progress",
          triggered_by: user?.id,
          retention_days: 30,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate backup completion after a delay (in production, this would be handled by a background job)
      setTimeout(async () => {
        await supabase
          .from("backup_logs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            size_bytes: Math.floor(Math.random() * 1000000000) + 100000000,
            storage_location: `s3://zivo-backups/${new Date().toISOString().split("T")[0]}/${data.id}`,
          })
          .eq("id", data.id);
        queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
        queryClient.invalidateQueries({ queryKey: ["recovery-summary"] });
      }, 5000);

      return data as unknown as BackupLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
      toast.success("Backup started");
    },
    onError: (error) => {
      toast.error("Failed to start backup: " + error.message);
    },
  });
}

// ============================================
// DR CONFIGURATION
// ============================================

export function useDRConfiguration() {
  return useQuery({
    queryKey: ["dr-configuration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dr_configuration")
        .select("*");

      if (error) throw error;
      
      // Convert to key-value map
      const config: Record<string, unknown> = {};
      (data || []).forEach((row: any) => {
        config[row.config_key] = row.config_value;
      });
      return config;
    },
  });
}

export function useUpdateDRConfiguration() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: unknown;
    }) => {
      const { error } = await supabase
        .from("dr_configuration")
        .update({ config_value: value as any, updated_by: user?.id })
        .eq("config_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dr-configuration"] });
      toast.success("Configuration updated");
    },
  });
}

// ============================================
// SERVICE HEALTH
// ============================================

export function useServiceHealthStatus() {
  return useQuery({
    queryKey: ["service-health-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_health_status")
        .select("*")
        .order("service_name");

      if (error) throw error;
      return (data || []) as unknown as ServiceHealthStatus[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useUpdateServiceStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      serviceName,
      status,
      isPaused,
      pausedReason,
    }: {
      serviceName: string;
      status?: ServiceStatus;
      isPaused?: boolean;
      pausedReason?: string;
    }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status !== undefined) updates.status = status;
      if (isPaused !== undefined) {
        updates.is_paused = isPaused;
        updates.paused_at = isPaused ? new Date().toISOString() : null;
        updates.paused_by = isPaused ? user?.id : null;
        updates.paused_reason = isPaused ? pausedReason : null;
      }

      const { error } = await supabase
        .from("service_health_status")
        .update(updates)
        .eq("service_name", serviceName);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-health-status"] });
      toast.success("Service status updated");
    },
  });
}

// ============================================
// RECOVERY TESTS
// ============================================

export function useRecoveryTests(limit = 20) {
  return useQuery({
    queryKey: ["recovery-tests", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recovery_tests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as RecoveryTest[];
    },
  });
}

export function useScheduleRecoveryTest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      testType,
      testName,
      scheduledAt,
    }: {
      testType: string;
      testName: string;
      scheduledAt: string;
    }) => {
      const { data, error } = await supabase
        .from("recovery_tests")
        .insert({
          test_type: testType,
          test_name: testName,
          scheduled_at: scheduledAt,
          status: "scheduled",
          conducted_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as RecoveryTest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recovery-tests"] });
      toast.success("Recovery test scheduled");
    },
  });
}

// ============================================
// INCIDENT TEMPLATES
// ============================================

export function useIncidentTemplates() {
  return useQuery({
    queryKey: ["incident-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incident_templates")
        .select("*")
        .order("incident_severity")
        .order("template_type");

      if (error) throw error;
      return (data || []) as unknown as IncidentTemplate[];
    },
  });
}

// ============================================
// RESTORE OPERATIONS
// ============================================

export function useRestoreOperations(status?: RestoreStatus) {
  return useQuery({
    queryKey: ["restore-operations", status],
    queryFn: async () => {
      let query = supabase
        .from("restore_operations")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as RestoreOperation[];
    },
  });
}

export function useRequestRestore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      backupId,
      restoreType,
      targetEnvironment,
      notes,
    }: {
      backupId?: string;
      restoreType: string;
      targetEnvironment: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("restore_operations")
        .insert({
          backup_id: backupId || null,
          restore_type: restoreType,
          target_environment: targetEnvironment,
          requested_by: user?.id,
          notes,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as RestoreOperation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restore-operations"] });
      toast.success("Restore request submitted for approval");
    },
  });
}

export function useApproveRestore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      approved,
    }: {
      id: string;
      approved: boolean;
    }) => {
      const { error } = await supabase
        .from("restore_operations")
        .update({
          status: approved ? "approved" : "cancelled",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["restore-operations"] });
      toast.success(approved ? "Restore approved" : "Restore cancelled");
    },
  });
}

// ============================================
// SYSTEM HEALTH HISTORY
// ============================================

export function useSystemHealthHistory(hours = 24) {
  return useQuery({
    queryKey: ["system-health-history", hours],
    queryFn: async () => {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("system_health_history")
        .select("*")
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SystemHealthHistory[];
    },
  });
}

// ============================================
// RECOVERY SUMMARY
// ============================================

export function useRecoverySummary() {
  return useQuery({
    queryKey: ["recovery-summary"],
    queryFn: async () => {
      const [backupsRes, configRes, servicesRes, restoresRes, testsRes] = await Promise.all([
        supabase
          .from("backup_logs")
          .select("status, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("dr_configuration").select("config_key, config_value"),
        supabase.from("service_health_status").select("status, is_paused"),
        supabase.from("restore_operations").select("status").eq("status", "pending"),
        supabase
          .from("recovery_tests")
          .select("status, scheduled_at")
          .order("completed_at", { ascending: false })
          .limit(10),
      ]);

      const backups = (backupsRes.data || []) as any[];
      const config = (configRes.data || []) as any[];
      const services = (servicesRes.data || []) as any[];
      const restores = (restoresRes.data || []) as any[];
      const tests = (testsRes.data || []) as any[];

      const rtoConfig = config.find((c: any) => c.config_key === "rto_minutes");
      const rpoConfig = config.find((c: any) => c.config_key === "rpo_minutes");

      const lastBackup = backups[0];
      const lastTest = tests.find((t: any) => t.status === "passed" || t.status === "failed");

      const summary: RecoverySummary = {
        lastBackupAt: lastBackup?.created_at || null,
        lastBackupStatus: lastBackup?.status || null,
        totalBackups: backups.length,
        failedBackups: backups.filter((b: any) => b.status === "failed").length,
        rtoMinutes: rtoConfig ? parseInt(rtoConfig.config_value) : 240,
        rpoMinutes: rpoConfig ? parseInt(rpoConfig.config_value) : 60,
        servicesOperational: services.filter((s: any) => s.status === "operational" && !s.is_paused).length,
        servicesDegraded: services.filter((s: any) => s.status === "degraded" || s.is_paused).length,
        servicesOutage: services.filter((s: any) => s.status === "outage").length,
        pendingRestores: restores.length,
        scheduledTests: tests.filter((t: any) => t.status === "scheduled").length,
        lastTestPassed: lastTest ? lastTest.status === "passed" : null,
      };

      return summary;
    },
    staleTime: 30 * 1000,
  });
}
