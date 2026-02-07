/**
 * Audit Helpers
 * Client-side helpers for logging audit events
 */

import { supabase } from "@/integrations/supabase/client";

export type AuditSeverity = "info" | "warning" | "critical";

export interface LogAuditParams {
  tenantId: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit action to the tenant audit log
 */
export async function logAuditAction(params: LogAuditParams): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("log_tenant_audit", {
      p_tenant_id: params.tenantId,
      p_action: params.action,
      p_entity_type: params.entityType,
      p_entity_id: params.entityId || null,
      p_summary: params.summary,
      p_before_values: (params.before || null) as unknown as null,
      p_after_values: (params.after || null) as unknown as null,
      p_severity: params.severity || "info",
      p_metadata: (params.metadata || {}) as unknown as Record<string, never>,
    });

    if (error) {
      console.error("[Audit] Failed to log action:", error);
      return null;
    }

    return data as string;
  } catch (e) {
    console.error("[Audit] Exception logging action:", e);
    return null;
  }
}

/**
 * Admin action: Assign driver to order (with audit)
 */
export async function adminAssignDriver(
  tenantId: string,
  orderId: string,
  driverId: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_assign_driver", {
    p_tenant_id: tenantId,
    p_order_id: orderId,
    p_driver_id: driverId,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Admin action: Override order status (with audit)
 */
export async function adminOverrideOrderStatus(
  tenantId: string,
  orderId: string,
  newStatus: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_override_order_status", {
    p_tenant_id: tenantId,
    p_order_id: orderId,
    p_new_status: newStatus,
    p_reason: reason || null,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Admin action: Issue refund (with audit - critical)
 */
export async function adminIssueRefund(
  tenantId: string,
  orderId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; refundAmount?: number; error?: string }> {
  const { data, error } = await supabase.rpc("admin_issue_order_refund", {
    p_tenant_id: tenantId,
    p_order_id: orderId,
    p_amount: amount,
    p_reason: reason,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, refundAmount: (data as any)?.refund_amount };
}

/**
 * Admin action: Update member role (with audit - critical)
 */
export async function adminUpdateMemberRole(
  tenantId: string,
  membershipId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_update_member_role", {
    p_tenant_id: tenantId,
    p_membership_id: membershipId,
    p_new_role: newRole,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Export audit logs to CSV format
 */
export function exportAuditLogsToCSV(
  logs: Array<{
    created_at: string;
    severity: string;
    actor_role: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    summary: string;
  }>
): string {
  const headers = ["Timestamp", "Severity", "Actor Role", "Action", "Entity Type", "Entity ID", "Summary"];
  const rows = logs.map((log) => [
    log.created_at,
    log.severity,
    log.actor_role || "Unknown",
    log.action,
    log.entity_type,
    log.entity_id || "",
    log.summary.replace(/"/g, '""'), // Escape quotes
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
}

/**
 * Download a string as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
