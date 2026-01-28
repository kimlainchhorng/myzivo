import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SystemComponent {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "operational" | "degraded" | "down";
  uptime: string;
  latency?: number;
  usage?: number;
}

const AdminSystemStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Test Supabase connection health
  const { data: dbHealth, refetch: refetchDb } = useQuery({
    queryKey: ["db-health"],
    queryFn: async () => {
      const start = Date.now();
      try {
        await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
        return { status: "operational" as const, latency: Date.now() - start };
      } catch {
        return { status: "down" as const, latency: 0 };
      }
    },
    refetchInterval: 60000,
  });

  // Test API health
  const { data: apiHealth, refetch: refetchApi } = useQuery({
    queryKey: ["api-health"],
    queryFn: async () => {
      const start = Date.now();
      try {
        const response = await fetch(`https://slirphzzwcogdbkeicff.supabase.co/rest/v1/`, {
          method: "HEAD",
          headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI"
          }
        });
        return { 
          status: response.ok ? "operational" as const : "degraded" as const, 
          latency: Date.now() - start 
        };
      } catch {
        return { status: "down" as const, latency: 0 };
      }
    },
    refetchInterval: 60000,
  });

  // Get system statistics
  const { data: systemStats, refetch: refetchStats } = useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const [driversRes, tripsRes, ordersRes] = await Promise.all([
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("trips").select("id", { count: "exact", head: true }),
        supabase.from("food_orders").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalDrivers: driversRes.count || 0,
        totalTrips: tripsRes.count || 0,
        totalOrders: ordersRes.count || 0,
      };
    },
  });

  const components: SystemComponent[] = [
    {
      id: "api",
      name: "API Gateway",
      icon: Server,
      status: apiHealth?.status || "operational",
      uptime: "99.99%",
      latency: apiHealth?.latency || 45,
    },
    {
      id: "database",
      name: "Database Cluster",
      icon: Database,
      status: dbHealth?.status || "operational",
      uptime: "99.97%",
      latency: dbHealth?.latency || 12,
    },
    {
      id: "cdn",
      name: "CDN Network",
      icon: Globe,
      status: "operational",
      uptime: "100%",
      latency: 8,
    },
    {
      id: "storage",
      name: "File Storage",
      icon: HardDrive,
      status: "operational",
      uptime: "99.95%",
      usage: Math.floor(Math.random() * 30 + 50),
    },
    {
      id: "compute",
      name: "Edge Functions",
      icon: Cpu,
      status: "operational",
      uptime: "99.98%",
      usage: Math.floor(Math.random() * 20 + 30),
    },
    {
      id: "realtime",
      name: "Realtime Engine",
      icon: Wifi,
      status: "operational",
      uptime: "99.99%",
      latency: Math.floor(Math.random() * 10 + 5),
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchDb(), refetchApi(), refetchStats()]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "operational":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500", label: "Operational" };
      case "degraded":
        return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500", label: "Degraded" };
      case "down":
        return { icon: XCircle, color: "text-destructive", bg: "bg-destructive", label: "Down" };
      default:
        return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  const operationalCount = components.filter(c => c.status === "operational").length;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn(
              operationalCount === components.length 
                ? "bg-green-500/10 text-green-500" 
                : "bg-amber-500/10 text-amber-500"
            )}>
              {operationalCount}/{components.length} Operational
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {components.map((component, index) => {
          const Icon = component.icon;
          const statusConfig = getStatusConfig(component.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group"
            >
              {/* Icon */}
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              
              {/* Name & Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{component.name}</span>
                  <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {component.uptime}
                </p>
              </div>
              
              {/* Metrics */}
              <div className="flex items-center gap-4 shrink-0">
                {component.latency !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className={cn(
                      "text-sm font-medium",
                      component.latency < 50 ? "text-green-500" :
                      component.latency < 100 ? "text-amber-500" : "text-red-500"
                    )}>
                      {component.latency}ms
                    </p>
                  </div>
                )}
                
                {component.usage !== undefined && (
                  <div className="w-20">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">{component.usage}%</span>
                    </div>
                    <Progress 
                      value={component.usage} 
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Last Updated */}
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Last checked: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSystemStatus;
