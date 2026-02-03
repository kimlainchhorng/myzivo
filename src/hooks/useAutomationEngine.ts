/**
 * ZIVO Automation Engine Hook
 * Manages automation rules, jobs, alerts, and safety locks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface AutomationRule {
  id: string;
  name: string;
  slug: string;
  category: 'booking' | 'payment' | 'cancellation' | 'support' | 'safety' | 'alert';
  description: string | null;
  trigger_type: 'event' | 'schedule' | 'condition';
  trigger_config: Record<string, any>;
  action_type: string;
  action_config: Record<string, any>;
  conditions: any[];
  is_enabled: boolean;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationLog {
  id: string;
  rule_id: string | null;
  rule_name: string | null;
  trigger_event: string | null;
  entity_type: string | null;
  entity_id: string | null;
  input_data: Record<string, any>;
  decision: 'executed' | 'skipped' | 'failed' | 'escalated';
  decision_reason: string | null;
  output_data: Record<string, any>;
  execution_time_ms: number | null;
  created_at: string;
}

export interface AutomationJob {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  job_type: string;
  cron_expression: string;
  is_enabled: boolean;
  last_run_at: string | null;
  last_run_status: 'success' | 'failed' | 'partial' | null;
  last_run_duration_ms: number | null;
  last_run_summary: Record<string, any>;
  next_run_at: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AutomationJobRun {
  id: string;
  job_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'success' | 'failed' | 'partial';
  items_processed: number;
  items_succeeded: number;
  items_failed: number;
  error_message: string | null;
  summary: Record<string, any>;
  created_at: string;
}

export interface SafetyLock {
  id: string;
  lock_type: 'account' | 'ip' | 'device';
  target_id: string;
  target_identifier: string | null;
  reason: string;
  triggered_by_rule_id: string | null;
  triggered_by_log_id: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  locked_at: string;
  unlocked_at: string | null;
  unlocked_by: string | null;
  unlock_reason: string | null;
  expires_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AutomationAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string | null;
  source: string | null;
  source_rule_id: string | null;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AutomationOverride {
  id: string;
  override_type: string;
  target_rule_id: string | null;
  target_entity_type: string | null;
  target_entity_id: string | null;
  action_taken: string;
  reason: string;
  performed_by: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// Fetch automation rules
export function useAutomationRules(category?: string) {
  return useQuery({
    queryKey: ['automation-rules', category],
    queryFn: async () => {
      let query = supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AutomationRule[];
    },
  });
}

// Toggle rule enabled state
export function useToggleRule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { isEnabled }) => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({ title: isEnabled ? 'Rule enabled' : 'Rule disabled' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update rule', description: error.message, variant: 'destructive' });
    },
  });
}

// Fetch automation logs
export function useAutomationLogs(limit = 50) {
  return useQuery({
    queryKey: ['automation-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AutomationLog[];
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

// Fetch scheduled jobs
export function useAutomationJobs() {
  return useQuery({
    queryKey: ['automation-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as AutomationJob[];
    },
  });
}

// Toggle job enabled state
export function useToggleJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from('automation_jobs')
        .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { isEnabled }) => {
      queryClient.invalidateQueries({ queryKey: ['automation-jobs'] });
      toast({ title: isEnabled ? 'Job enabled' : 'Job disabled' });
    },
  });
}

// Fetch job runs
export function useJobRuns(jobId: string, limit = 10) {
  return useQuery({
    queryKey: ['job-runs', jobId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_job_runs')
        .select('*')
        .eq('job_id', jobId)
        .order('started_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AutomationJobRun[];
    },
    enabled: !!jobId,
  });
}

// Fetch safety locks
export function useSafetyLocks(activeOnly = true) {
  return useQuery({
    queryKey: ['safety-locks', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('automation_safety_locks')
        .select('*')
        .order('locked_at', { ascending: false });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SafetyLock[];
    },
  });
}

// Unlock a safety lock
export function useUnlockSafetyLock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('automation_safety_locks')
        .update({
          is_active: false,
          unlocked_at: new Date().toISOString(),
          unlocked_by: user?.id,
          unlock_reason: reason,
        })
        .eq('id', id);

      if (error) throw error;

      // Log override
      await supabase.from('automation_overrides').insert({
        override_type: 'unlock_account',
        target_entity_type: 'safety_lock',
        target_entity_id: id,
        action_taken: 'Manually unlocked',
        reason,
        performed_by: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-locks'] });
      toast({ title: 'Lock removed successfully' });
    },
  });
}

// Fetch alerts
export function useAutomationAlerts(unresolvedOnly = true) {
  return useQuery({
    queryKey: ['automation-alerts', unresolvedOnly],
    queryFn: async () => {
      let query = supabase
        .from('automation_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (unresolvedOnly) {
        query = query.eq('is_resolved', false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AutomationAlert[];
    },
    refetchInterval: 15000, // Refresh every 15s
  });
}

// Acknowledge alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('automation_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-alerts'] });
      toast({ title: 'Alert acknowledged' });
    },
  });
}

// Resolve alert
export function useResolveAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('automation_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-alerts'] });
      toast({ title: 'Alert resolved' });
    },
  });
}

// Fetch overrides
export function useAutomationOverrides() {
  return useQuery({
    queryKey: ['automation-overrides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_overrides')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AutomationOverride[];
    },
  });
}

// Create override
export function useCreateOverride() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (override: {
      overrideType: string;
      targetRuleId?: string;
      targetEntityType?: string;
      targetEntityId?: string;
      actionTaken: string;
      reason: string;
      expiresAt?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('automation_overrides').insert({
        override_type: override.overrideType,
        target_rule_id: override.targetRuleId,
        target_entity_type: override.targetEntityType,
        target_entity_id: override.targetEntityId,
        action_taken: override.actionTaken,
        reason: override.reason,
        performed_by: user?.id,
        expires_at: override.expiresAt,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-overrides'] });
      toast({ title: 'Override created' });
    },
  });
}

// Automation metrics
export function useAutomationMetrics() {
  const { data: rules } = useAutomationRules();
  const { data: jobs } = useAutomationJobs();
  const { data: alerts } = useAutomationAlerts(true);
  const { data: locks } = useSafetyLocks(true);
  const { data: logs } = useAutomationLogs(100);

  const metrics = {
    totalRules: rules?.length || 0,
    enabledRules: rules?.filter(r => r.is_enabled).length || 0,
    totalJobs: jobs?.length || 0,
    enabledJobs: jobs?.filter(j => j.is_enabled).length || 0,
    activeAlerts: alerts?.length || 0,
    criticalAlerts: alerts?.filter(a => a.severity === 'critical').length || 0,
    activeLocks: locks?.length || 0,
    executionsToday: logs?.filter(l => {
      const today = new Date().toISOString().split('T')[0];
      return l.created_at.startsWith(today);
    }).length || 0,
    successRate: logs?.length
      ? Math.round((logs.filter(l => l.decision === 'executed').length / logs.length) * 100)
      : 0,
  };

  return metrics;
}
