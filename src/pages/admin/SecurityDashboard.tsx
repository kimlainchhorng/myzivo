/**
 * Admin Security Dashboard
 * Enterprise security monitoring, incident management, and compliance exports
 */
import { useState } from "react";
import { 
  Shield, AlertTriangle, Eye, Download, Clock, Users, 
  FileText, Lock, Activity, ChevronRight, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Info
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useSecurityStats,
  useSecurityIncidents,
  useFailedLoginAttempts,
  usePIIAccessLogs,
  useAuditLogs,
  useDataRetentionPolicies,
  useComplianceExports,
  useCreateSecurityIncident,
  useUpdateSecurityIncident,
  useRequestComplianceExport,
} from "@/hooks/useEnterpriseSecurity";
import type { IncidentSeverity, IncidentStatus, SecurityIncident } from "@/types/security";

const severityColors: Record<IncidentSeverity, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-amber-500 text-black",
  low: "bg-blue-500 text-white",
  info: "bg-gray-500 text-white",
};

const statusColors: Record<IncidentStatus, string> = {
  detected: "bg-red-500/10 text-red-500 border-red-500/20",
  investigating: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  contained: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  false_positive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const SecurityDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [incidentFilter, setIncidentFilter] = useState<IncidentStatus | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSecurityStats();
  const { data: incidents } = useSecurityIncidents({
    status: incidentFilter === "all" ? undefined : incidentFilter,
    limit: 50,
  });
  const { data: failedLogins } = useFailedLoginAttempts(50);
  const { data: piiLogs } = usePIIAccessLogs({ limit: 50 });
  const { data: auditLogs } = useAuditLogs({ limit: 100 });
  const { data: retentionPolicies } = useDataRetentionPolicies();
  const { data: exports } = useComplianceExports();

  const createIncident = useCreateSecurityIncident();
  const updateIncident = useUpdateSecurityIncident();
  const requestExport = useRequestComplianceExport();

  const handleCreateIncident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createIncident.mutateAsync({
      incident_type: formData.get("incident_type") as any,
      severity: formData.get("severity") as IncidentSeverity,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      detection_method: "manual",
    });
    
    setIsCreateDialogOpen(false);
  };

  const handleRequestExport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await requestExport.mutateAsync({
      export_type: formData.get("export_type") as any,
      date_range_start: formData.get("date_start") as string || undefined,
      date_range_end: formData.get("date_end") as string || undefined,
    });
    
    setIsExportDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">
              Enterprise security monitoring and compliance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchStats()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleRequestExport}>
                  <DialogHeader>
                    <DialogTitle>Request Compliance Export</DialogTitle>
                    <DialogDescription>
                      Generate a compliance-ready export for audits
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="export_type">Export Type</Label>
                      <Select name="export_type" defaultValue="soc2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soc2">SOC 2 Audit</SelectItem>
                          <SelectItem value="financial_audit">Financial Audit</SelectItem>
                          <SelectItem value="partner_compliance">Partner Compliance</SelectItem>
                          <SelectItem value="gdpr_dsar">GDPR DSAR</SelectItem>
                          <SelectItem value="incident_report">Incident Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date_start">Start Date</Label>
                        <Input type="date" name="date_start" />
                      </div>
                      <div>
                        <Label htmlFor="date_end">End Date</Label>
                        <Input type="date" name="date_end" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={requestExport.isPending}>
                      Request Export
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Open Incidents</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats?.openIncidents || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Critical</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats?.criticalIncidents || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Failed Logins (24h)</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats?.failedLogins24h || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">PII Access (24h)</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats?.piiAccessCount24h || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Total Incidents</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats?.totalIncidents || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-500" />
                <span className="text-sm text-muted-foreground">Pending Exports</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats?.pendingExports || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="pii">PII Access</TabsTrigger>
            <TabsTrigger value="retention">Data Retention</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Recent Incidents */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Recent Incidents
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Report Incident
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleCreateIncident}>
                          <DialogHeader>
                            <DialogTitle>Report Security Incident</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input name="title" placeholder="Brief incident description" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="incident_type">Type</Label>
                                <Select name="incident_type" defaultValue="suspicious_activity">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="breach">Data Breach</SelectItem>
                                    <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                                    <SelectItem value="account_takeover">Account Takeover</SelectItem>
                                    <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                                    <SelectItem value="policy_violation">Policy Violation</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="severity">Severity</Label>
                                <Select name="severity" defaultValue="medium">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea name="description" placeholder="Detailed description of the incident" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={createIncident.isPending}>
                              Create Incident
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {incidents?.slice(0, 5).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Badge className={severityColors[incident.severity]}>
                            {incident.severity}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{incident.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(incident.detected_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusColors[incident.status]}>
                          {incident.status}
                        </Badge>
                      </div>
                    ))}
                    {(!incidents || incidents.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p>No open incidents</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Failed Login Attempts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Failed Login Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {failedLogins?.slice(0, 10).map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-sm">{attempt.email || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            IP: {attempt.ip_address}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-red-500/10 text-red-500">
                            {attempt.attempt_count}x
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(attempt.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!failedLogins || failedLogins.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p>No recent failed logins</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Recent Audit Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {auditLogs?.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.entity_type} {log.entity_id ? `#${log.entity_id.slice(0, 8)}` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={incidentFilter} onValueChange={(v) => setIncidentFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="detected">Detected</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="contained">Contained</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {incidents?.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} onUpdate={updateIncident.mutate} />
              ))}
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardContent className="pt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {auditLogs?.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm text-muted-foreground">{log.entity_type}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "PPp")}
                          </span>
                        </div>
                        {log.entity_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Entity ID: {log.entity_id}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PII Access Tab */}
          <TabsContent value="pii">
            <Card>
              <CardHeader>
                <CardTitle>PII Access Log</CardTitle>
                <CardDescription>Track who accessed sensitive personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {piiLogs?.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-muted/30 border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <Badge variant="outline">{log.data_type}</Badge>
                            <span className="text-sm">{log.access_purpose}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.accessed_at), "PPp")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Accessor: {log.accessor_role} | Subject: {log.data_subject_id?.slice(0, 8) || "N/A"}
                        </p>
                      </div>
                    ))}
                    {(!piiLogs || piiLogs.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="w-8 h-8 mx-auto mb-2" />
                        <p>No PII access logs recorded</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="retention">
            <Card>
              <CardHeader>
                <CardTitle>Data Retention Policies</CardTitle>
                <CardDescription>Manage how long data is retained across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {retentionPolicies?.map((policy) => (
                    <div key={policy.id} className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                      <div>
                        <h4 className="font-medium capitalize">{policy.entity_type.replace(/_/g, " ")}</h4>
                        <p className="text-sm text-muted-foreground">{policy.legal_basis}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium">{policy.retention_days}</span> days retention
                        </p>
                        {policy.delete_after_days && (
                          <p className="text-xs text-muted-foreground">
                            Delete after {policy.delete_after_days} days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Exports</CardTitle>
                <CardDescription>Request and download compliance-ready data exports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exports?.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium capitalize">{exp.export_type.replace(/_/g, " ")}</h4>
                          <p className="text-xs text-muted-foreground">
                            Requested {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          exp.status === "completed" && "bg-green-500/10 text-green-500",
                          exp.status === "pending" && "bg-amber-500/10 text-amber-500",
                          exp.status === "processing" && "bg-blue-500/10 text-blue-500",
                          exp.status === "failed" && "bg-red-500/10 text-red-500",
                        )}>
                          {exp.status}
                        </Badge>
                        {exp.file_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={exp.file_url} download>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!exports || exports.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No exports requested yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Incident Card Component
const IncidentCard = ({ 
  incident, 
  onUpdate 
}: { 
  incident: SecurityIncident; 
  onUpdate: (params: any) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn(
      incident.severity === "critical" && "border-red-500/50",
      incident.severity === "high" && "border-orange-500/50",
    )}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Badge className={severityColors[incident.severity]}>
              {incident.severity}
            </Badge>
            <div>
              <h3 className="font-medium">{incident.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {incident.description || "No description provided"}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(incident.detected_at), { addSuffix: true })}
                </span>
                {incident.affected_users_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {incident.affected_users_count} affected
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[incident.status]}>
              {incident.status}
            </Badge>
            {incident.status !== "closed" && incident.status !== "resolved" && (
              <Select 
                onValueChange={(status) => onUpdate({ id: incident.id, status })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="contained">Contained</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;
