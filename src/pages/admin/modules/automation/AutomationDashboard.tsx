/**
 * ZIVO Automation Engine Dashboard
 * Manage automation rules, scheduled jobs, alerts, and safety locks
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Calendar, 
  Shield, 
  AlertTriangle, 
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Activity,
  Bot,
  Settings,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import {
  useAutomationRules,
  useToggleRule,
  useAutomationLogs,
  useAutomationJobs,
  useToggleJob,
  useSafetyLocks,
  useUnlockSafetyLock,
  useAutomationAlerts,
  useAcknowledgeAlert,
  useResolveAlert,
  useAutomationOverrides,
  useAutomationMetrics,
  type AutomationRule,
  type AutomationAlert,
  type SafetyLock,
} from '@/hooks/useAutomationEngine';

const categoryIcons: Record<string, typeof Zap> = {
  booking: Calendar,
  payment: Activity,
  cancellation: XCircle,
  support: Bot,
  safety: Shield,
  alert: AlertTriangle,
};

const categoryColors: Record<string, string> = {
  booking: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  payment: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  cancellation: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  support: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
  safety: 'bg-red-500/10 text-red-600 border-red-500/30',
  alert: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
};

export default function AutomationDashboard() {
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AutomationAlert | null>(null);
  const [selectedLock, setSelectedLock] = useState<SafetyLock | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');

  const { data: rules, isLoading: loadingRules } = useAutomationRules();
  const { data: logs } = useAutomationLogs(50);
  const { data: jobs } = useAutomationJobs();
  const { data: alerts } = useAutomationAlerts(true);
  const { data: locks } = useSafetyLocks(true);
  const { data: overrides } = useAutomationOverrides();
  const metrics = useAutomationMetrics();

  const toggleRule = useToggleRule();
  const toggleJob = useToggleJob();
  const unlockSafety = useUnlockSafetyLock();
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  const handleUnlock = () => {
    if (!selectedLock || !unlockReason.trim()) return;
    unlockSafety.mutate({ id: selectedLock.id, reason: unlockReason }, {
      onSuccess: () => {
        setSelectedLock(null);
        setUnlockReason('');
      },
    });
  };

  const handleResolve = () => {
    if (!selectedAlert || !resolveNotes.trim()) return;
    resolveAlert.mutate({ id: selectedAlert.id, notes: resolveNotes }, {
      onSuccess: () => {
        setSelectedAlert(null);
        setResolveNotes('');
      },
    });
  };

  if (loadingRules) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Automation Engine
          </h1>
          <p className="text-muted-foreground">Automate bookings, payments, support, and safety operations</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{metrics.enabledRules}</div>
            <p className="text-xs text-muted-foreground">Active Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{metrics.enabledJobs}</div>
            <p className="text-xs text-muted-foreground">Scheduled Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{metrics.executionsToday}</div>
            <p className="text-xs text-muted-foreground">Runs Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={cn("text-3xl font-bold", metrics.criticalAlerts > 0 && "text-red-500")}>
              {metrics.activeAlerts}
            </div>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{metrics.activeLocks}</div>
            <p className="text-xs text-muted-foreground">Safety Locks</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="jobs">Scheduled Jobs</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {metrics.criticalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {metrics.criticalAlerts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="safety">Safety Locks</TabsTrigger>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
        </TabsList>

        {/* Automation Rules */}
        <TabsContent value="rules" className="space-y-4">
          {Object.keys(categoryIcons).map(category => {
            const categoryRules = rules?.filter(r => r.category === category) || [];
            if (categoryRules.length === 0) return null;
            
            const Icon = categoryIcons[category];
            const colorClass = categoryColors[category];
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg capitalize">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {category} Automations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categoryRules.map(rule => (
                    <div
                      key={rule.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        rule.is_enabled ? "bg-background" : "bg-muted/50 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={rule.is_enabled}
                          onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, isEnabled: checked })}
                        />
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {rule.trigger_type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {rule.action_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRule(rule)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{selectedRule?.name}</DialogTitle>
                            <DialogDescription>{selectedRule?.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Trigger Configuration</h5>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {JSON.stringify(selectedRule?.trigger_config, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Action Configuration</h5>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {JSON.stringify(selectedRule?.action_config, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Conditions</h5>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {JSON.stringify(selectedRule?.conditions, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Scheduled Jobs */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Jobs
              </CardTitle>
              <CardDescription>Automated background tasks running on a schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs?.map(job => (
                <div
                  key={job.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    job.is_enabled ? "bg-background" : "bg-muted/50 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={job.is_enabled}
                      onCheckedChange={(checked) => toggleJob.mutate({ id: job.id, isEnabled: checked })}
                    />
                    <div>
                      <h4 className="font-medium">{job.name}</h4>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{job.cron_expression}</span>
                        {job.last_run_at && (
                          <>
                            <span>•</span>
                            <span>Last run: {formatDistanceToNow(new Date(job.last_run_at), { addSuffix: true })}</span>
                          </>
                        )}
                        {job.last_run_status && (
                          <Badge 
                            variant={job.last_run_status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {job.last_run_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Play className="w-4 h-4 mr-1" />
                    Run Now
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Execution Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Execution Logs
              </CardTitle>
              <CardDescription>Recent automation executions and decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {logs && logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs.map(log => (
                      <div
                        key={log.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border text-sm",
                          log.decision === 'executed' && "border-emerald-500/30 bg-emerald-500/5",
                          log.decision === 'failed' && "border-red-500/30 bg-red-500/5",
                          log.decision === 'skipped' && "border-muted",
                          log.decision === 'escalated' && "border-amber-500/30 bg-amber-500/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {log.decision === 'executed' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {log.decision === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                          {log.decision === 'skipped' && <Clock className="w-4 h-4 text-muted-foreground" />}
                          {log.decision === 'escalated' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          <div>
                            <span className="font-medium">{log.rule_name || 'Unknown Rule'}</span>
                            {log.entity_type && log.entity_id && (
                              <span className="text-muted-foreground ml-2">
                                ({log.entity_type}: {log.entity_id.slice(0, 8)}...)
                              </span>
                            )}
                            {log.decision_reason && (
                              <p className="text-xs text-muted-foreground mt-0.5">{log.decision_reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{format(new Date(log.created_at), 'MMM d, HH:mm:ss')}</div>
                          {log.execution_time_ms && <div>{log.execution_time_ms}ms</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No execution logs yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Active Alerts
              </CardTitle>
              <CardDescription>System alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        alert.severity === 'critical' && "border-red-500/50 bg-red-500/10",
                        alert.severity === 'warning' && "border-amber-500/50 bg-amber-500/10",
                        alert.severity === 'info' && "border-sky-500/50 bg-sky-500/10"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                            <h4 className="font-medium">{alert.title}</h4>
                          </div>
                          {alert.description && (
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.is_acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert.mutate(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedAlert(alert)}
                              >
                                Resolve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Resolve Alert</DialogTitle>
                                <DialogDescription>{selectedAlert?.title}</DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Textarea
                                  value={resolveNotes}
                                  onChange={(e) => setResolveNotes(e.target.value)}
                                  placeholder="Resolution notes..."
                                  rows={3}
                                />
                              </div>
                              <DialogFooter>
                                <Button onClick={handleResolve} disabled={!resolveNotes.trim()}>
                                  Resolve Alert
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                  <p>No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Locks */}
        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Safety Locks
              </CardTitle>
              <CardDescription>Accounts, IPs, and devices locked for safety</CardDescription>
            </CardHeader>
            <CardContent>
              {locks && locks.length > 0 ? (
                <div className="space-y-3">
                  {locks.map(lock => (
                    <div
                      key={lock.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        lock.severity === 'critical' && "border-red-500/50 bg-red-500/5",
                        lock.severity === 'high' && "border-orange-500/50 bg-orange-500/5",
                        lock.severity === 'medium' && "border-amber-500/50 bg-amber-500/5",
                        lock.severity === 'low' && "border-muted"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{lock.lock_type}</Badge>
                            <span className="font-mono text-sm">{lock.target_identifier || lock.target_id.slice(0, 12)}...</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{lock.reason}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Locked {formatDistanceToNow(new Date(lock.locked_at), { addSuffix: true })}</span>
                            {lock.expires_at && (
                              <>
                                <span>•</span>
                                <span>Expires {format(new Date(lock.expires_at), 'MMM d, HH:mm')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLock(lock)}
                          >
                            <Unlock className="w-4 h-4 mr-1" />
                            Unlock
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Unlock {selectedLock?.lock_type}</DialogTitle>
                            <DialogDescription>
                              This action will be logged and requires a reason.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Textarea
                              value={unlockReason}
                              onChange={(e) => setUnlockReason(e.target.value)}
                              placeholder="Reason for unlocking..."
                              rows={3}
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUnlock} disabled={!unlockReason.trim()}>
                              Confirm Unlock
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active safety locks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Overrides */}
        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Active Overrides
              </CardTitle>
              <CardDescription>Manual admin interventions and exceptions</CardDescription>
            </CardHeader>
            <CardContent>
              {overrides && overrides.length > 0 ? (
                <div className="space-y-3">
                  {overrides.map(override => (
                    <div
                      key={override.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{override.override_type.replace(/_/g, ' ')}</Badge>
                          <span className="font-medium">{override.action_taken}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{override.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {formatDistanceToNow(new Date(override.created_at), { addSuffix: true })}
                          {override.expires_at && ` • Expires ${format(new Date(override.expires_at), 'MMM d, HH:mm')}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active overrides</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
