/**
 * ZIVO Production Launch Types
 * Types for the Go-Live & Scale System
 */

// Launch phase enum
export type LaunchPhase = 'pre_launch' | 'soft_launch' | 'full_launch' | 'scaling';

// Checklist category enum
export type LaunchChecklistCategory = 
  | 'environment_switch'
  | 'booking_tests'
  | 'legal_trust'
  | 'security'
  | 'support_readiness'
  | 'monitoring_alerts'
  | 'soft_launch'
  | 'full_launch';

// Test booking status
export type TestBookingStatus = 'pending' | 'running' | 'success' | 'failed';

// Launch alert type
export type LaunchAlertType = 
  | 'booking_failure'
  | 'payment_failure'
  | 'api_outage'
  | 'fraud_spike'
  | 'refund_spike'
  | 'supplier_error'
  | 'sla_breach';

// Alert severity
export type LaunchAlertSeverity = 'info' | 'warning' | 'critical';

// Service types for test bookings
export type TestBookingServiceType = 'hotel' | 'activity' | 'transfer' | 'flight';

// Checklist item from database
export interface LaunchChecklistItem {
  id: string;
  category: LaunchChecklistCategory;
  item_key: string;
  item_title: string;
  item_description: string | null;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  is_critical: boolean;
  verification_notes: string | null;
  evidence_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Test booking record
export interface ProductionTestBooking {
  id: string;
  service_type: TestBookingServiceType;
  test_status: TestBookingStatus;
  booking_reference: string | null;
  supplier_confirmation: string | null;
  payment_captured: boolean;
  amount_cents: number | null;
  currency: string;
  email_sent: boolean;
  admin_visible: boolean;
  my_trips_visible: boolean;
  error_message: string | null;
  test_details: Record<string, unknown> | null;
  tested_by: string | null;
  tested_at: string | null;
  created_at: string;
}

// Launch phase log entry
export interface LaunchPhaseLog {
  id: string;
  phase: LaunchPhase;
  started_at: string;
  completed_at: string | null;
  started_by: string | null;
  notes: string | null;
  metrics_snapshot: Record<string, unknown> | null;
  blockers_at_start: Record<string, unknown> | null;
  created_at: string;
}

// Launch monitoring alert
export interface LaunchMonitoringAlert {
  id: string;
  alert_type: LaunchAlertType;
  severity: LaunchAlertSeverity;
  title: string;
  message: string;
  details: Record<string, unknown> | null;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

// Current launch status
export interface LaunchStatus {
  id: string;
  current_phase: LaunchPhase;
  phase_started_at: string;
  is_paused: boolean;
  pause_reason: string | null;
  paused_at: string | null;
  paused_by: string | null;
  go_live_date: string | null;
  soft_launch_started_at: string | null;
  full_launch_started_at: string | null;
  created_at: string;
  updated_at: string;
}

// Environment verification status
export interface EnvironmentVerification {
  key: string;
  name: string;
  isLive: boolean;
  configKey: string;
  verified: boolean;
}

// Post-launch metrics
export interface PostLaunchMetrics {
  bookingsToday: number;
  bookingsYesterday: number;
  revenueToday: number;
  revenueYesterday: number;
  failedBookingsToday: number;
  failedPaymentsToday: number;
  refundRate: number;
  fraudFlagsToday: number;
  daysSinceLaunch: number;
}

// Checklist category summary
export interface CategorySummary {
  category: LaunchChecklistCategory;
  label: string;
  total: number;
  verified: number;
  critical: number;
  criticalVerified: number;
  percentage: number;
}

// Launch readiness check
export interface LaunchReadiness {
  isReady: boolean;
  phase: LaunchPhase;
  blockers: LaunchChecklistItem[];
  criticalBlockers: LaunchChecklistItem[];
  categorySummaries: CategorySummary[];
  overallPercentage: number;
}
