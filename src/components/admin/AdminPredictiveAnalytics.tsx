import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  DollarSign
} from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const forecastData = [
  { month: "Jan", actual: 425000, forecast: null, lower: null, upper: null },
  { month: "Feb", actual: 445000, forecast: null, lower: null, upper: null },
  { month: "Mar", actual: 478000, forecast: null, lower: null, upper: null },
  { month: "Apr", actual: 485000, forecast: null, lower: null, upper: null },
  { month: "May", actual: 512000, forecast: null, lower: null, upper: null },
  { month: "Jun", actual: 545000, forecast: 545000, lower: 520000, upper: 570000 },
  { month: "Jul", actual: null, forecast: 578000, lower: 545000, upper: 610000 },
  { month: "Aug", actual: null, forecast: 612000, lower: 575000, upper: 650000 },
  { month: "Sep", actual: null, forecast: 648000, lower: 605000, upper: 690000 },
  { month: "Oct", actual: null, forecast: 685000, lower: 638000, upper: 732000 },
  { month: "Nov", actual: null, forecast: 725000, lower: 672000, upper: 778000 },
  { month: "Dec", actual: null, forecast: 768000, lower: 710000, upper: 826000 },
];

const kpiForecast = [
  {
    id: "revenue",
    label: "Annual Revenue",
    current: 545000,
    forecast: 768000,
    growth: 41,
    status: "on_track",
  },
  {
    id: "users",
    label: "Active Users",
    current: 28500,
    forecast: 45000,
    growth: 58,
    status: "ahead",
  },
  {
    id: "drivers",
    label: "Driver Network",
    current: 2450,
    forecast: 3200,
    growth: 31,
    status: "at_risk",
  },
  {
    id: "orders",
    label: "Monthly Orders",
    current: 142500,
    forecast: 225000,
    growth: 58,
    status: "on_track",
  },
];

const AdminPredictiveAnalytics = () => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ahead":
        return { color: "text-green-500", bg: "bg-green-500/10", label: "Ahead of Target" };
      case "on_track":
        return { color: "text-blue-500", bg: "bg-blue-500/10", label: "On Track" };
      case "at_risk":
        return { color: "text-amber-500", bg: "bg-amber-500/10", label: "At Risk" };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            Predictive Analytics
          </h2>
          <p className="text-muted-foreground">AI-powered forecasts and projections</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Model Accuracy: 94.2%
        </Badge>
      </div>

      {/* KPI Forecasts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiForecast.map((kpi, index) => {
          const statusConfig = getStatusConfig(kpi.status);
          
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                      <TrendingUp className="h-3 w-3" />
                      +{kpi.growth}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {kpi.id === "revenue" ? `$${(kpi.forecast / 1000).toFixed(0)}K` : kpi.forecast.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      from {kpi.id === "revenue" ? `$${(kpi.current / 1000).toFixed(0)}K` : kpi.current.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Forecast Chart */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Forecast
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-primary rounded" />
                Actual
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-primary/50 rounded" style={{ borderStyle: "dashed" }} />
                Forecast
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary/10 rounded" />
                Confidence Range
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value?.toLocaleString() || 'N/A'}`, ""]}
                />
                {/* Confidence Range */}
                <Area 
                  type="monotone" 
                  dataKey="upper" 
                  stroke="transparent"
                  fill="url(#confidenceGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="lower" 
                  stroke="transparent"
                  fill="hsl(var(--background))"
                />
                {/* Actual Line */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                  connectNulls={false}
                />
                {/* Forecast Line */}
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">+41%</p>
            <p className="text-sm text-muted-foreground">Projected YoY Growth</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">$768K</p>
            <p className="text-sm text-muted-foreground">December Target</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-violet-500">Q4</p>
            <p className="text-sm text-muted-foreground">Peak Growth Quarter</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPredictiveAnalytics;
