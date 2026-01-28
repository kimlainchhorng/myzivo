import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { formatDistanceToNow } from "date-fns";

interface QueuedTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: "urgent" | "high" | "medium" | "low";
  waitTime: number; // in minutes
  category: string;
  customerName: string;
  slaStatus: "on_track" | "at_risk" | "breached";
  assignedTo?: string;
}

const mockQueuedTickets: QueuedTicket[] = [
  {
    id: "1",
    ticketNumber: "TKT-20260128-0012",
    subject: "Payment not processed for ride",
    priority: "urgent",
    waitTime: 45,
    category: "payments",
    customerName: "John Smith",
    slaStatus: "at_risk",
  },
  {
    id: "2",
    ticketNumber: "TKT-20260128-0011",
    subject: "Driver never arrived",
    priority: "high",
    waitTime: 30,
    category: "rides",
    customerName: "Sarah Johnson",
    slaStatus: "on_track",
  },
  {
    id: "3",
    ticketNumber: "TKT-20260128-0010",
    subject: "Wrong food order delivered",
    priority: "high",
    waitTime: 25,
    category: "food",
    customerName: "Mike Chen",
    slaStatus: "on_track",
  },
  {
    id: "4",
    ticketNumber: "TKT-20260128-0009",
    subject: "App crashes on checkout",
    priority: "medium",
    waitTime: 15,
    category: "technical",
    customerName: "Emily Davis",
    slaStatus: "on_track",
  },
  {
    id: "5",
    ticketNumber: "TKT-20260128-0008",
    subject: "Promo code not working",
    priority: "low",
    waitTime: 10,
    category: "promotions",
    customerName: "Alex Wilson",
    slaStatus: "on_track",
  },
];

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

const AdminTicketQueue = () => {
  const queueStats = {
    totalInQueue: mockQueuedTickets.length,
    avgWaitTime: Math.round(mockQueuedTickets.reduce((sum, t) => sum + t.waitTime, 0) / mockQueuedTickets.length),
    atRiskCount: mockQueuedTickets.filter(t => t.slaStatus === "at_risk" || t.slaStatus === "breached").length,
    agentsOnline: 8,
  };

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
          <div className="space-y-2">
            {mockQueuedTickets.map((ticket, index) => {
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminTicketQueue;
