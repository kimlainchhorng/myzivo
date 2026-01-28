import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Shield,
  Server,
  Wifi,
  Database,
  Clock,
  ChevronRight,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SystemAlert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "security" | "performance" | "system" | "network" | "database" | "service";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isAcknowledged: boolean;
  source: string;
  affectedServices?: string[];
}

interface SystemHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: string;
  latency: number;
  icon: any;
}

const mockAlerts: SystemAlert[] = [
  {
    id: "1",
    type: "critical",
    category: "security",
    title: "Unusual Login Activity Detected",
    message: "Multiple failed login attempts from IP 192.168.1.45. Consider blocking this IP.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    isAcknowledged: false,
    source: "Auth Service",
    affectedServices: ["Authentication", "User Sessions"],
  },
  {
    id: "2",
    type: "warning",
    category: "performance",
    title: "High API Response Time",
    message: "Average response time exceeded 500ms threshold for the past 10 minutes.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
    isAcknowledged: false,
    source: "API Gateway",
    affectedServices: ["Rides API", "Food API"],
  },
  {
    id: "3",
    type: "warning",
    category: "database",
    title: "Database Connection Pool Near Limit",
    message: "Connection pool at 85% capacity. Consider scaling database resources.",
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    isRead: false,
    isAcknowledged: true,
    source: "Database Monitor",
  },
  {
    id: "4",
    type: "info",
    category: "system",
    title: "Scheduled Maintenance Tonight",
    message: "System maintenance scheduled for 2:00 AM - 3:00 AM UTC. Minimal disruption expected.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
    isAcknowledged: true,
    source: "Ops Team",
  },
  {
    id: "5",
    type: "success",
    category: "service",
    title: "Payment Service Recovered",
    message: "Payment processing service has recovered after brief outage. All transactions processing normally.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    isRead: true,
    isAcknowledged: true,
    source: "Health Check",
  },
  {
    id: "6",
    type: "critical",
    category: "network",
    title: "CDN Node Unreachable",
    message: "EU-West-2 CDN node is not responding. Traffic being rerouted automatically.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: true,
    isAcknowledged: true,
    source: "CDN Monitor",
    affectedServices: ["Static Assets", "Image Delivery"],
  },
];

const mockSystemHealth: SystemHealth[] = [
  { name: "API Gateway", status: "healthy", uptime: "99.99%", latency: 45, icon: Server },
  { name: "Database", status: "degraded", uptime: "99.95%", latency: 120, icon: Database },
  { name: "Auth Service", status: "healthy", uptime: "100%", latency: 32, icon: Shield },
  { name: "CDN", status: "degraded", uptime: "99.80%", latency: 85, icon: Wifi },
  { name: "Payment Gateway", status: "healthy", uptime: "99.99%", latency: 78, icon: Zap },
  { name: "Notification Service", status: "healthy", uptime: "100%", latency: 25, icon: Bell },
];

const alertTypeConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
};

const healthStatusConfig = {
  healthy: { color: "text-green-500", bg: "bg-green-500", label: "Healthy" },
  degraded: { color: "text-amber-500", bg: "bg-amber-500", label: "Degraded" },
  down: { color: "text-red-500", bg: "bg-red-500", label: "Down" },
};

const categoryIcons = {
  security: Shield,
  performance: Clock,
  system: Server,
  network: Wifi,
  database: Database,
  service: Activity,
};

const AdminSystemAlerts = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState("alerts");
  const [filter, setFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.type === "critical" && !a.isAcknowledged).length;
  const healthyServices = mockSystemHealth.filter(s => s.status === "healthy").length;

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true;
    if (filter === "unread") return !alert.isRead;
    if (filter === "unacknowledged") return !alert.isAcknowledged;
    return alert.type === filter;
  });

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, isRead: true, isAcknowledged: true } : a
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true, isAcknowledged: true })));
  };

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            System Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Quick Controls */}
        <div className="flex items-center justify-between mt-3 p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh}
                className="h-4 w-7"
              />
              <span className="text-xs text-muted-foreground">Auto-refresh</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={acknowledgeAll} className="text-xs h-7">
            Acknowledge All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-3">
            <TabsTrigger value="alerts" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              Alerts ({filteredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs gap-1">
              <Activity className="h-3 w-3" />
              Health ({healthyServices}/{mockSystemHealth.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts" className="mt-0">
            {/* Filter Tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {["all", "critical", "warning", "unacknowledged"].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn("text-[10px] capitalize h-6 px-2")}
                >
                  {f}
                </Button>
              ))}
            </div>
            
            <ScrollArea className="h-[320px] pr-2">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mb-3 text-green-500/50" />
                    <p className="text-sm">No alerts to display</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAlerts.map((alert, index) => {
                      const config = alertTypeConfig[alert.type];
                      const Icon = config.icon;
                      const CategoryIcon = categoryIcons[alert.category];
                      
                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "group relative p-3 rounded-xl border transition-all",
                            config.bg,
                            config.border,
                            !alert.isAcknowledged && "ring-1 ring-primary/20"
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                              <Icon className={cn("h-4 w-4", config.color)} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{alert.title}</h4>
                                  {!alert.isAcknowledged && (
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => dismissAlert(alert.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {alert.message}
                              </p>
                              
                              {alert.affectedServices && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {alert.affectedServices.map(service => (
                                    <Badge 
                                      key={service} 
                                      variant="outline" 
                                      className="text-[9px] h-4 px-1.5"
                                    >
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <CategoryIcon className="h-3 w-3" />
                                    <span className="capitalize">{alert.category}</span>
                                  </div>
                                  <span>{alert.source}</span>
                                  <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                                </div>
                                
                                {!alert.isAcknowledged && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                  >
                                    Acknowledge
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="health" className="mt-0">
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-2">
                {mockSystemHealth.map((service, index) => {
                  const config = healthStatusConfig[service.status];
                  const ServiceIcon = service.icon;
                  
                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{service.name}</h4>
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-2 h-2 rounded-full", config.bg)} />
                              <span className={cn("text-xs font-medium", config.color)}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Uptime: {service.uptime}</span>
                            <span>Latency: {service.latency}ms</span>
                          </div>
                        </div>
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

export default AdminSystemAlerts;
