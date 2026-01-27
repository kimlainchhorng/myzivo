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
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SystemComponent {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "operational" | "degraded" | "down";
  uptime: string;
  latency?: number;
  usage?: number;
  lastChecked: Date;
}

const AdminSystemStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const [components, setComponents] = useState<SystemComponent[]>([
    {
      id: "api",
      name: "API Gateway",
      icon: Server,
      status: "operational",
      uptime: "99.99%",
      latency: 45,
      lastChecked: new Date(),
    },
    {
      id: "database",
      name: "Database Cluster",
      icon: Database,
      status: "operational",
      uptime: "99.97%",
      latency: 12,
      lastChecked: new Date(),
    },
    {
      id: "cdn",
      name: "CDN Network",
      icon: Wifi,
      status: "operational",
      uptime: "100%",
      latency: 8,
      lastChecked: new Date(),
    },
    {
      id: "storage",
      name: "File Storage",
      icon: HardDrive,
      status: "operational",
      uptime: "99.95%",
      usage: 68,
      lastChecked: new Date(),
    },
    {
      id: "compute",
      name: "Compute Nodes",
      icon: Cpu,
      status: "operational",
      uptime: "99.98%",
      usage: 42,
      lastChecked: new Date(),
    },
    {
      id: "cache",
      name: "Cache Layer",
      icon: MemoryStick,
      status: "operational",
      uptime: "99.99%",
      usage: 55,
      lastChecked: new Date(),
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setComponents(prev => prev.map(c => ({
      ...c,
      lastChecked: new Date(),
      latency: c.latency ? Math.floor(Math.random() * 20 + 5) : undefined,
    })));
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
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
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
