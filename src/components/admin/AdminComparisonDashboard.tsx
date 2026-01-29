import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ArrowRight,
  DollarSign,
  Users,
  Car,
  Utensils,
  MapPin,
  Clock
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComparisonMetric {
  id: string;
  label: string;
  icon: React.ElementType;
  period1Value: number;
  period2Value: number;
  unit: string;
  format: "currency" | "number" | "percent" | "time";
}

const comparisonMetrics: ComparisonMetric[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    icon: DollarSign,
    period1Value: 485000,
    period2Value: 425000,
    unit: "$",
    format: "currency",
  },
  {
    id: "users",
    label: "Active Users",
    icon: Users,
    period1Value: 28500,
    period2Value: 24200,
    unit: "",
    format: "number",
  },
  {
    id: "trips",
    label: "Total Trips",
    icon: MapPin,
    period1Value: 142500,
    period2Value: 128000,
    unit: "",
    format: "number",
  },
  {
    id: "orders",
    label: "Food Orders",
    icon: Utensils,
    period1Value: 67800,
    period2Value: 58500,
    unit: "",
    format: "number",
  },
  {
    id: "drivers",
    label: "Active Drivers",
    icon: Car,
    period1Value: 2450,
    period2Value: 2180,
    unit: "",
    format: "number",
  },
  {
    id: "avg-time",
    label: "Avg Wait Time",
    icon: Clock,
    period1Value: 4.2,
    period2Value: 5.1,
    unit: "min",
    format: "time",
  },
];

const chartData = [
  { name: "Mon", period1: 68500, period2: 58200 },
  { name: "Tue", period1: 72400, period2: 61800 },
  { name: "Wed", period1: 69800, period2: 60500 },
  { name: "Thu", period1: 75200, period2: 64200 },
  { name: "Fri", period1: 82500, period2: 71500 },
  { name: "Sat", period1: 91200, period2: 78500 },
  { name: "Sun", period1: 86400, period2: 74800 },
];

const AdminComparisonDashboard = () => {
  const [period1, setPeriod1] = useState("this-week");
  const [period2, setPeriod2] = useState("last-week");

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return `$${(value / 1000).toFixed(0)}K`;
      case "number":
        return value.toLocaleString();
      case "percent":
        return `${value}%`;
      case "time":
        return `${value} min`;
      default:
        return value.toString();
    }
  };

  const getChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            Period Comparison
          </h2>
          <p className="text-muted-foreground">Compare metrics across time periods</p>
        </div>
        
        {/* Period Selectors */}
        <div className="flex items-center gap-3">
          <Select value={period1} onValueChange={setPeriod1}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Select value={period2} onValueChange={setPeriod2}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period 2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {comparisonMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const change = parseFloat(getChange(metric.period1Value, metric.period2Value));
          const isPositive = metric.id === "avg-time" ? change < 0 : change > 0;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                      isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(change)}%
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">
                        {formatValue(metric.period1Value, metric.format)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs {formatValue(metric.period2Value, metric.format)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Revenue Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
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
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Bar 
                  dataKey="period1" 
                  name="This Week" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="period2" 
                  name="Last Week" 
                  fill="hsl(var(--muted-foreground))" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">+14.1%</p>
            <p className="text-sm text-muted-foreground">Overall Growth</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-500">+4,300</p>
            <p className="text-sm text-muted-foreground">New Users</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-violet-500">$60K</p>
            <p className="text-sm text-muted-foreground">Revenue Increase</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminComparisonDashboard;
