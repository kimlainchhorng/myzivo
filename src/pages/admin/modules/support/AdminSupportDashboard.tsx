/**
 * Admin Support Dashboard
 * SLA-based ticket management with escalation flow
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Headphones, Search, Clock, CheckCircle, AlertCircle, 
  MessageSquare, RefreshCw, Zap, ArrowUp, Pause, Play,
  Send, User, Shield, Inbox, XCircle, TrendingUp, Target,
  AlertTriangle, ExternalLink, Phone, Mail
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  useAdminTickets, 
  useTicketDetails, 
  useUpdateTicket,
  useAddTicketMessage,
  useEscalateTicket,
  useToggleSLAPause,
  useSupportMetrics,
  useTicketTemplates,
  type SupportTicket 
} from "@/hooks/useSupportTickets";
import SLACountdownBadge from "@/components/support/SLACountdownBadge";
import TicketPriorityBadge from "@/components/support/TicketPriorityBadge";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";

export default function AdminSupportDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("queue");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalationTarget, setEscalationTarget] = useState<'operations' | 'finance' | 'admin' | 'supplier'>('operations');
  const [escalationReason, setEscalationReason] = useState("");

  // Queries
  const { data: tickets, isLoading, refetch } = useAdminTickets({
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
  });

  const { data: ticketDetails } = useTicketDetails(selectedTicketId || undefined);
  const { data: metrics } = useSupportMetrics();
  const { data: templates } = useTicketTemplates();

  // Mutations
  const updateTicket = useUpdateTicket();
  const addMessage = useAddTicketMessage();
  const escalateTicket = useEscalateTicket();
  const toggleSLAPause = useToggleSLAPause();

  // Filter tickets by urgency
  const urgentTickets = tickets?.filter(t => 
    t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status || '')
  ) || [];
  const slaAtRiskTickets = tickets?.filter(t => {
    if (['resolved', 'closed'].includes(t.status || '')) return false;
    const dueAt = t.sla_response_due_at || t.sla_resolution_due_at;
    if (!dueAt) return false;
    const minutesRemaining = (new Date(dueAt).getTime() - Date.now()) / 60000;
    return minutesRemaining > 0 && minutesRemaining < 60; // Less than 1 hour
  }) || [];
  const escalatedTickets = tickets?.filter(t => t.is_escalated && t.status !== 'resolved') || [];

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyMessage.trim()) return;
    
    await addMessage.mutateAsync({
      ticketId: selectedTicketId,
      message: replyMessage,
      senderType: 'agent',
    });
    setReplyMessage("");
  };

  const handleEscalate = async () => {
    if (!selectedTicketId || !escalationReason.trim()) return;
    
    await escalateTicket.mutateAsync({
      ticketId: selectedTicketId,
      target: escalationTarget,
      reason: escalationReason,
    });
    setShowEscalateDialog(false);
    setEscalationReason("");
  };

  const handleUseTemplate = (template: { body: string }) => {
    setReplyMessage(template.body);
  };

  const selectedTicket = ticketDetails?.ticket;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-sky-500/10">
            <Headphones className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Support Center</h1>
            <p className="text-muted-foreground">SLA-based ticket management & escalation</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Inbox className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-xl font-bold">{metrics?.open || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{metrics?.inProgress || 0}</p>
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
                <p className="text-xl font-bold">{metrics?.urgent || 0}</p>
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
                <p className="text-sm text-muted-foreground">SLA Breached</p>
                <p className="text-xl font-bold">{metrics?.slaBreached || 0}</p>
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
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{metrics?.resolved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <TrendingUp className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-xl font-bold">
                  {metrics?.avgFirstResponseMinutes 
                    ? `${Math.round(metrics.avgFirstResponseMinutes)}m`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(urgentTickets.length > 0 || slaAtRiskTickets.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {urgentTickets.length > 0 && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-500">
                  <Zap className="w-4 h-4" />
                  Urgent Tickets ({urgentTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {urgentTickets.slice(0, 3).map(ticket => (
                    <div 
                      key={ticket.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background/80"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div>
                        <p className="font-medium text-sm">{ticket.ticket_number}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.subject}</p>
                      </div>
                      <SLACountdownBadge
                        dueAt={ticket.sla_response_due_at || null}
                        pausedAt={ticket.sla_paused_at || null}
                        pausedMinutes={ticket.sla_paused_duration_minutes || 0}
                        isBreached={ticket.sla_response_breached || false}
                        type="response"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {slaAtRiskTickets.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="w-4 h-4" />
                  SLA At Risk ({slaAtRiskTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {slaAtRiskTickets.slice(0, 3).map(ticket => (
                    <div 
                      key={ticket.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background/80"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div>
                        <p className="font-medium text-sm">{ticket.ticket_number}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ticket.subject}</p>
                      </div>
                      <SLACountdownBadge
                        dueAt={ticket.sla_response_due_at || null}
                        pausedAt={ticket.sla_paused_at || null}
                        pausedMinutes={ticket.sla_paused_duration_minutes || 0}
                        isBreached={ticket.sla_response_breached || false}
                        type="response"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">Ticket Queue</TabsTrigger>
          <TabsTrigger value="escalated">
            Escalated
            {escalatedTickets.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {escalatedTickets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="sla">SLA Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_supplier">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Ticket</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response SLA</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Loading tickets...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !tickets?.length ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No tickets found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map(ticket => (
                        <TableRow 
                          key={ticket.id} 
                          className={cn(
                            "cursor-pointer hover:bg-muted/30",
                            ticket.is_escalated && "bg-red-500/5",
                            selectedTicketId === ticket.id && "bg-primary/5"
                          )}
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              {ticket.ticket_number}
                              {ticket.is_escalated && (
                                <Badge variant="destructive" className="text-xs">ESC</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{ticket.subject}</p>
                              <p className="text-xs text-muted-foreground capitalize">{ticket.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TicketPriorityBadge priority={ticket.priority || 'normal'} />
                          </TableCell>
                          <TableCell>
                            <TicketStatusBadge status={ticket.status || 'open'} />
                          </TableCell>
                          <TableCell>
                            <SLACountdownBadge
                              dueAt={ticket.sla_response_due_at || null}
                              pausedAt={ticket.sla_paused_at || null}
                              pausedMinutes={ticket.sla_paused_duration_minutes || 0}
                              isBreached={ticket.sla_response_breached || false}
                              type="response"
                            />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ticket.created_at && formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalated" className="mt-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-red-500" />
                Escalated Tickets
              </CardTitle>
              <CardDescription>Tickets requiring senior attention</CardDescription>
            </CardHeader>
            <CardContent>
              {escalatedTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No escalated tickets</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {escalatedTickets.map(ticket => (
                    <div 
                      key={ticket.id}
                      className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 cursor-pointer hover:bg-red-500/10"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm">{ticket.ticket_number}</span>
                            <TicketPriorityBadge priority={ticket.priority || 'normal'} />
                          </div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Reason: {ticket.escalation_reason || 'Not specified'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Escalated {ticket.escalated_at && formatDistanceToNow(new Date(ticket.escalated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
              <CardDescription>Pre-written responses for common scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {templates?.map(template => (
                  <Card key={template.id} className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      {template.category && (
                        <Badge variant="outline" className="w-fit">{template.category}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          Used {template.usage_count} times
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUseTemplate(template)}
                          disabled={!selectedTicketId}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="mt-4">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                SLA Definitions
              </CardTitle>
              <CardDescription>Response and resolution time targets by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500" />
                      Urgent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span className="font-medium">≤ 1 hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="font-medium">≤ 24 hours</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Payment charged, no booking - critical
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      High
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span className="font-medium">≤ 4 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="font-medium">≤ 48 hours</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Booking pending or travel soon
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Normal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span className="font-medium">≤ 24 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="font-medium">≤ 3 days</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Standard support request
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-muted-foreground" />
                      Low
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span className="font-medium">≤ 48 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="font-medium">No target</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      General inquiries
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Sidebar */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicketId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono">{selectedTicket.ticket_number}</span>
                  <TicketStatusBadge status={selectedTicket.status || 'open'} />
                  <TicketPriorityBadge priority={selectedTicket.priority || 'normal'} />
                </DialogTitle>
                <DialogDescription>
                  {selectedTicket.created_at && format(new Date(selectedTicket.created_at), 'PPpp')}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 max-h-[50vh] pr-4">
                <div className="space-y-4">
                  {/* SLA Status */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Response SLA</p>
                      <SLACountdownBadge
                        dueAt={selectedTicket.sla_response_due_at || null}
                        pausedAt={selectedTicket.sla_paused_at || null}
                        pausedMinutes={selectedTicket.sla_paused_duration_minutes || 0}
                        isBreached={selectedTicket.sla_response_breached || false}
                        type="response"
                      />
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Resolution SLA</p>
                      <SLACountdownBadge
                        dueAt={selectedTicket.sla_resolution_due_at || null}
                        pausedAt={selectedTicket.sla_paused_at || null}
                        pausedMinutes={selectedTicket.sla_paused_duration_minutes || 0}
                        isBreached={selectedTicket.sla_resolution_breached || false}
                        type="resolution"
                      />
                    </div>
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSLAPause.mutate({ 
                          ticketId: selectedTicket.id, 
                          pause: !selectedTicket.sla_paused_at 
                        })}
                      >
                        {selectedTicket.sla_paused_at ? (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Resume SLA
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Pause SLA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Subject & Description */}
                  <div>
                    <h3 className="font-semibold mb-2">{selectedTicket.subject}</h3>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                    </div>
                  </div>

                  {/* Conversation */}
                  {ticketDetails?.messages && ticketDetails.messages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Conversation</h4>
                      {ticketDetails.messages.map(msg => (
                        <div 
                          key={msg.id}
                          className={cn(
                            "p-3 rounded-lg",
                            msg.sender_type === 'agent' 
                              ? "bg-primary/10 ml-8" 
                              : "bg-muted/30 mr-8"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {msg.sender_type === 'agent' ? 'Support' : 'Customer'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Reply & Actions */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Reply</Label>
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Select
                      value={selectedTicket.status || 'open'}
                      onValueChange={(status) => 
                        updateTicket.mutate({ ticketId: selectedTicket.id, updates: { status } })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_supplier">Waiting Supplier</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedTicket.priority || 'normal'}
                      onValueChange={(priority) => 
                        updateTicket.mutate({ ticketId: selectedTicket.id, updates: { priority } })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setShowEscalateDialog(true)}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Escalate
                    </Button>
                    <Button 
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || addMessage.isPending}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Ticket</DialogTitle>
            <DialogDescription>
              Escalate this ticket to the appropriate team for senior attention.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Escalation Target</Label>
              <Select value={escalationTarget} onValueChange={(v: any) => setEscalationTarget(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations Team</SelectItem>
                  <SelectItem value="finance">Finance (Refunds)</SelectItem>
                  <SelectItem value="admin">Admin (Critical)</SelectItem>
                  <SelectItem value="supplier">Supplier Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason for Escalation</Label>
              <Textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Explain why this ticket needs escalation..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleEscalate}
              disabled={!escalationReason.trim() || escalateTicket.isPending}
            >
              Escalate Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
