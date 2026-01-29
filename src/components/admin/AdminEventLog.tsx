import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ListFilter, 
  Search,
  Download,
  RefreshCw,
  User,
  Car,
  CreditCard,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EventLog {
  id: string;
  type: "user" | "driver" | "payment" | "system" | "security";
  action: string;
  actor: string;
  actorType: "user" | "admin" | "system";
  target?: string;
  targetType?: string;
  severity: "info" | "warning" | "error" | "success";
  timestamp: Date;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

const mockEvents: EventLog[] = [
  {
    id: "1",
    type: "security",
    action: "Admin login successful",
    actor: "admin@zivo.com",
    actorType: "admin",
    severity: "info",
    timestamp: new Date(Date.now() - 2 * 60000),
    ipAddress: "192.168.1.100",
    metadata: { browser: "Chrome", os: "macOS" },
  },
  {
    id: "2",
    type: "payment",
    action: "Payout processed",
    actor: "System",
    actorType: "system",
    target: "Driver #D-456",
    targetType: "driver",
    severity: "success",
    timestamp: new Date(Date.now() - 5 * 60000),
    metadata: { amount: 245.50, method: "bank_transfer" },
  },
  {
    id: "3",
    type: "driver",
    action: "Driver status changed",
    actor: "admin@zivo.com",
    actorType: "admin",
    target: "Michael Chen",
    targetType: "driver",
    severity: "warning",
    timestamp: new Date(Date.now() - 12 * 60000),
    metadata: { from: "active", to: "suspended", reason: "Document expired" },
  },
  {
    id: "4",
    type: "user",
    action: "Account created",
    actor: "System",
    actorType: "system",
    target: "john.doe@email.com",
    targetType: "customer",
    severity: "info",
    timestamp: new Date(Date.now() - 20 * 60000),
    metadata: { source: "mobile_app", platform: "iOS" },
  },
  {
    id: "5",
    type: "system",
    action: "Configuration updated",
    actor: "admin@zivo.com",
    actorType: "admin",
    severity: "info",
    timestamp: new Date(Date.now() - 35 * 60000),
    metadata: { setting: "surge_multiplier", from: 1.5, to: 1.8 },
  },
  {
    id: "6",
    type: "security",
    action: "Failed login attempt",
    actor: "unknown@email.com",
    actorType: "user",
    severity: "error",
    timestamp: new Date(Date.now() - 45 * 60000),
    ipAddress: "203.0.113.50",
    metadata: { attempts: 3, blocked: true },
  },
  {
    id: "7",
    type: "payment",
    action: "Refund issued",
    actor: "support@zivo.com",
    actorType: "admin",
    target: "Order #ORD-789",
    targetType: "order",
    severity: "warning",
    timestamp: new Date(Date.now() - 60 * 60000),
    metadata: { amount: 32.50, reason: "Customer complaint" },
  },
];

const AdminEventLog = () => {
  const [events] = useState(mockEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user": return User;
      case "driver": return Car;
      case "payment": return CreditCard;
      case "system": return Settings;
      case "security": return Shield;
      default: return Info;
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "success":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" };
      case "warning":
        return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "error":
        return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" };
      default:
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" };
    }
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const filteredEvents = events.filter(event =>
    event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.target?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Event Log</h2>
          <p className="text-muted-foreground">Real-time activity and audit trail</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <ListFilter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredEvents.map((event, index) => {
                const TypeIcon = getTypeIcon(event.type);
                const severityConfig = getSeverityConfig(event.severity);
                const SeverityIcon = severityConfig.icon;
                const isExpanded = expandedEvents.includes(event.id);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(event.id)}>
                      <div className={cn(
                        "p-4 rounded-xl border transition-all",
                        severityConfig.bg,
                        "border-transparent hover:border-border/50"
                      )}>
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className="p-2 rounded-lg bg-background/50">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium">{event.action}</span>
                              <Badge variant="secondary" className={cn("text-[10px]", severityConfig.color)}>
                                <SeverityIcon className="h-3 w-3 mr-1" />
                                {event.severity}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <span>by {event.actor}</span>
                              {event.target && (
                                <>
                                  <span>→</span>
                                  <span>{event.target}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Time & Expand */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                            </span>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded && "rotate-180"
                                )} />
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                            {event.ipAddress && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">IP Address:</span>
                                <code className="px-2 py-0.5 rounded bg-muted text-xs">{event.ipAddress}</code>
                              </div>
                            )}
                            {event.metadata && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Metadata:</span>
                                <pre className="mt-1 p-2 rounded bg-muted text-xs overflow-x-auto">
                                  {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventLog;
