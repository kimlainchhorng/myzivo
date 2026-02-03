/**
 * Operations Playbook Dashboard
 * Daily/weekly checklists, incidents, knowledge base, and team roles
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ClipboardCheck, AlertTriangle, BookOpen, Users, RefreshCw,
  CheckCircle, Clock, Zap, Shield, CreditCard, Headphones,
  Plus, Search, Calendar, TrendingUp, AlertCircle, FileText,
  ChevronRight, Inbox
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useTodayChecklist,
  useUpdateChecklistItem,
  useIncidents,
  useCreateIncident,
  useUpdateIncident,
  useKnowledgeBase,
  useTeamRoles,
  useOperationsMetrics,
  type IncidentLog,
  type ChecklistItem,
} from "@/hooks/useOperationsPlaybook";

const incidentTypes = [
  { value: 'payment_booking_failed', label: 'Payment Charged, Booking Failed' },
  { value: 'provider_outage', label: 'Provider API Outage' },
  { value: 'fraud_spike', label: 'Fraud Spike' },
  { value: 'email_failure', label: 'Email Delivery Failure' },
  { value: 'api_error', label: 'API Error' },
  { value: 'security_breach', label: 'Security Breach' },
  { value: 'other', label: 'Other' },
];

const kbCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'booking_issues', label: 'Booking Issues' },
  { value: 'cancellation_rules', label: 'Cancellation Rules' },
  { value: 'refund_timing', label: 'Refund Timing' },
  { value: 'provider_errors', label: 'Provider Errors' },
  { value: 'escalation_contacts', label: 'Escalation Contacts' },
  { value: 'customer_communication', label: 'Customer Communication' },
  { value: 'fraud_handling', label: 'Fraud Handling' },
  { value: 'payment_issues', label: 'Payment Issues' },
];

export default function OperationsPlaybook() {
  const [activeTab, setActiveTab] = useState("checklists");
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [incidentFilter, setIncidentFilter] = useState({ status: 'all', severity: 'all' });
  const [kbCategory, setKbCategory] = useState('all');
  const [kbSearch, setKbSearch] = useState('');

  // Data queries
  const { data: dailyChecklist, isLoading: dailyLoading } = useTodayChecklist('daily');
  const { data: weeklyChecklist, isLoading: weeklyLoading } = useTodayChecklist('weekly');
  const { data: incidents } = useIncidents(incidentFilter);
  const { data: kbArticles } = useKnowledgeBase(kbCategory);
  const { data: teamRoles } = useTeamRoles();
  const { data: metrics } = useOperationsMetrics();

  // Mutations
  const updateChecklistItem = useUpdateChecklistItem();
  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident();

  // Calculate checklist progress
  const dailyProgress = dailyChecklist?.items 
    ? (dailyChecklist.items.filter(i => i.completed).length / dailyChecklist.items.length) * 100 
    : 0;
  const weeklyProgress = weeklyChecklist?.items 
    ? (weeklyChecklist.items.filter(i => i.completed).length / weeklyChecklist.items.length) * 100 
    : 0;

  // Active incidents count
  const activeIncidents = incidents?.filter(i => !['resolved', 'closed'].includes(i.status)) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10">
            <ClipboardCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Operations Playbook</h1>
            <p className="text-muted-foreground">Daily workflows, incidents & knowledge base</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewIncident(true)}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Log Incident
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Bookings</p>
                <p className="text-xl font-bold">{metrics?.todayBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-xl font-bold">{metrics?.failedBookings || 0} ({metrics?.failedRate}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Headphones className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-xl font-bold">{metrics?.openTickets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Zap className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-xl font-bold">{metrics?.urgentTickets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <AlertTriangle className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-xl font-bold">{metrics?.openIncidents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Progress</p>
                <p className="text-xl font-bold">{Math.round(dailyProgress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="checklists" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Checklists
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Incidents
            {activeIncidents.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeIncidents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="w-4 h-4" />
            Team Roles
          </TabsTrigger>
        </TabsList>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Checklist */}
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Daily Operations Checklist
                    </CardTitle>
                    <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
                  </div>
                  <Badge variant={dailyProgress === 100 ? "default" : "secondary"}>
                    {Math.round(dailyProgress)}% Complete
                  </Badge>
                </div>
                <Progress value={dailyProgress} className="h-2" />
              </CardHeader>
              <CardContent>
                {dailyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailyChecklist?.items.map((item: ChecklistItem) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        checklistId={dailyChecklist.id}
                        onToggle={(completed) => 
                          updateChecklistItem.mutate({ 
                            checklistId: dailyChecklist.id, 
                            itemId: item.id, 
                            completed 
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Checklist */}
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      Weekly Review Checklist
                    </CardTitle>
                    <CardDescription>Week of {format(new Date(), 'MMM d, yyyy')}</CardDescription>
                  </div>
                  <Badge variant={weeklyProgress === 100 ? "default" : "secondary"}>
                    {Math.round(weeklyProgress)}% Complete
                  </Badge>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
              </CardHeader>
              <CardContent>
                {weeklyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weeklyChecklist?.items.map((item: ChecklistItem) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        checklistId={weeklyChecklist.id}
                        onToggle={(completed) => 
                          updateChecklistItem.mutate({ 
                            checklistId: weeklyChecklist.id, 
                            itemId: item.id, 
                            completed 
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="mt-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle>Incident Log</CardTitle>
                  <CardDescription>Track and manage operational incidents</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={incidentFilter.status} onValueChange={(v) => setIncidentFilter(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="mitigating">Mitigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={incidentFilter.severity} onValueChange={(v) => setIncidentFilter(f => ({ ...f, severity: v }))}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!incidents?.length ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No incidents logged</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incidents.map(incident => (
                    <IncidentCard key={incident.id} incident={incident} onUpdate={updateIncident.mutate} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="mt-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle>Internal Knowledge Base</CardTitle>
                  <CardDescription>Documentation for common issues and procedures</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={kbSearch}
                      onChange={(e) => setKbSearch(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select value={kbCategory} onValueChange={setKbCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {kbCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!kbArticles?.length ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No articles found</p>
                  <p className="text-sm text-muted-foreground mt-1">Create knowledge base articles to help your team</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {kbArticles
                    .filter(a => !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase()))
                    .map(article => (
                    <Card key={article.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm">{article.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <span>{article.view_count} views</span>
                          <Button variant="ghost" size="sm" className="h-6 text-xs">
                            Read More
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Roles Tab */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {teamRoles?.map(role => (
              <Card key={role.id} className="border-0 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {role.role_name === 'operations' && <ClipboardCheck className="w-5 h-5 text-blue-500" />}
                    {role.role_name === 'support' && <Headphones className="w-5 h-5 text-emerald-500" />}
                    {role.role_name === 'finance' && <CreditCard className="w-5 h-5 text-amber-500" />}
                    {role.role_name === 'admin' && <Shield className="w-5 h-5 text-purple-500" />}
                    {role.role_name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Responsibilities</h4>
                      <ul className="space-y-1">
                        {role.responsibilities.map((resp, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-primary" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {role.escalation_path && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Escalation Path</h4>
                        <p className="text-sm text-muted-foreground">{role.escalation_path}</p>
                      </div>
                    )}

                    {Object.keys(role.sla_targets).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">SLA Targets</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(role.sla_targets).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key.replace(/_/g, ' ')}: {value}h
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Incident Dialog */}
      <NewIncidentDialog 
        open={showNewIncident} 
        onOpenChange={setShowNewIncident}
        onCreate={createIncident.mutate}
        isLoading={createIncident.isPending}
      />
    </div>
  );
}

// Checklist Item Row
function ChecklistItemRow({ 
  item, 
  checklistId,
  onToggle 
}: { 
  item: ChecklistItem; 
  checklistId: string;
  onToggle: (completed: boolean) => void;
}) {
  const categoryIcons: Record<string, React.ReactNode> = {
    operations: <ClipboardCheck className="w-4 h-4 text-blue-500" />,
    security: <Shield className="w-4 h-4 text-red-500" />,
    support: <Headphones className="w-4 h-4 text-emerald-500" />,
    finance: <CreditCard className="w-4 h-4 text-amber-500" />,
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
      item.completed 
        ? "bg-emerald-500/5 border-emerald-500/20" 
        : "bg-background/50 border-border/50 hover:border-primary/30"
    )}>
      <Checkbox 
        checked={item.completed}
        onCheckedChange={(checked) => onToggle(checked as boolean)}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {categoryIcons[item.category] || <FileText className="w-4 h-4" />}
          <span className={cn(
            "text-sm font-medium",
            item.completed && "line-through text-muted-foreground"
          )}>
            {item.label}
          </span>
        </div>
      </div>
      {item.completed && item.completedAt && (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })}
        </span>
      )}
    </div>
  );
}

// Incident Card
function IncidentCard({ 
  incident, 
  onUpdate 
}: { 
  incident: IncidentLog; 
  onUpdate: (data: { id: string; updates: Partial<IncidentLog> }) => void;
}) {
  const severityColors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-500 border-red-500/30",
    high: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };

  const statusColors: Record<string, string> = {
    open: "bg-red-500/10 text-red-500",
    investigating: "bg-amber-500/10 text-amber-500",
    mitigating: "bg-blue-500/10 text-blue-500",
    resolved: "bg-emerald-500/10 text-emerald-500",
    closed: "bg-muted text-muted-foreground",
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      incident.severity === 'critical' && "border-red-500/30 bg-red-500/5"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className={severityColors[incident.severity]}>
              {incident.severity}
            </Badge>
            <Badge variant="outline" className={statusColors[incident.status]}>
              {incident.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-medium">{incident.title}</h3>
          {incident.description && (
            <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {incident.affected_bookings > 0 && (
              <span>{incident.affected_bookings} bookings affected</span>
            )}
            {incident.affected_users > 0 && (
              <span>{incident.affected_users} users affected</span>
            )}
          </div>
        </div>
        <Select 
          value={incident.status} 
          onValueChange={(status) => onUpdate({ id: incident.id, updates: { status: status as any } })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="mitigating">Mitigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// New Incident Dialog
function NewIncidentDialog({ 
  open, 
  onOpenChange, 
  onCreate,
  isLoading 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    incident_type: 'other',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'open' as 'open',
    title: '',
    description: '',
    affected_bookings: 0,
    affected_users: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
    onOpenChange(false);
    setForm({
      incident_type: 'other',
      severity: 'medium',
      status: 'open',
      title: '',
      description: '',
      affected_bookings: 0,
      affected_users: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Log New Incident
          </DialogTitle>
          <DialogDescription>
            Document an operational incident for tracking and resolution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Incident Type</Label>
              <Select value={form.incident_type} onValueChange={(v) => setForm(f => ({ ...f, incident_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v: any) => setForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detailed description, symptoms, and initial observations..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Affected Bookings</Label>
              <Input 
                type="number"
                value={form.affected_bookings}
                onChange={(e) => setForm(f => ({ ...f, affected_bookings: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Affected Users</Label>
              <Input 
                type="number"
                value={form.affected_users}
                onChange={(e) => setForm(f => ({ ...f, affected_users: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.title.trim() || isLoading}>
              Log Incident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
