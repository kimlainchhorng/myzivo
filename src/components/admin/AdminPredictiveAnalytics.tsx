import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  Plane,
  Building,
  Car,
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
import {
  getAllMonthlyProjections,
  calculateMonthlyProjection,
  getAnnualRunRate,
} from "@/config/revenueAssumptions";

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminPredictiveAnalytics = () => {
  // Use real projection data from revenueAssumptions
  const projections = useMemo(() => getAllMonthlyProjections(), []);
  const month6 = useMemo(() => calculateMonthlyProjection(6), []);
  const month12 = useMemo(() => calculateMonthlyProjection(12), []);
  const annualRunRate = useMemo(() => getAnnualRunRate(), []);

  // Transform projections for chart with confidence bands
  const forecastData = useMemo(() => 
    projections.map((p, i) => ({
      month: MONTH_NAMES[p.month - 1],
      actual: i < 6 ? p.totalRevenue : null,
      forecast: i >= 5 ? p.totalRevenue : null,
      lower: i >= 5 ? Math.round(p.totalRevenue * 0.85) : null,
      upper: i >= 5 ? Math.round(p.totalRevenue * 1.15) : null,
    })), [projections]);

  // KPI forecasts based on real data
  const kpiForecast = useMemo(() => [
    {
      id: "month6",
      label: "Month 6 Revenue",
      current: month6.totalRevenue,
      forecast: month6.totalRevenue,
      growth: 0,
      status: "on_track",
      icon: Target,
    },
    {
      id: "month12",
      label: "Month 12 Revenue",
      current: month6.totalRevenue,
      forecast: month12.totalRevenue,
      growth: Math.round(((month12.totalRevenue - month6.totalRevenue) / month6.totalRevenue) * 100),
      status: "on_track",
      icon: TrendingUp,
    },
    {
      id: "annual",
      label: "Annual Run Rate",
      current: month6.totalRevenue * 12,
      forecast: annualRunRate,
      growth: Math.round(((annualRunRate - (month6.totalRevenue * 12)) / (month6.totalRevenue * 12)) * 100),
      status: "ahead",
      icon: DollarSign,
    },
    {
      id: "hotels",
      label: "Hotels (Primary)",
      current: month6.hotels.revenue,
      forecast: month12.hotels.revenue,
      growth: Math.round(((month12.hotels.revenue - month6.hotels.revenue) / month6.hotels.revenue) * 100),
      status: "ahead",
      icon: Building,
    },
  ], [month6, month12, annualRunRate]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ahead":
        return { color: "text-green-500", bg: "bg-green-500/10", label: "Strong" };
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
            Revenue Forecast
          </h2>
          <p className="text-muted-foreground">Hizovo OTA commission projections (conservative model)</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Updated: Feb 2, 2026
        </Badge>
      </div>

      {/* KPI Forecasts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiForecast.map((kpi, index) => {
          const statusConfig = getStatusConfig(kpi.status);
          const Icon = kpi.icon;
          
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
                    {kpi.growth > 0 && (
                      <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        +{kpi.growth}%
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {kpi.forecast >= 1000000 
                        ? `$${(kpi.forecast / 1000000).toFixed(1)}M`
                        : `$${(kpi.forecast / 1000).toFixed(0)}K`}
                    </span>
                    {kpi.id !== "month6" && kpi.current !== kpi.forecast && (
                      <span className="text-xs text-muted-foreground">
                        from ${(kpi.current / 1000).toFixed(0)}K
                      </span>
                    )}
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

      {/* Service Breakdown Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-sky-500/10 to-blue-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <Plane className="h-8 w-8 text-sky-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-sky-500">${(month12.flights.revenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Flights (Volume Driver)</p>
            <p className="text-xs text-muted-foreground mt-1">{month12.flights.bookings} bookings @ $6</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <Building className="h-8 w-8 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-violet-500">${(month12.hotels.revenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Hotels (Revenue Engine)</p>
            <p className="text-xs text-muted-foreground mt-1">{month12.hotels.bookings} bookings @ $32</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <Car className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-500">${(month12.cars.revenue / 1000).toFixed(0)}K</p>
            <p className="text-sm text-muted-foreground">Cars (Incremental)</p>
            <p className="text-xs text-muted-foreground mt-1">{month12.cars.bookings} bookings @ $8</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Notes */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Strategic Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Flights = volume + traffic driver</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span>Hotels = primary revenue engine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cars = incremental upside</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>No inventory risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>No payment liability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Scales with SEO + ads</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPredictiveAnalytics;
