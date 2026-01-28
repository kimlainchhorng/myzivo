import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, Database, Globe, Shield, Cpu, HardDrive,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [services, setServices] = useState<ServiceStatus[]>([
    { id: "api", name: "API Gateway", description: "Core API endpoints", status: "operational", latency: 45, uptime: 99.99, lastCheck: new Date(), icon: Globe },
    { id: "db", name: "Database", description: "PostgreSQL cluster", status: "operational", latency: 12, uptime: 99.95, lastCheck: new Date(), icon: Database },
    { id: "auth", name: "Authentication", description: "Auth service", status: "operational", latency: 38, uptime: 99.98, lastCheck: new Date(), icon: Shield },
    { id: "cdn", name: "CDN", description: "Content delivery", status: "operational", latency: 8, uptime: 99.99, lastCheck: new Date(), icon: Server },
    { id: "compute", name: "Edge Functions", description: "Serverless compute", status: "degraded", latency: 156, uptime: 99.87, lastCheck: new Date(), icon: Cpu },
    { id: "storage", name: "File Storage", description: "Object storage", status: "operational", latency: 23, uptime: 99.96, lastCheck: new Date(), icon: HardDrive },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        latency: Math.max(5, service.latency + Math.floor(Math.random() * 20) - 10),
        lastCheck: new Date()
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setServices(prev => prev.map(service => ({
      ...service,
      lastCheck: new Date()
    })));
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
