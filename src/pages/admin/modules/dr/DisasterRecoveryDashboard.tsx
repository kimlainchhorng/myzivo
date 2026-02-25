/**
 * ZIVO Disaster Recovery & Business Continuity Dashboard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Database, Server, Clock, CheckCircle, XCircle, RefreshCw, Activity, Calendar, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  useBackupLogs,
  useServiceHealthStatus,
  useRecoveryTests,
  useIncidentTemplates,
  useRecoverySummary,
} from '@/hooks/useDisasterRecovery';

const serviceStatusColors: Record<string, string> = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  outage: 'bg-red-500',
  maintenance: 'bg-blue-500',
};

export default function DisasterRecoveryDashboard() {
  const { data: backups, isLoading } = useBackupLogs();
  const { data: services } = useServiceHealthStatus();
  const { data: tests } = useRecoveryTests();
  const { data: templates } = useIncidentTemplates();
  const { data: summary } = useRecoverySummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Disaster Recovery & Business Continuity
        </h1>
        <p className="text-muted-foreground">Backup, recovery, and incident management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Database className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{summary?.totalBackups || 0}</div>
            <p className="text-xs text-muted-foreground">Total Backups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <div className="text-2xl font-bold">{summary?.rpoMinutes || 60}m</div>
            <p className="text-xs text-muted-foreground">RPO Target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-sky-500" />
            <div className="text-2xl font-bold">{(summary?.rtoMinutes || 240) / 60}h</div>
            <p className="text-xs text-muted-foreground">RTO Target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Server className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
            <div className="text-2xl font-bold text-emerald-500">{summary?.servicesOperational || 0}</div>
            <p className="text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-violet-500" />
            <div className="text-2xl font-bold">{summary?.scheduledTests || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className={cn("w-6 h-6 mx-auto mb-2", summary?.lastTestPassed ? "text-emerald-500" : "text-muted-foreground")} />
            <div className="text-2xl font-bold">{summary?.lastTestPassed ? 'Passed' : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Last Test</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Service Health</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="tests">Recovery Tests</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Service Health */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5" />Service Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {services?.map(service => (
                  <div key={service.id} className={cn("p-4 rounded-lg border", service.is_paused && "opacity-60")}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("w-3 h-3 rounded-full", serviceStatusColors[service.status])} />
                      <span className="font-medium capitalize">{service.service_name}</span>
                      <Badge variant="outline" className="ml-auto capitalize">{service.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Uptime: {service.uptime_percent}%</span>
                    </div>
                    <Progress value={service.uptime_percent} className="mt-2 h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups */}
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Backup History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {backups?.length ? (
                  <div className="space-y-3">
                    {backups.map(backup => (
                      <div key={backup.id} className={cn("flex items-center justify-between p-4 rounded-lg border",
                        backup.status === 'completed' && "border-emerald-500/30",
                        backup.status === 'failed' && "border-red-500/30"
                      )}>
                        <div className="flex items-center gap-4">
                          {backup.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                          <div>
                            <span className="font-medium capitalize">{backup.backup_type} Backup</span>
                            <p className="text-sm text-muted-foreground">{format(new Date(backup.started_at), 'MMM d, yyyy HH:mm')}</p>
                          </div>
                        </div>
                        <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'}>{backup.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center py-8 text-muted-foreground">No backups yet</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Recovery Tests</CardTitle>
            </CardHeader>
            <CardContent>
              {tests?.length ? (
                <div className="space-y-3">
                  {tests.map(test => (
                    <div key={test.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <span className="font-medium">{test.test_name}</span>
                        <p className="text-sm text-muted-foreground">{test.test_type.replace(/_/g, ' ')}</p>
                      </div>
                      <Badge>{test.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center py-8 text-muted-foreground">No tests scheduled</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Communication Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templates?.length ? (
                <div className="space-y-3">
                  {templates.map(t => (
                    <div key={t.id} className="p-4 rounded-lg border hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{t.template_name}</span>
                        <Badge variant="outline">{t.incident_severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.body}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center py-8 text-muted-foreground">No templates</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
