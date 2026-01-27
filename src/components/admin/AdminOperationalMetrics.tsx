import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Timer,
  Gauge,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OperationalKPI {
  id: string;
  label: string;
  value: string;
  target: string;
  progress: number;
  status: "excellent" | "good" | "warning" | "critical";
  trend: number;
  unit?: string;
}

const operationalKPIs: OperationalKPI[] = [
  {
    id: "pickup-time",
    label: "Avg. Pickup Time",
    value: "4.2",
    target: "5",
    progress: 118,
    status: "excellent",
    trend: -8.5,
    unit: "min",
  },
  {
    id: "delivery-time",
    label: "Avg. Delivery Time",
    value: "28",
    target: "30",
    progress: 107,
    status: "good",
    trend: -3.2,
    unit: "min",
  },
  {
    id: "success-rate",
    label: "Order Success Rate",
    value: "98.2",
    target: "99",
    progress: 99.2,
    status: "good",
    trend: 0.5,
    unit: "%",
  },
  {
    id: "driver-util",
    label: "Driver Utilization",
    value: "76",
    target: "80",
    progress: 95,
    status: "good",
    trend: 4.2,
    unit: "%",
  },
  {
    id: "cancellation",
    label: "Cancellation Rate",
    value: "3.8",
    target: "3",
    progress: 79,
    status: "warning",
    trend: 1.2,
    unit: "%",
  },
  {
    id: "support-tickets",
    label: "Support Resolution",
    value: "92",
    target: "95",
    progress: 96.8,
    status: "good",
    trend: 2.1,
    unit: "%",
  },
];

const statusConfig = {
  excellent: { color: "text-green-500", bg: "bg-green-500", label: "Excellent" },
  good: { color: "text-blue-500", bg: "bg-blue-500", label: "Good" },
  warning: { color: "text-amber-500", bg: "bg-amber-500", label: "Warning" },
  critical: { color: "text-destructive", bg: "bg-destructive", label: "Critical" },
};

const AdminOperationalMetrics = () => {
  const excellentCount = operationalKPIs.filter(k => k.status === "excellent" || k.status === "good").length;

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Operational Metrics
          </CardTitle>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            {excellentCount}/{operationalKPIs.length} On Target
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {operationalKPIs.map((kpi, index) => {
            const config = statusConfig[kpi.status];
            const isUnderTarget = kpi.progress < 100;
            
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "p-3 rounded-xl border transition-all group hover:shadow-md",
                  kpi.status === "warning" || kpi.status === "critical"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-muted/30 border-transparent"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-transform group-hover:scale-110",
                      `${config.bg}/10`
                    )}>
                      {kpi.status === "warning" || kpi.status === "critical" ? (
                        <AlertTriangle className={cn("h-3.5 w-3.5", config.color)} />
                      ) : kpi.progress >= 100 ? (
                        <CheckCircle2 className={cn("h-3.5 w-3.5", config.color)} />
                      ) : (
                        <Timer className={cn("h-3.5 w-3.5", config.color)} />
                      )}
                    </div>
                    <span className="text-sm font-medium">{kpi.label}</span>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    kpi.trend >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    <TrendingUp className={cn(
                      "h-3 w-3",
                      kpi.trend < 0 && "rotate-180"
                    )} />
                    {Math.abs(kpi.trend)}%
                  </div>
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground mb-0.5">
                    {kpi.unit} / {kpi.target}{kpi.unit}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <Progress 
                    value={Math.min(kpi.progress, 100)} 
                    className="h-1.5"
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{kpi.progress >= 100 ? "Target met" : `${(100 - kpi.progress).toFixed(1)}% to target`}</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px] h-4 px-1.5",
                      `${config.bg}/10`,
                      config.color
                    )}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Avg. Response</p>
            <p className="font-semibold text-green-500">1.2s</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="font-semibold text-green-500">99.99%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Issues</p>
            <p className="font-semibold text-amber-500">3</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOperationalMetrics;
