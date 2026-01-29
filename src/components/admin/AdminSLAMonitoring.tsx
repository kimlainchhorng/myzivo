import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  TrendingUp,
  Zap,
  Shield
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: "met" | "warning" | "breached";
  trend: "up" | "down" | "stable";
}

const slaMetrics: SLAMetric[] = [
  { name: "Ride Response Time", target: 5, current: 3.8, unit: "min", status: "met", trend: "up" },
  { name: "Driver Arrival Time", target: 10, current: 8.2, unit: "min", status: "met", trend: "stable" },
  { name: "Support First Response", target: 2, current: 2.5, unit: "min", status: "warning", trend: "down" },
  { name: "Food Delivery Time", target: 45, current: 42, unit: "min", status: "met", trend: "up" },
  { name: "Refund Processing", target: 24, current: 18, unit: "hr", status: "met", trend: "up" },
  { name: "Document Verification", target: 48, current: 52, unit: "hr", status: "breached", trend: "down" }
];

const trendData = [
  { time: "00:00", compliance: 98.2 },
  { time: "04:00", compliance: 97.8 },
  { time: "08:00", compliance: 95.5 },
  { time: "12:00", compliance: 94.2 },
  { time: "16:00", compliance: 96.8 },
  { time: "20:00", compliance: 97.5 },
  { time: "24:00", compliance: 98.0 }
];

const getStatusIcon = (status: SLAMetric["status"]) => {
  switch (status) {
    case "met": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "breached": return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusColor = (status: SLAMetric["status"]) => {
  switch (status) {
    case "met": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "warning": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "breached": return "bg-red-500/10 text-red-500 border-red-500/20";
  }
};

const AdminSLAMonitoring = () => {
  const metCount = slaMetrics.filter(m => m.status === "met").length;
  const overallCompliance = ((metCount / slaMetrics.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            SLA Monitoring
          </h2>
          <p className="text-muted-foreground">Track service level agreement compliance</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Real-time
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{metCount}</p>
                <p className="text-xs text-muted-foreground">SLAs Met</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{slaMetrics.filter(m => m.status === "warning").length}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{slaMetrics.filter(m => m.status === "breached").length}</p>
                <p className="text-xs text-muted-foreground">Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallCompliance}%</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              SLA Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {slaMetrics.map((metric) => {
              const progress = Math.min((metric.target / metric.current) * 100, 100);
              const isUnderTarget = metric.current <= metric.target;
              
              return (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-bold",
                        isUnderTarget ? "text-green-500" : "text-red-500"
                      )}>
                        {metric.current} {metric.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {metric.target} {metric.unit}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={isUnderTarget ? 100 : (metric.target / metric.current) * 100}
                    className={cn(
                      "h-2",
                      metric.status === "met" ? "[&>div]:bg-green-500" :
                      metric.status === "warning" ? "[&>div]:bg-amber-500" :
                      "[&>div]:bg-red-500"
                    )}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              24h Compliance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis domain={[90, 100]} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Compliance']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorCompliance)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSLAMonitoring;
