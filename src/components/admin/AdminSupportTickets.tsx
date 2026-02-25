import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Headphones, MessageSquare, Clock, CheckCircle, AlertCircle, 
  Send, User, Shield, Inbox, XCircle, RefreshCw, Filter, 
  AlertTriangle, Zap, UserCheck, FileText, TrendingUp, Bell
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import AdminTicketQueue from "./AdminTicketQueue";
import AdminEscalationManager from "./AdminEscalationManager";
import AdminSystemAlerts from "./AdminSystemAlerts";

interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string | null;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string | null;
  is_admin: boolean;
  message: string;
  created_at: string;
}

const responseTemplates = [
  { id: "greeting", name: "Greeting", text: "Hello! Thank you for reaching out. I'd be happy to help you with your inquiry." },
  { id: "investigating", name: "Investigating", text: "Thank you for your patience. We're currently investigating this issue and will get back to you shortly." },
  { id: "resolved", name: "Issue Resolved", text: "Great news! The issue has been resolved. Please let us know if you need any further assistance." },
  { id: "more-info", name: "Need More Info", text: "To better assist you, could you please provide more details about the issue you're experiencing?" },
  { id: "escalated", name: "Escalated", text: "Your case has been escalated to our senior support team. They will reach out to you within 24 hours." },
];

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  open: { color: "text-blue-500", bg: "bg-blue-500/10", icon: Inbox },
  in_progress: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  waiting_response: { color: "text-purple-500", bg: "bg-purple-500/10", icon: MessageSquare },
  resolved: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
  closed: { color: "text-slate-500", bg: "bg-slate-500/10", icon: XCircle },
};

const priorityConfig: Record<string, { color: string; bg: string; icon: any }> = {
  low: { color: "text-slate-500", bg: "bg-slate-500/10", icon: null },
  medium: { color: "text-blue-500", bg: "bg-blue-500/10", icon: null },
  high: { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle },
  urgent: { color: "text-red-500", bg: "bg-red-500/10", icon: Zap },
};

const AdminSupportTickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tickets");
  const [mainView, setMainView] = useState("support");
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Ticket[];
    },
  });

  const { data: replies } = useQuery({
    queryKey: ["ticket-replies", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as TicketReply[];
    },
    enabled: !!selectedTicket,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast.success("Ticket status updated");
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { error } = await supabase
        .from("ticket_replies")
        .insert({
          ticket_id: ticketId,
          message,
          is_admin: true,
        });
      
      if (error) throw error;
      
      // Update ticket status to waiting_response
      await supabase
        .from("support_tickets")
        .update({ status: "waiting_response" })
        .eq("id", ticketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-replies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast.success("Reply sent");
      setReplyMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send reply");
    },
  });

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const openCount = tickets?.filter(t => t.status === 'open').length || 0;
  const inProgressCount = tickets?.filter(t => t.status === 'in_progress').length || 0;
  const resolvedCount = tickets?.filter(t => t.status === 'resolved').length || 0;
  const urgentCount = tickets?.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length || 0;

  const handleAssignToMe = async (ticketId: string) => {
    await updateStatusMutation.mutateAsync({ id: ticketId, status: "in_progress" });
    toast.success("Ticket assigned to you");
  };

  const useTemplate = (template: typeof responseTemplates[0]) => {
    setReplyMessage(template.text);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    return (
      <Badge className={cn("gap-1.5 capitalize", config.bg, config.color, "border-transparent")}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const config = priorityConfig[priority] || priorityConfig.medium;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={cn("capitalize gap-1", config.color, config.bg, "border-transparent")}>
        {Icon && <Icon className="h-3 w-3" />}
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10">
            <Headphones className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Support & Alerts</h1>
            <p className="text-muted-foreground">Manage tickets, escalations, and system alerts</p>
          </div>
        </div>
        
        {/* Main View Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
          <Button
            variant={mainView === "support" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMainView("support")}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Support
          </Button>
          <Button
            variant={mainView === "alerts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMainView("alerts")}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            System Alerts
          </Button>
        </div>
      </div>

      {mainView === "alerts" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminSystemAlerts />
          <div className="space-y-6">
            <AdminTicketQueue />
          </div>
        </div>
      ) : (
        <>
          {/* Queue and Escalation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminTicketQueue />
            <AdminEscalationManager />
          </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={cn(
          "border-0 bg-card/50 backdrop-blur-xl cursor-pointer transition-all hover:shadow-lg",
          statusFilter === "open" && "ring-2 ring-blue-500"
        )} onClick={() => setStatusFilter(statusFilter === "open" ? "all" : "open")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Inbox className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-lg font-semibold">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-0 bg-card/50 backdrop-blur-xl cursor-pointer transition-all hover:shadow-lg",
          statusFilter === "in_progress" && "ring-2 ring-amber-500"
        )} onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-lg font-semibold">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-0 bg-card/50 backdrop-blur-xl cursor-pointer transition-all hover:shadow-lg",
          statusFilter === "resolved" && "ring-2 ring-green-500"
        )} onClick={() => setStatusFilter(statusFilter === "resolved" ? "all" : "resolved")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-lg font-semibold">{resolvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-0 bg-card/50 backdrop-blur-xl cursor-pointer transition-all hover:shadow-lg",
          priorityFilter === "urgent" && "ring-2 ring-red-500"
        )} onClick={() => setPriorityFilter(priorityFilter === "urgent" ? "all" : "urgent")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <Zap className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Urgent</p>
              <p className="text-lg font-semibold">{urgentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10">
              <Headphones className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{tickets?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                All Tickets
              </CardTitle>
              <CardDescription>View and respond to support requests</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_response">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Ticket</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Headphones className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No tickets found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground capitalize">{ticket.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View
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

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {selectedTicket?.ticket_number}
            </DialogTitle>
            <DialogDescription>{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Ticket Info */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <div className="p-2 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>
                <div className="p-2 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium capitalize">{selectedTicket.category}</p>
                </div>
              </div>

              {/* Original Message */}
              <div className="p-3 rounded-xl bg-muted/30 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Original Message</p>
                <p className="text-sm">{selectedTicket.description}</p>
              </div>

              <Separator className="my-2" />

              {/* Replies */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {replies?.map((reply) => (
                    <div
                      key={reply.id}
                      className={cn(
                        "p-3 rounded-xl",
                        reply.is_admin ? "bg-primary/5 ml-6" : "bg-muted/30 mr-6"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "p-1 rounded",
                          reply.is_admin ? "bg-primary/10" : "bg-muted"
                        )}>
                          {reply.is_admin ? (
                            <Shield className="h-3 w-3 text-primary" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          {reply.is_admin ? "Support Team" : "Customer"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Input with Templates */}
              <div className="pt-4 mt-auto space-y-3">
                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5">
                  {responseTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => useTemplate(template)}
                      className="text-xs h-7"
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendReplyMutation.mutate({
                      ticketId: selectedTicket.id,
                      message: replyMessage,
                    })}
                    disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                    size="icon"
                    className="h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Select
              value={selectedTicket?.status}
              onValueChange={(status) => {
                if (selectedTicket) {
                  updateStatusMutation.mutate({ id: selectedTicket.id, status });
                  setSelectedTicket({ ...selectedTicket, status });
                }
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_response">Waiting Response</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
};

export default AdminSupportTickets;
