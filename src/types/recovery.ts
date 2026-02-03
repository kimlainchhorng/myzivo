/**
 * ZIVO Disaster Recovery & Business Continuity Types
 */

export interface BackupLog {
  id: string;
  backup_type: BackupType;
  backup_target: BackupTarget;
  status: BackupStatus;
  started_at: string;
  completed_at: string | null;
  size_bytes: number | null;
  storage_location: string | null;
  retention_days: number;
  expires_at: string | null;
  error_message: string | null;
  triggered_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DRConfiguration {
  id: string;
  config_key: string;
  config_value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface ServiceHealthStatus {
  id: string;
  service_name: ServiceName;
  status: ServiceStatus;
  is_paused: boolean;
  paused_reason: string | null;
  paused_at: string | null;
  paused_by: string | null;
  last_check_at: string;
  uptime_percent: number;
  incident_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RecoveryTest {
  id: string;
  test_type: RecoveryTestType;
  test_name: string;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  status: RecoveryTestStatus;
  recovery_time_seconds: number | null;
  data_loss_seconds: number | null;
  test_results: Record<string, unknown>;
  issues_found: string[] | null;
  conducted_by: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface IncidentTemplate {
  id: string;
  template_name: string;
  template_type: TemplateType;
  incident_severity: IncidentSeverity;
  subject: string | null;
  body: string;
  variables: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RestoreOperation {
  id: string;
  backup_id: string | null;
  restore_type: RestoreType;
  target_environment: TargetEnvironment;
  status: RestoreStatus;
  requested_by: string;
  approved_by: string | null;
  approved_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  recovery_point: string | null;
  affected_tables: string[] | null;
  rollback_available: boolean;
  error_message: string | null;
  notes: string | null;
  created_at: string;
}

export interface SystemHealthHistory {
  id: string;
  recorded_at: string;
  service_statuses: Record<string, ServiceStatus>;
  overall_health: OverallHealth;
  active_incidents: number;
  metrics: HealthMetrics;
}

export interface HealthMetrics {
  cpu_percent?: number;
  memory_percent?: number;
  avg_response_ms?: number;
  error_rate?: number;
  requests_per_minute?: number;
}

// Enums
export type BackupType = 'full' | 'incremental' | 'files' | 'manual';
export type BackupTarget = 'database' | 'storage' | 'documents' | 'all';
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type ServiceName = 'flights' | 'hotels' | 'cars' | 'rides' | 'eats' | 'auth' | 'payments' | 'storage';
export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';
export type RecoveryTestType = 'full_restore' | 'partial_restore' | 'failover' | 'backup_verify';
export type RecoveryTestStatus = 'scheduled' | 'in_progress' | 'passed' | 'failed' | 'cancelled';
export type TemplateType = 'email' | 'in_app' | 'status_page' | 'sms';
export type IncidentSeverity = 'minor' | 'major' | 'critical';
export type RestoreType = 'full' | 'partial' | 'point_in_time';
export type TargetEnvironment = 'production' | 'staging' | 'test';
export type RestoreStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type OverallHealth = 'healthy' | 'degraded' | 'critical';

// Dashboard summary
export interface RecoverySummary {
  lastBackupAt: string | null;
  lastBackupStatus: BackupStatus | null;
  totalBackups: number;
  failedBackups: number;
  rtoMinutes: number;
  rpoMinutes: number;
  servicesOperational: number;
  servicesDegraded: number;
  servicesOutage: number;
  pendingRestores: number;
  scheduledTests: number;
  lastTestPassed: boolean | null;
}
