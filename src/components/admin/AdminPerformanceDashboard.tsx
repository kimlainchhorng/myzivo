import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gauge, 
  Zap, 
  Clock,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: { good: number; warning: number };
  isLowerBetter: boolean;
  icon: React.ElementType;
  trend: number;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: "api-latency",
    name: "API Latency",
    value: 45,
    unit: "ms",
    threshold: { good: 100, warning: 200 },
    isLowerBetter: true,
    icon: Zap,
    trend: -8,
  },
  {
    id: "page-load",
    name: "Page Load Time",
    value: 1.2,
    unit: "s",
    threshold: { good: 2, warning: 4 },
    isLowerBetter: true,
    icon: Clock,
    trend: -15,
  },
  {
    id: "uptime",
    name: "Uptime",
    value: 99.98,
    unit: "%",
    threshold: { good: 99.9, warning: 99.5 },
    isLowerBetter: false,
    icon: Activity,
    trend: 0.02,
  },
  {
    id: "error-rate",
    name: "Error Rate",
    value: 0.12,
    unit: "%",
    threshold: { good: 1, warning: 3 },
    isLowerBetter: true,
    icon: AlertTriangle,
    trend: -0.05,
  },
];

const serverMetrics = [
  { id: "cpu", name: "CPU Usage", value: 42, icon: Cpu, color: "text-blue-500" },
  { id: "memory", name: "Memory", value: 68, icon: Server, color: "text-violet-500" },
  { id: "disk", name: "Disk I/O", value: 35, icon: HardDrive, color: "text-green-500" },
  { id: "network", name: "Network", value: 52, icon: Wifi, color: "text-amber-500" },
];

const databaseMetrics = {
  connections: { current: 45, max: 100 },
  queryTime: 12,
  cacheHitRate: 94.5,
  activeQueries: 8,
};

const getPerformanceStatus = (metric: PerformanceMetric) => {
  const { value, threshold, isLowerBetter } = metric;
  if (isLowerBetter) {
    if (value <= threshold.good) return "good";
    if (value <= threshold.warning) return "warning";
    return "critical";
  } else {
    if (value >= threshold.good) return "good";
    if (value >= threshold.warning) return "warning";
    return "critical";
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "good":
      return { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
    case "warning":
      return { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle };
    case "critical":
      return { color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted", icon: Activity };
  }
};

const AdminPerformanceDashboard = () => {
  const overallHealth = performanceMetrics.filter(m => getPerformanceStatus(m) === "good").length;
  const healthPercent = Math.round((overallHealth / performanceMetrics.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            Performance Dashboard
          </h2>
          <p className="text-muted-foreground">System performance and infrastructure health</p>
        </div>
        <Badge variant="secondary" className={cn(
          "px-4 py-2 text-lg font-bold",
          healthPercent >= 75 ? "bg-green-500/10 text-green-500" :
          healthPercent >= 50 ? "bg-amber-500/10 text-amber-500" :
          "bg-red-500/10 text-red-500"
        )}>
          {healthPercent}% Healthy
        </Badge>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceMetrics.map((metric, index) => {
          const status = getPerformanceStatus(metric);
          const statusConfig = getStatusConfig(status);
          const Icon = metric.icon;
          const StatusIcon = statusConfig.icon;
          const trendIsGood = metric.isLowerBetter ? metric.trend < 0 : metric.trend > 0;

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", statusConfig.bg)}>
                      <Icon className={cn("h-6 w-6", statusConfig.color)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                      <span className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        trendIsGood ? "text-green-500" : "text-red-500"
                      )}>
                        {metric.trend >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(metric.trend)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-muted-foreground">{metric.unit}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Server Resources */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Server Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serverMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const status = metric.value < 60 ? "good" : metric.value < 80 ? "warning" : "critical";
              
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", metric.color)} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      status === "good" ? "text-green-500" :
                      status === "warning" ? "text-amber-500" : "text-red-500"
                    )}>
                      {metric.value}%
                    </span>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className={cn(
                      "h-2",
                      status === "critical" && "[&>div]:bg-red-500"
                    )} 
                  />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Database Performance */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Connections</span>
                </div>
                <p className="text-2xl font-bold">
                  {databaseMetrics.connections.current}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{databaseMetrics.connections.max}
                  </span>
                </p>
                <Progress 
                  value={(databaseMetrics.connections.current / databaseMetrics.connections.max) * 100} 
                  className="h-1.5 mt-2" 
                />
              </div>
              <div className="p-4 rounded-xl bg-green-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Query Time</span>
                </div>
                <p className="text-2xl font-bold">
                  {databaseMetrics.queryTime}
                  <span className="text-sm text-muted-foreground font-normal">ms avg</span>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-violet-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-violet-500" />
                  <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {databaseMetrics.cacheHitRate}
                  <span className="text-sm text-muted-foreground font-normal">%</span>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Active Queries</span>
                </div>
                <p className="text-2xl font-bold">{databaseMetrics.activeQueries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPerformanceDashboard;
