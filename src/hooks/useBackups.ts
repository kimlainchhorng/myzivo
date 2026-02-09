/**
 * Backup Hooks
 * Manage backup runs, trigger backups, and download backup files
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BackupRun {
  id: string;
  backup_type: string;
  status: string;
  file_url: string | null;
  created_at: string;
}

export interface BackupLog {
  id: string;
  backup_type: string;
  backup_target: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  storage_location: string | null;
  size_bytes: number | null;
  retention_days: number;
  expires_at: string | null;
  error_message: string | null;
  triggered_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BackupStats {
  totalBackups: number;
  successfulBackups: number;
  failedBackups7Days: number;
  lastDbBackup: BackupLog | null;
  lastStorageBackup: BackupLog | null;
}

/**
 * Fetch recent backup runs (simple view)
 */
export function useBackupRuns(limit = 50) {
  return useQuery({
    queryKey: ["backup-runs", limit],
    queryFn: async (): Promise<BackupRun[]> => {
      const { data, error } = await supabase
        .from("backup_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch detailed backup logs
 */
export function useBackupLogs(limit = 100) {
  return useQuery({
    queryKey: ["backup-logs", limit],
    queryFn: async (): Promise<BackupLog[]> => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as BackupLog[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Get backup statistics
 */
export function useBackupStats() {
  return useQuery({
    queryKey: ["backup-stats"],
    queryFn: async (): Promise<BackupStats> => {
      // Get total backups
      const { count: totalCount } = await supabase
        .from("backup_logs")
        .select("*", { count: "exact", head: true });

      // Get successful backups
      const { count: successCount } = await supabase
        .from("backup_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Get failed backups in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: failedCount } = await supabase
        .from("backup_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("created_at", sevenDaysAgo.toISOString());

      // Get last DB backup
      const { data: lastDb } = await supabase
        .from("backup_logs")
        .select("*")
        .eq("backup_target", "database")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get last storage backup
      const { data: lastStorage } = await supabase
        .from("backup_logs")
        .select("*")
        .eq("backup_target", "storage")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        totalBackups: totalCount || 0,
        successfulBackups: successCount || 0,
        failedBackups7Days: failedCount || 0,
        lastDbBackup: lastDb as BackupLog | null,
        lastStorageBackup: lastStorage as BackupLog | null,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Trigger a database backup manually
 */
export function useTriggerDatabaseBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("run-database-backup", {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Database backup started");
      queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
      queryClient.invalidateQueries({ queryKey: ["backup-runs"] });
      queryClient.invalidateQueries({ queryKey: ["backup-stats"] });
    },
    onError: (error) => {
      toast.error(`Backup failed: ${error.message}`);
    },
  });
}

/**
 * Trigger a storage backup manually
 */
export function useTriggerStorageBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("run-storage-backup", {
        body: {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Storage backup started");
      queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
      queryClient.invalidateQueries({ queryKey: ["backup-runs"] });
      queryClient.invalidateQueries({ queryKey: ["backup-stats"] });
    },
    onError: (error) => {
      toast.error(`Backup failed: ${error.message}`);
    },
  });
}

/**
 * Get a signed URL to download a backup file
 */
export function useDownloadBackup() {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from("system-backups")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    },
    onSuccess: (url) => {
      // Open download in new tab
      window.open(url, "_blank");
      toast.success("Download started");
    },
    onError: (error) => {
      toast.error(`Download failed: ${error.message}`);
    },
  });
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format relative time
 */
export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
