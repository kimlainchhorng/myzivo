/**
 * Audit Logging Utilities
 * Logs security-relevant events for compliance and monitoring
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AuditAction =
  | 'admin_login'
  | 'admin_logout'
  | 'partner_config_change'
  | 'marketing_settings_change'
  | 'compliance_checklist_edit'
  | 'qa_simulator_use'
  | 'rate_limit_triggered'
  | 'suspicious_activity'
  | 'captcha_failed'
  | 'admin_2fa_enabled'
  | 'admin_2fa_disabled'
  | 'security_settings_change'
  | 'user_role_change'
  | 'seller_of_travel_status_change';

export type AuditEntityType = 
  | 'user'
  | 'partner'
  | 'marketing'
  | 'compliance'
  | 'security'
  | 'rate_limit'
  | 'qa';

interface AuditLogData {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  oldValues?: Json;
  newValues?: Json;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

/**
 * Log a critical event - logs to DB and triggers admin notification
 */
export async function logCriticalEvent(
  action: AuditAction,
  entityType: AuditEntityType,
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Log the audit event
  await logAuditEvent({
    action,
    entityType,
    severity: 'critical',
    newValues: { description, ...metadata },
  });

  // Trigger admin notification
  try {
    await supabase.functions.invoke('send-notification', {
      body: {
        title: `🚨 Critical: ${action}`,
        body: description,
        priority: 'critical',
        event_type: action,
      },
    });
  } catch (e) {
    console.error('[AuditLog] Failed to send critical alert:', e);
  }
}

/**
 * Log an audit event
 */
export async function logAuditEvent(data: AuditLogData): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get client info (without exposing too much)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    
    const { error } = await supabase.from('audit_logs').insert([{
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId || null,
      user_id: user?.id || null,
      old_values: data.oldValues || null,
      new_values: data.newValues || null,
      user_agent: userAgent,
      // IP address will be captured server-side if needed
    }]);

    if (error) {
      console.error('[AuditLog] Failed to log event:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[AuditLog] Exception logging event:', e);
    return false;
  }
}

/**
 * Log admin login
 */
export async function logAdminLogin(): Promise<void> {
  await logAuditEvent({
    action: 'admin_login',
    entityType: 'user',
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log admin logout
 */
export async function logAdminLogout(): Promise<void> {
  await logAuditEvent({
    action: 'admin_logout',
    entityType: 'user',
    metadata: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log partner config change
 */
export async function logPartnerConfigChange(
  partnerId: string,
  oldConfig: Json,
  newConfig: Json
): Promise<void> {
  await logAuditEvent({
    action: 'partner_config_change',
    entityType: 'partner',
    entityId: partnerId,
    oldValues: oldConfig,
    newValues: newConfig,
  });
}

/**
 * Log security settings change
 */
export async function logSecuritySettingsChange(
  oldSettings: Json,
  newSettings: Json
): Promise<void> {
  await logAuditEvent({
    action: 'security_settings_change',
    entityType: 'security',
    oldValues: oldSettings,
    newValues: newSettings,
  });
}

/**
 * Log rate limit event
 */
export async function logRateLimitEvent(
  action: string,
  blocked: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action: 'rate_limit_triggered',
    entityType: 'rate_limit',
    entityId: action,
    newValues: {
      blocked,
      ...metadata,
    },
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  reason: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action: 'suspicious_activity',
    entityType: 'security',
    newValues: {
      reason,
      ...metadata,
    },
  });
}

/**
 * Fetch audit logs with filtering
 */
export async function fetchAuditLogs(options: {
  action?: AuditAction;
  entityType?: AuditEntityType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options.action) {
      query = query.eq('action', options.action);
    }
    if (options.entityType) {
      query = query.eq('entity_type', options.entityType);
    }
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    if (options.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }
    if (options.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

    query = query.range(
      options.offset || 0,
      (options.offset || 0) + (options.limit || 50) - 1
    );

    const { data, count, error } = await query;

    if (error) {
      console.error('[AuditLog] Failed to fetch logs:', error);
      return { logs: [], total: 0 };
    }

    return {
      logs: (data || []) as AuditLogEntry[],
      total: count || 0,
    };
  } catch (e) {
    console.error('[AuditLog] Exception fetching logs:', e);
    return { logs: [], total: 0 };
  }
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
