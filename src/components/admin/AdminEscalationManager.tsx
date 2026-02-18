import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  AlertTriangle, 
  ArrowUp,
  Clock,
  User,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  ChevronRight,
  Flame
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface EscalatedTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  escalationLevel: 1 | 2 | 3;
  escalatedAt: Date;
  reason: string;
  originalAgent: string;
  currentHandler: string;
  customerName: string;
  customerEmail: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  attempts: number;
}

// TODO: Fetch escalations from database
const escalations: EscalatedTicket[] = [];

const escalationLevels = {
  1: { label: "Level 1", color: "text-amber-500", bg: "bg-amber-500/10", description: "Senior Agent" },
  2: { label: "Level 2", color: "text-orange-500", bg: "bg-orange-500/10", description: "Team Lead" },
  3: { label: "Level 3", color: "text-red-500", bg: "bg-red-500/10", description: "Management" },
};

const statusConfig = {
  pending: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
  in_progress: { color: "text-blue-500", bg: "bg-blue-500/10", icon: MessageSquare },
  resolved: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle },
  rejected: { color: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
};

const AdminEscalationManager = () => {
  const [activeTab, setActiveTab] = useState("active");
  
  const activeEscalations = escalations.filter(e => e.status === "pending" || e.status === "in_progress");
  const resolvedEscalations = escalations.filter(e => e.status === "resolved" || e.status === "rejected");
  
  const stats = {
    total: escalations.length,
    level3: escalations.filter(e => e.escalationLevel === 3 && e.status !== "resolved").length,
    avgResolutionTime: "4.2h",
    resolutionRate: "94%",
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Escalation Manager
          </CardTitle>
          {stats.level3 > 0 && (
            <Badge variant="destructive" className="animate-pulse gap-1">
              <Flame className="h-3 w-3" />
              {stats.level3} Critical
            </Badge>
          )}
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 text-center">
            <p className="text-lg font-bold text-red-500">{stats.level3}</p>
            <p className="text-[10px] text-muted-foreground">Level 3</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 text-center">
            <p className="text-lg font-bold">{stats.avgResolutionTime}</p>
            <p className="text-[10px] text-muted-foreground">Avg Time</p>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10 text-center">
            <p className="text-lg font-bold text-green-500">{stats.resolutionRate}</p>
            <p className="text-[10px] text-muted-foreground">Resolved</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-3">
            <TabsTrigger value="active" className="text-xs">
              Active ({activeEscalations.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">
              Resolved ({resolvedEscalations.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            <ScrollArea className="h-[280px] pr-2">
              <div className="space-y-2">
                {activeEscalations.map((ticket, index) => {
                  const levelConfig = escalationLevels[ticket.escalationLevel];
                  const sConfig = statusConfig[ticket.status];
                  const StatusIcon = sConfig.icon;
                  
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all",
                        ticket.escalationLevel === 3 && "border-red-500/30 bg-red-500/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg shrink-0 flex flex-col items-center",
                          levelConfig.bg
                        )}>
                          <ArrowUp className={cn("h-4 w-4", levelConfig.color)} />
                          <span className={cn("text-[10px] font-bold mt-0.5", levelConfig.color)}>
                            L{ticket.escalationLevel}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
                            <Badge className={cn("text-[10px] h-4 gap-1", sConfig.bg, sConfig.color, "border-transparent")}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {ticket.status.replace("_", " ")}
                            </Badge>
                          </div>
                          
                          <p className="font-medium text-sm truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ticket.reason}</p>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{ticket.currentHandler}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(ticket.escalatedAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="resolved" className="mt-0">
            <ScrollArea className="h-[280px] pr-2">
              <div className="space-y-2">
                {resolvedEscalations.map((ticket, index) => {
                  const levelConfig = escalationLevels[ticket.escalationLevel];
                  const sConfig = statusConfig[ticket.status];
                  const StatusIcon = sConfig.icon;
                  
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group p-3 rounded-xl border border-border/50 bg-background/30 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg shrink-0", levelConfig.bg)}>
                          <ArrowUp className={cn("h-4 w-4", levelConfig.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                            <Badge className={cn("text-[10px] h-4 gap-1", sConfig.bg, sConfig.color, "border-transparent")}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminEscalationManager;
