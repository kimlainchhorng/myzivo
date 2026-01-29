import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  AlertTriangle, 
  Zap, 
  User, 
  ArrowUpRight,
  Timer,
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QueuedTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: "urgent" | "high" | "medium" | "low";
  waitTime: number;
  category: string;
  customerName: string;
  slaStatus: "on_track" | "at_risk" | "breached";
  assignedTo?: string;
}

const priorityConfig = {
  urgent: { color: "text-red-500", bg: "bg-red-500/10", icon: Zap, slaMinutes: 30 },
  high: { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle, slaMinutes: 60 },
  medium: { color: "text-blue-500", bg: "bg-blue-500/10", icon: Clock, slaMinutes: 120 },
  low: { color: "text-slate-500", bg: "bg-slate-500/10", icon: Clock, slaMinutes: 240 },
};

const slaConfig = {
  on_track: { color: "text-green-500", bg: "bg-green-500/10", label: "On Track" },
  at_risk: { color: "text-amber-500", bg: "bg-amber-500/10", label: "At Risk" },
  breached: { color: "text-red-500", bg: "bg-red-500/10", label: "SLA Breached" },
};

const useTicketQueue = () => {
  return useQuery({
    queryKey: ["admin-ticket-queue"],
    queryFn: async () => {
      // Fetch support tickets from the database
      const { data: tickets, error } = await supabase
        .from("support_tickets")
        .select(`
          id,
          ticket_number,
          subject,
          priority,
          status,
          category,
          created_at,
          user_id,
          assigned_to
        `)
        .in("status", ["open", "pending", "in_progress"])
        .order("created_at", { ascending: true })
        .limit(20);

      if (error) throw error;

      // Get user profiles for ticket submitters
      const userIds = tickets?.map(t => t.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      // Transform to QueuedTicket format
      const queuedTickets: QueuedTicket[] = (tickets || []).map(ticket => {
        const createdAt = new Date(ticket.created_at);
        const waitTime = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60));
        const priority = (ticket.priority as "urgent" | "high" | "medium" | "low") || "medium";
        const slaMinutes = priorityConfig[priority]?.slaMinutes || 120;
        
        let slaStatus: "on_track" | "at_risk" | "breached" = "on_track";
        if (waitTime > slaMinutes) {
          slaStatus = "breached";
        } else if (waitTime > slaMinutes * 0.7) {
          slaStatus = "at_risk";
        }

        return {
          id: ticket.id,
          ticketNumber: ticket.ticket_number || `TKT-${ticket.id.slice(0, 8).toUpperCase()}`,
          subject: ticket.subject || "No subject",
          priority,
          waitTime,
          category: ticket.category || "general",
          customerName: profileMap.get(ticket.user_id) || "Unknown User",
          slaStatus,
          assignedTo: ticket.assigned_to || undefined,
        };
      });

      return queuedTickets;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

const AdminTicketQueue = () => {
  const { data: tickets = [], isLoading } = useTicketQueue();

  const queueStats = {
    totalInQueue: tickets.length,
    avgWaitTime: tickets.length > 0 
      ? Math.round(tickets.reduce((sum, t) => sum + t.waitTime, 0) / tickets.length)
      : 0,
    atRiskCount: tickets.filter(t => t.slaStatus === "at_risk" || t.slaStatus === "breached").length,
    agentsOnline: 8, // This could come from a real-time presence system
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Ticket Queue
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {queueStats.totalInQueue} Waiting
          </Badge>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold">{queueStats.totalInQueue}</p>
            <p className="text-[10px] text-muted-foreground">In Queue</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold">{queueStats.avgWaitTime}m</p>
            <p className="text-[10px] text-muted-foreground">Avg Wait</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-center">
            <p className="text-lg font-bold text-amber-500">{queueStats.atRiskCount}</p>
            <p className="text-[10px] text-muted-foreground">At Risk</p>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10 text-center">
            <p className="text-lg font-bold text-green-500">{queueStats.agentsOnline}</p>
            <p className="text-[10px] text-muted-foreground">Agents</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mb-3 text-green-500/50" />
              <p className="text-sm">No tickets in queue</p>
              <p className="text-xs">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket, index) => {
                const pConfig = priorityConfig[ticket.priority];
                const sConfig = slaConfig[ticket.slaStatus];
                const PriorityIcon = pConfig.icon;
                const slaProgress = Math.min((ticket.waitTime / pConfig.slaMinutes) * 100, 100);
                
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all cursor-pointer",
                      ticket.slaStatus === "at_risk" && "border-amber-500/30",
                      ticket.slaStatus === "breached" && "border-red-500/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn("text-xs", pConfig.bg, pConfig.color)}>
                          {ticket.customerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
                          <Badge className={cn("text-[10px] h-4 gap-1", pConfig.bg, pConfig.color, "border-transparent")}>
                            <PriorityIcon className="h-2.5 w-2.5" />
                            {ticket.priority}
                          </Badge>
                        </div>
                        
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {ticket.waitTime}m
                            </span>
                            <span className="capitalize">{ticket.category}</span>
                          </div>
                          
                          <Badge variant="outline" className={cn("text-[10px] h-5", sConfig.bg, sConfig.color, "border-transparent")}>
                            {sConfig.label}
                          </Badge>
                        </div>
                        
                        {/* SLA Progress Bar */}
                        <div className="mt-2">
                          <Progress 
                            value={slaProgress} 
                            className={cn(
                              "h-1",
                              slaProgress > 80 ? "bg-red-500/20" : slaProgress > 50 ? "bg-amber-500/20" : "bg-green-500/20"
                            )}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminTicketQueue;
