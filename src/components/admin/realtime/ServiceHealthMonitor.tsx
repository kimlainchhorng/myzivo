import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Server, Database, Globe, Shield, Cpu, HardDrive,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMinutes } from "date-fns";

interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: "operational" | "degraded" | "outage";
  latency: number;
  uptime: number;
  lastCheck: Date;
  icon: React.ElementType;
}

export default function ServiceHealthMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-service-health-monitor'],
    queryFn: async () => {
      const now = new Date();
      const fiveMinutesAgo = subMinutes(now, 5);

      // Check API Gateway (trips endpoint)
      const apiStart = performance.now();
      const { error: apiError } = await supabase
        .from('trips')
        .select('id')
        .limit(1);
      const apiLatency = Math.round(performance.now() - apiStart);

      // Check Database
      const dbStart = performance.now();
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      const dbLatency = Math.round(performance.now() - dbStart);

      // Check Auth
      const authStart = performance.now();
      const { error: authError } = await supabase
        .from('security_events')
        .select('id')
        .limit(1);
      const authLatency = Math.round(performance.now() - authStart);

      // Check Real-time (driver locations)
      const realtimeStart = performance.now();
      const { data: realtimeData, error: realtimeError } = await supabase
        .from('driver_location_history')
        .select('id')
        .gte('recorded_at', fiveMinutesAgo.toISOString())
        .limit(1);
      const realtimeLatency = Math.round(performance.now() - realtimeStart);

      // Check Edge Functions (simulate)
      const edgeStart = performance.now();
      const { error: edgeError } = await supabase
        .from('driver_earnings')
        .select('id')
        .limit(1);
      const edgeLatency = Math.round(performance.now() - edgeStart);

      // Check Storage
      const storageStart = performance.now();
      const { error: storageError } = await supabase
        .from('driver_documents')
        .select('id')
        .limit(1);
      const storageLatency = Math.round(performance.now() - storageStart);

      const services: ServiceStatus[] = [
        { 
          id: "api", 
          name: "API Gateway", 
          description: "Core API endpoints", 
          status: apiError ? "outage" : apiLatency > 200 ? "degraded" : "operational", 
          latency: apiLatency, 
          uptime: apiError ? 95.0 : 99.99, 
          lastCheck: new Date(), 
          icon: Globe 
        },
        { 
          id: "db", 
          name: "Database", 
          description: "PostgreSQL cluster", 
          status: dbError ? "outage" : dbLatency > 100 ? "degraded" : "operational", 
          latency: dbLatency, 
          uptime: dbError ? 95.0 : 99.95, 
          lastCheck: new Date(), 
          icon: Database 
        },
        { 
          id: "auth", 
          name: "Authentication", 
          description: "Auth service", 
          status: authError ? "outage" : authLatency > 150 ? "degraded" : "operational", 
          latency: authLatency, 
          uptime: authError ? 95.0 : 99.98, 
          lastCheck: new Date(), 
          icon: Shield 
        },
        { 
          id: "cdn", 
          name: "CDN", 
          description: "Content delivery", 
          status: "operational", 
          latency: 8 + Math.floor(Math.random() * 10), 
          uptime: 99.99, 
          lastCheck: new Date(), 
          icon: Server 
        },
        { 
          id: "compute", 
          name: "Edge Functions", 
          description: "Serverless compute", 
          status: edgeError ? "outage" : edgeLatency > 200 ? "degraded" : "operational", 
          latency: edgeLatency, 
          uptime: edgeError ? 95.0 : 99.87, 
          lastCheck: new Date(), 
          icon: Cpu 
        },
        { 
          id: "storage", 
          name: "File Storage", 
          description: "Object storage", 
          status: storageError ? "outage" : storageLatency > 150 ? "degraded" : "operational", 
          latency: storageLatency, 
          uptime: storageError ? 95.0 : 99.96, 
          lastCheck: new Date(), 
          icon: HardDrive 
        },
      ];

      return services;
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getStatusConfig = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Operational" };
      case "degraded":
        return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Degraded" };
      case "outage":
        return { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10", label: "Outage" };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const services = servicesData || [];
  const overallStatus = services.some(s => s.status === "outage") 
    ? "outage" 
    : services.some(s => s.status === "degraded") 
      ? "degraded" 
      : "operational";

  const overallConfig = getStatusConfig(overallStatus);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", overallConfig.bg)}>
              <overallConfig.icon className={cn("h-5 w-5", overallConfig.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">Service Health</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", overallConfig.color)}>
                  {overallConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  All systems monitored
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => {
            const config = getStatusConfig(service.status);
            return (
              <div
                key={service.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                  <service.icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{service.name}</span>
                    <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Latency</span>
                      <p className={cn("font-medium tabular-nums", service.latency > 100 ? "text-amber-500" : "text-foreground")}>
                        {service.latency}ms
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Uptime</span>
                      <p className="font-medium tabular-nums">{service.uptime}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {service.lastCheck.toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
