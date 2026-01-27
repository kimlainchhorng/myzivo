import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Car, 
  Utensils, 
  Plane, 
  Building2,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GrowthMetric {
  id: string;
  label: string;
  icon: React.ElementType;
  current: number;
  previous: number;
  target: number;
  color: string;
  trend: number[];
}

const growthMetrics: GrowthMetric[] = [
  {
    id: "users",
    label: "User Growth",
    icon: Users,
    current: 12450,
    previous: 10800,
    target: 15000,
    color: "hsl(var(--primary))",
    trend: [100, 120, 115, 140, 165, 180, 195, 210, 230, 248, 265, 280],
  },
  {
    id: "drivers",
    label: "Driver Network",
    icon: Car,
    current: 2340,
    previous: 2100,
    target: 3000,
    color: "#22c55e",
    trend: [50, 58, 62, 70, 75, 82, 88, 94, 100, 108, 115, 124],
  },
  {
    id: "restaurants",
    label: "Restaurant Partners",
    icon: Utensils,
    current: 856,
    previous: 720,
    target: 1000,
    color: "#f59e0b",
    trend: [30, 35, 42, 48, 55, 62, 68, 74, 80, 86, 92, 98],
  },
  {
    id: "flights",
    label: "Flight Bookings",
    icon: Plane,
    current: 4520,
    previous: 3800,
    target: 6000,
    color: "#0ea5e9",
    trend: [150, 165, 180, 200, 220, 250, 280, 320, 360, 400, 440, 480],
  },
  {
    id: "hotels",
    label: "Hotel Reservations",
    icon: Building2,
    current: 2180,
    previous: 1900,
    target: 3000,
    color: "#8b5cf6",
    trend: [80, 90, 100, 115, 130, 145, 160, 175, 190, 205, 220, 235],
  },
];

const AdminGrowthMetrics = () => {
  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Growth Metrics
          </CardTitle>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            All metrics up
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {growthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const growthPercent = ((metric.current - metric.previous) / metric.previous * 100).toFixed(1);
          const isPositive = metric.current > metric.previous;
          const progressPercent = (metric.current / metric.target) * 100;
          
          const chartData = metric.trend.map((value, i) => ({
            name: i.toString(),
            value,
          }));
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all">
                {/* Icon & Label */}
                <div className="flex items-center gap-3 w-[140px] shrink-0">
                  <div 
                    className="p-2 rounded-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: metric.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Mini Sparkline */}
                <div className="w-24 h-10 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metric.color}
                        strokeWidth={1.5}
                        fill={`url(#gradient-${metric.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Progress */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{metric.current.toLocaleString()}</span>
                    <span className="text-muted-foreground">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(progressPercent, 100)} 
                    className="h-1.5"
                    style={{ 
                      "--progress-background": `${metric.color}20`,
                      "--progress-foreground": metric.color,
                    } as React.CSSProperties}
                  />
                </div>
                
                {/* Growth Indicator */}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0",
                  isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {growthPercent}%
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Summary Footer */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Overall target completion</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={75} className="w-24 h-2" />
              <span className="font-semibold">75%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminGrowthMetrics;
