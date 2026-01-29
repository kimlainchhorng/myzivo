import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay, eachDayOfInterval } from "date-fns";

const usePerformanceData = (days: number) => {
  return useQuery({
    queryKey: ["performance-data", days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Fetch trips for the period
      const { data: trips } = await supabase
        .from("trips")
        .select("created_at, fare_amount")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Fetch food orders for the period
      const { data: orders } = await supabase
        .from("food_orders")
        .select("created_at, total_amount")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Generate all days in the range
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Group data by day
      const dataMap = new Map<string, { revenue: number; trips: number; orders: number }>();
      
      allDays.forEach(day => {
        const dateKey = format(startOfDay(day), 'yyyy-MM-dd');
        dataMap.set(dateKey, { revenue: 0, trips: 0, orders: 0 });
      });

      // Aggregate trips
      trips?.forEach(trip => {
        const dateKey = format(startOfDay(new Date(trip.created_at)), 'yyyy-MM-dd');
        const existing = dataMap.get(dateKey);
        if (existing) {
          existing.revenue += trip.fare_amount || 0;
          existing.trips += 1;
        }
      });

      // Aggregate orders
      orders?.forEach(order => {
        const dateKey = format(startOfDay(new Date(order.created_at)), 'yyyy-MM-dd');
        const existing = dataMap.get(dateKey);
        if (existing) {
          existing.revenue += order.total_amount || 0;
          existing.orders += 1;
        }
      });

      // Convert to array and format for chart
      return Array.from(dataMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dateKey, values]) => ({
          date: format(new Date(dateKey), 'MMM d'),
          ...values
        }));
    },
    refetchInterval: 60000,
  });
};

const AdminPerformanceChart = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [metric, setMetric] = useState<"revenue" | "trips" | "orders">("revenue");

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const { data = [], isLoading } = usePerformanceData(days);

  const getMetricConfig = () => {
    switch (metric) {
      case "revenue":
        return { 
          color: "hsl(var(--primary))", 
          label: "Revenue",
          formatter: (value: number) => `$${value.toLocaleString()}`
        };
      case "trips":
        return { 
          color: "#22c55e", 
          label: "Trips",
          formatter: (value: number) => value.toString()
        };
      case "orders":
        return { 
          color: "#f59e0b", 
          label: "Orders",
          formatter: (value: number) => value.toString()
        };
    }
  };

  const config = getMetricConfig();

  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, avg: 0, change: 0 };
    
    const totalValue = data.reduce((acc, item) => acc + (item[metric] || 0), 0);
    const avgValue = totalValue / data.length;
    const lastValue = data[data.length - 1]?.[metric] || 0;
    const prevValue = data[data.length - 2]?.[metric] || lastValue;
    const changePercent = prevValue !== 0 ? ((lastValue - prevValue) / prevValue * 100) : 0;
    
    return {
      total: totalValue,
      avg: Math.round(avgValue),
      change: changePercent.toFixed(1)
    };
  }, [data, metric]);

  if (isLoading) {
    return (
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Performance Overview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
              <TabsList className="bg-muted/30 h-8">
                <TabsTrigger value="revenue" className="text-xs px-3 h-6">Revenue</TabsTrigger>
                <TabsTrigger value="trips" className="text-xs px-3 h-6">Trips</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs px-3 h-6">Orders</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList className="bg-muted/30 h-8">
                <TabsTrigger value="7d" className="text-xs px-2 h-6">7D</TabsTrigger>
                <TabsTrigger value="30d" className="text-xs px-2 h-6">30D</TabsTrigger>
                <TabsTrigger value="90d" className="text-xs px-2 h-6">90D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Total {config.label}</p>
            <p className="text-lg font-bold">{config.formatter(stats.total)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Daily Average</p>
            <p className="text-lg font-bold">{config.formatter(stats.avg)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">vs Yesterday</p>
            <p className={`text-lg font-bold ${Number(stats.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(stats.change) >= 0 ? '+' : ''}{stats.change}%
            </p>
          </div>
        </div>

        <div className="h-[250px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">No data available for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => metric === "revenue" ? `$${(value / 1000).toFixed(0)}k` : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [config.formatter(value), config.label]}
                />
                <Area 
                  type="monotone" 
                  dataKey={metric} 
                  stroke={config.color} 
                  strokeWidth={2}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPerformanceChart;
