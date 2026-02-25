/**
 * ZIVO Admin Recovery Dashboard
 * Disaster Recovery & Business Continuity Controls
 */

import { useState } from "react";
import {
  Database,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Pause,
  RotateCcw,
  Download,
  Calendar,
  Server,
  HardDrive,
  FileText,
  Mail,
  Bell,
  Settings,
  RefreshCw,
  ChevronRight,
  Timer,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useRecoverySummary,
  useBackupLogs,
  useTriggerBackup,
  useServiceHealthStatus,
  useUpdateServiceStatus,
  useRecoveryTests,
  useIncidentTemplates,
  useRestoreOperations,
  useApproveRestore,
  useDRConfiguration,
} from "@/hooks/useDisasterRecovery";
import { formatDistanceToNow, format } from "date-fns";
import { BackupLog, ServiceHealthStatus, RecoveryTest, IncidentTemplate, RestoreOperation } from "@/types/recovery";

const STATUS_COLORS = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  outage: "bg-red-500",
  maintenance: "bg-blue-500",
};

const BACKUP_STATUS_COLORS = {
  pending: "bg-gray-500/10 text-gray-600",
  in_progress: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-red-500/10 text-red-600",
};

export default function RecoveryDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceHealthStatus | null>(null);
  const [pauseReason, setPauseReason] = useState("");

  const { data: summary, isLoading: summaryLoading } = useRecoverySummary();
  const { data: backups } = useBackupLogs();
  const { data: services } = useServiceHealthStatus();
  const { data: tests } = useRecoveryTests();
  const { data: templates } = useIncidentTemplates();
  const { data: restores } = useRestoreOperations();
  const { data: drConfig } = useDRConfiguration();
  
  const triggerBackup = useTriggerBackup();
  const updateService = useUpdateServiceStatus();
  const approveRestore = useApproveRestore();

  const handleTriggerBackup = () => {
    triggerBackup.mutate({ backupType: "manual", backupTarget: "all" });
  };

  const handleToggleService = (service: ServiceHealthStatus) => {
    if (service.is_paused) {
      updateService.mutate({
        serviceName: service.service_name,
        isPaused: false,
      });
    } else {
      setSelectedService(service);
      setPauseDialogOpen(true);
    }
  };

  const handleConfirmPause = () => {
    if (selectedService) {
      updateService.mutate({
        serviceName: selectedService.service_name,
        isPaused: true,
        pausedReason: pauseReason,
      });
      setPauseDialogOpen(false);
      setPauseReason("");
      setSelectedService(null);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Disaster Recovery
          </h1>
          <p className="text-muted-foreground mt-1">
            Backup management, service health, and business continuity controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export DR Plan
          </Button>
          <Button onClick={handleTriggerBackup} disabled={triggerBackup.isPending} className="gap-2">
            <Database className="w-4 h-4" />
            {triggerBackup.isPending ? "Starting..." : "Manual Backup"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.lastBackupAt
                ? formatDistanceToNow(new Date(summary.lastBackupAt), { addSuffix: true })
                : "Never"}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {summary?.lastBackupStatus === "completed" ? (
                <Badge className="bg-emerald-500/10 text-emerald-600">Completed</Badge>
              ) : summary?.lastBackupStatus === "failed" ? (
                <Badge className="bg-red-500/10 text-red-600">Failed</Badge>
              ) : (
                <Badge className="bg-blue-500/10 text-blue-600">In Progress</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recovery Objectives</CardTitle>
            <Timer className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">RTO</p>
                <p className="text-xl font-bold">{summary?.rtoMinutes || 240} min</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">RPO</p>
                <p className="text-xl font-bold">{summary?.rpoMinutes || 60} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Service Health</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-lg font-bold">{summary?.servicesOperational || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-lg font-bold">{summary?.servicesDegraded || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-lg font-bold">{summary?.servicesOutage || 0}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.servicesOperational} operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recovery Tests</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.scheduledTests || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">scheduled</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last test: {summary?.lastTestPassed === true
                ? "Passed ✓"
                : summary?.lastTestPassed === false
                ? "Failed ✗"
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Shield className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="backups" className="gap-2">
            <Database className="w-4 h-4" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Server className="w-4 h-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="restores" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restores
            {(summary?.pendingRestores || 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                {summary?.pendingRestores}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tests" className="gap-2">
            <PlayCircle className="w-4 h-4" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* DR Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Disaster Recovery Plan</CardTitle>
                <CardDescription>Current recovery objectives and procedures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Recovery Time (RTO)</p>
                    <p className="text-2xl font-bold text-primary">
                      {summary?.rtoMinutes ? `${Math.floor(summary.rtoMinutes / 60)}h ${summary.rtoMinutes % 60}m` : "4h"}
                    </p>
                    <p className="text-xs text-muted-foreground">Max downtime allowed</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Recovery Point (RPO)</p>
                    <p className="text-2xl font-bold text-primary">
                      {summary?.rpoMinutes ? `${summary.rpoMinutes}m` : "1h"}
                    </p>
                    <p className="text-xs text-muted-foreground">Max data loss allowed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Backup Schedule</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Full database backup</span>
                      <span>Daily at 02:00 UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Incremental backup</span>
                      <span>Every hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">File/document backup</span>
                      <span>Continuous</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Retention Policy</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Daily backups</span>
                      <span>30 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monthly backups</span>
                      <span>12 months</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Status Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Real-time health of all services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {services?.map((service) => (
                    <div
                      key={service.service_name}
                      className={`p-3 rounded-xl border ${
                        service.is_paused
                          ? "bg-amber-500/5 border-amber-500/30"
                          : service.status === "operational"
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : service.status === "degraded"
                          ? "bg-amber-500/5 border-amber-500/30"
                          : "bg-red-500/5 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{service.service_name}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          service.is_paused ? "bg-amber-500" : STATUS_COLORS[service.status]
                        }`} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.is_paused ? "Paused" : service.status}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Backup Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups?.slice(0, 5).map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="capitalize">{backup.backup_type}</TableCell>
                      <TableCell className="capitalize">{backup.backup_target}</TableCell>
                      <TableCell>
                        <Badge className={BACKUP_STATUS_COLORS[backup.status]}>
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(backup.size_bytes)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(backup.started_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {backup.completed_at
                          ? `${Math.round((new Date(backup.completed_at).getTime() - new Date(backup.started_at).getTime()) / 1000)}s`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backup History</CardTitle>
                  <CardDescription>All automated and manual backups</CardDescription>
                </div>
                <Button onClick={handleTriggerBackup} disabled={triggerBackup.isPending}>
                  <Database className="w-4 h-4 mr-2" />
                  Trigger Manual Backup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups?.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-mono text-xs">
                        {backup.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="capitalize">{backup.backup_type}</TableCell>
                      <TableCell className="capitalize">{backup.backup_target}</TableCell>
                      <TableCell>
                        <Badge className={BACKUP_STATUS_COLORS[backup.status]}>
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(backup.size_bytes)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {backup.storage_location || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {backup.expires_at
                          ? format(new Date(backup.expires_at), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(backup.started_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Health & Controls</CardTitle>
              <CardDescription>
                Manage service availability and failover controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead>Paused</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services?.map((service) => (
                    <TableRow key={service.service_name}>
                      <TableCell className="font-medium capitalize">
                        {service.service_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[service.status]}`} />
                          <span className="capitalize">{service.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={service.uptime_percent} className="w-16 h-2" />
                          <span className="text-sm">{service.uptime_percent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{service.incident_count}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(service.last_check_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.is_paused}
                          onCheckedChange={() => handleToggleService(service)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* User-Safe Message Preview */}
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  User-Safe Message (when services are paused)
                </h4>
                <p className="mt-2 text-muted-foreground">
                  "We're performing maintenance. Please try again shortly."
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restores Tab */}
        <TabsContent value="restores">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Restore Operations</CardTitle>
                  <CardDescription>
                    Pending and completed restore requests (Super Admin only)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {restores?.length === 0 ? (
                <div className="text-center py-12">
                  <RotateCcw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No restore operations</p>
                  <p className="text-muted-foreground">
                    Restore requests will appear here for approval
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Target Env</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Recovery Point</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restores?.map((restore) => (
                      <TableRow key={restore.id}>
                        <TableCell className="capitalize">{restore.restore_type}</TableCell>
                        <TableCell className="capitalize">{restore.target_environment}</TableCell>
                        <TableCell>
                          <Badge variant={
                            restore.status === "completed" ? "default" :
                            restore.status === "failed" ? "destructive" :
                            restore.status === "pending" ? "secondary" :
                            "outline"
                          }>
                            {restore.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(restore.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {restore.recovery_point
                            ? format(new Date(restore.recovery_point), "MMM d, HH:mm")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {restore.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveRestore.mutate({ id: restore.id, approved: false })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Deny
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveRestore.mutate({ id: restore.id, approved: true })}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recovery Tests</CardTitle>
                  <CardDescription>
                    Quarterly restore tests and validation results
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recovery Time</TableHead>
                    <TableHead>Data Loss</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests?.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.test_name}</TableCell>
                      <TableCell className="capitalize">{test.test_type.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        <Badge variant={
                          test.status === "passed" ? "default" :
                          test.status === "failed" ? "destructive" :
                          "secondary"
                        }>
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {test.recovery_time_seconds
                          ? `${Math.floor(test.recovery_time_seconds / 60)}m ${test.recovery_time_seconds % 60}s`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {test.data_loss_seconds
                          ? `${test.data_loss_seconds}s`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {test.scheduled_at
                          ? format(new Date(test.scheduled_at), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {test.issues_found?.length || 0} found
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!tests || tests.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No recovery tests scheduled yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Incident Communication Templates</CardTitle>
              <CardDescription>
                Pre-defined templates for outage notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {templates?.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.template_name}</CardTitle>
                        <Badge variant="outline" className={
                          template.incident_severity === "critical" ? "border-red-500 text-red-600" :
                          template.incident_severity === "major" ? "border-amber-500 text-amber-600" :
                          "border-blue-500 text-blue-600"
                        }>
                          {template.incident_severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.template_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {template.subject && (
                        <p className="text-sm font-medium mb-2">{template.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
                        {template.body}
                      </p>
                      {template.variables.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {template.variables.map((v) => (
                            <Badge key={v} variant="outline" className="text-xs">
                              {`{{${v}}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pause Service Dialog */}
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-amber-500" />
              Pause Service
            </DialogTitle>
            <DialogDescription>
              Pausing {selectedService?.service_name} will show users a maintenance message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for pause</Label>
              <Textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Enter the reason for pausing this service..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmPause}
              disabled={!pauseReason.trim()}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
