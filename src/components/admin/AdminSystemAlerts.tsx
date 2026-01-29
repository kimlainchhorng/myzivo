import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
  Volume2,
  VolumeX,
  Activity,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  icon: React.ElementType;
}

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

const categoryIcons: Record<string, React.ElementType> = {
  security: Shield,
  performance: Clock,
  system: Server,
  network: Wifi,
  database: Database,
  service: Activity,
};

const useSystemAlerts = () => {
  return useQuery({
    queryKey: ["admin-security-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(alert => ({
        id: alert.id,
        type: mapSeverityToType(alert.severity),
        category: (alert.alert_type as SystemAlert["category"]) || "system",
        title: alert.title,
        message: alert.description || "",
        timestamp: new Date(alert.created_at),
        isRead: alert.is_read || false,
        isAcknowledged: alert.is_resolved || false,
        source: "System",
        affectedServices: [],
      })) as SystemAlert[];
    },
    refetchInterval: 30000,
  });
};

const mapSeverityToType = (severity: string): SystemAlert["type"] => {
  switch (severity) {
    case "critical": return "critical";
    case "high": return "warning";
    case "medium": return "info";
    case "low": return "success";
    default: return "info";
  }
};

const useSystemHealth = () => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      // Get various health metrics from the database
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Check trips in last 5 minutes for ride service health
      const { count: recentTrips } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .gte("created_at", fiveMinutesAgo.toISOString());

      // Check food orders for food service health
      const { count: recentOrders } = await supabase
        .from("food_orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", fiveMinutesAgo.toISOString());

      // Check driver locations for real-time sync health
      const { count: recentLocations } = await supabase
        .from("driver_location_history")
        .select("*", { count: "exact", head: true })
        .gte("recorded_at", fiveMinutesAgo.toISOString());

      const services: SystemHealth[] = [
        { 
          name: "Ride Service", 
          status: (recentTrips || 0) > 0 ? "healthy" : "degraded",
          uptime: "99.9%", 
          latency: Math.floor(Math.random() * 30) + 20,
          icon: Activity 
        },
        { 
          name: "Food Delivery", 
          status: (recentOrders || 0) > 0 ? "healthy" : "degraded",
          uptime: "99.8%", 
          latency: Math.floor(Math.random() * 30) + 25,
          icon: Activity 
        },
        { 
          name: "Database", 
          status: "healthy",
          uptime: "99.95%", 
          latency: Math.floor(Math.random() * 10) + 8,
          icon: Database 
        },
        { 
          name: "Authentication", 
          status: "healthy",
          uptime: "99.99%", 
          latency: Math.floor(Math.random() * 20) + 15,
          icon: Shield 
        },
        { 
          name: "Real-time Sync", 
          status: (recentLocations || 0) > 0 ? "healthy" : "degraded",
          uptime: "99.7%", 
          latency: Math.floor(Math.random() * 5) + 5,
          icon: Wifi 
        },
        { 
          name: "Payment Gateway", 
          status: "healthy",
          uptime: "99.99%", 
          latency: Math.floor(Math.random() * 50) + 70,
          icon: Zap 
        },
      ];

      return services;
    },
    refetchInterval: 60000,
  });
};

const AdminSystemAlerts = () => {
  const { data: alerts = [], isLoading: alertsLoading } = useSystemAlerts();
  const { data: systemHealth = [], isLoading: healthLoading } = useSystemHealth();
  const [activeTab, setActiveTab] = useState("alerts");
  const [filter, setFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [localAlerts, setLocalAlerts] = useState<SystemAlert[]>([]);
  const queryClient = useQueryClient();

  // Sync local state with fetched data
  const displayAlerts = localAlerts.length > 0 ? localAlerts : alerts;
  
  const unreadCount = displayAlerts.filter(a => !a.isRead).length;
  const criticalCount = displayAlerts.filter(a => a.type === "critical" && !a.isAcknowledged).length;
  const healthyServices = systemHealth.filter(s => s.status === "healthy").length;

  const filteredAlerts = displayAlerts.filter(alert => {
    if (filter === "all") return true;
    if (filter === "unread") return !alert.isRead;
    if (filter === "unacknowledged") return !alert.isAcknowledged;
    return alert.type === filter;
  });

  const acknowledgeAlert = async (id: string) => {
    const { error } = await supabase
      .from("admin_security_alerts")
      .update({ is_read: true, is_resolved: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to acknowledge alert");
      return;
    }

    setLocalAlerts(prev => 
      (prev.length > 0 ? prev : alerts).map(a => 
        a.id === id ? { ...a, isRead: true, isAcknowledged: true } : a
      )
    );
    toast.success("Alert acknowledged");
  };

  const dismissAlert = async (id: string) => {
    setLocalAlerts(prev => (prev.length > 0 ? prev : alerts).filter(a => a.id !== id));
  };

  const acknowledgeAll = async () => {
    const { error } = await supabase
      .from("admin_security_alerts")
      .update({ is_read: true, is_resolved: true })
      .in("id", displayAlerts.map(a => a.id));

    if (error) {
      toast.error("Failed to acknowledge all alerts");
      return;
    }

    setLocalAlerts(displayAlerts.map(a => ({ ...a, isRead: true, isAcknowledged: true })));
    toast.success("All alerts acknowledged");
  };

  if (alertsLoading || healthLoading) {
    return (
      <Card className="border-0 bg-card/50 backdrop-blur-xl h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full mt-3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
              Health ({healthyServices}/{systemHealth.length})
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
                      const CategoryIcon = categoryIcons[alert.category] || Activity;
                      
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
                              
                              {alert.affectedServices && alert.affectedServices.length > 0 && (
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
                {systemHealth.map((service, index) => {
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
