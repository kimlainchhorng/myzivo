import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Server, 
  Database, 
  Wifi, 
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Clock,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthMetric {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "critical";
  value: number;
  threshold: number;
  unit: string;
  icon: React.ElementType;
  trend: "up" | "down" | "stable";
}

const healthMetrics: HealthMetric[] = [
  {
    id: "api",
    name: "API Response Time",
    status: "healthy",
    value: 45,
    threshold: 200,
    unit: "ms",
    icon: Zap,
    trend: "down",
  },
  {
    id: "database",
    name: "Database Latency",
    status: "healthy",
    value: 12,
    threshold: 50,
    unit: "ms",
    icon: Database,
    trend: "stable",
  },
  {
    id: "cpu",
    name: "CPU Usage",
    status: "healthy",
    value: 42,
    threshold: 80,
    unit: "%",
    icon: Server,
    trend: "up",
  },
  {
    id: "memory",
    name: "Memory Usage",
    status: "degraded",
    value: 78,
    threshold: 85,
    unit: "%",
    icon: Activity,
    trend: "up",
  },
  {
    id: "network",
    name: "Network Throughput",
    status: "healthy",
    value: 850,
    threshold: 1000,
    unit: "Mbps",
    icon: Wifi,
    trend: "stable",
  },
  {
    id: "ssl",
    name: "SSL Certificate",
    status: "healthy",
    value: 45,
    threshold: 30,
    unit: "days",
    icon: Shield,
    trend: "stable",
  },
];

interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage";
  uptime: string;
  lastIncident?: string;
}

const services: ServiceStatus[] = [
  { id: "rides", name: "Ride Service", status: "operational", uptime: "99.99%" },
  { id: "eats", name: "Food Delivery", status: "operational", uptime: "99.95%" },
  { id: "payments", name: "Payments", status: "operational", uptime: "99.99%" },
  { id: "auth", name: "Authentication", status: "operational", uptime: "100%" },
  { id: "maps", name: "Maps & Routing", status: "degraded", uptime: "99.12%", lastIncident: "2h ago" },
  { id: "notifications", name: "Push Notifications", status: "operational", uptime: "99.87%" },
];

const AdminPlatformHealth = () => {
  const [overallHealth, setOverallHealth] = useState(98);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOverallHealth(prev => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500" };
      case "degraded":
        return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500" };
      case "critical":
      case "outage":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500" };
      default:
        return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const healthyServices = services.filter(s => s.status === "operational").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Platform Health
          </h2>
          <p className="text-muted-foreground">Infrastructure and service monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-base py-1.5 px-4">
            {healthyServices}/{services.length} Services Operational
          </Badge>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Overall Health Score</h3>
              <p className="text-sm text-muted-foreground">Real-time platform status</p>
            </div>
            <div className={cn(
              "text-4xl font-bold",
              overallHealth >= 98 ? "text-green-500" :
              overallHealth >= 90 ? "text-amber-500" : "text-red-500"
            )}>
              {overallHealth.toFixed(1)}%
            </div>
          </div>
          <Progress 
            value={overallHealth} 
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const statusConfig = getStatusConfig(metric.status);
          const StatusIcon = statusConfig.icon;
          const percentage = (metric.value / metric.threshold) * 100;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "border-0 bg-card/50 backdrop-blur-xl transition-all hover:shadow-lg",
                metric.status === "degraded" && "ring-1 ring-amber-500/30",
                metric.status === "critical" && "ring-1 ring-red-500/30"
              )}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground truncate">{metric.name}</p>
                    <p className="text-xl font-bold">
                      {metric.value}{metric.unit}
                    </p>
                  </div>
                  
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={cn(
                      "h-1.5",
                      metric.status === "degraded" && "[&>div]:bg-amber-500",
                      metric.status === "critical" && "[&>div]:bg-red-500"
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Services Status */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service, index) => {
              const statusConfig = getStatusConfig(service.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all",
                    service.status === "operational" ? "bg-muted/30" :
                    service.status === "degraded" ? "bg-amber-500/5 border border-amber-500/20" :
                    "bg-red-500/5 border border-red-500/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", statusConfig.bg)} />
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      {service.lastIncident && (
                        <p className="text-xs text-muted-foreground">
                          Last incident: {service.lastIncident}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className={cn("text-xs", statusConfig.color)}>
                      {service.uptime}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uptime History */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            90-Day Uptime History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-0.5">
            {Array.from({ length: 90 }).map((_, i) => {
              const isGreen = Math.random() > 0.05;
              const isYellow = !isGreen && Math.random() > 0.3;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-8 rounded-sm transition-colors hover:opacity-80",
                    isGreen ? "bg-green-500" : isYellow ? "bg-amber-500" : "bg-red-500"
                  )}
                  title={`Day ${90 - i}: ${isGreen ? "100%" : isYellow ? "99.5%" : "98%"} uptime`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>90 days ago</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-green-500" /> 100%
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-amber-500" /> Degraded
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-500" /> Outage
              </span>
            </div>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlatformHealth;
