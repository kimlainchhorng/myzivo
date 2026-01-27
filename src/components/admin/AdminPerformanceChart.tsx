import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";

const generateMockData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 2000,
      trips: Math.floor(Math.random() * 150) + 50,
      orders: Math.floor(Math.random() * 100) + 30,
      users: Math.floor(Math.random() * 50) + 10
    });
  }
  return data;
};

const AdminPerformanceChart = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [metric, setMetric] = useState<"revenue" | "trips" | "orders">("revenue");

  const data = generateMockData(
    timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
  );

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

  const totalValue = data.reduce((acc, item) => acc + item[metric], 0);
  const avgValue = totalValue / data.length;
  const lastValue = data[data.length - 1][metric];
  const prevValue = data[data.length - 2]?.[metric] || lastValue;
  const changePercent = ((lastValue - prevValue) / prevValue * 100).toFixed(1);

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
            <p className="text-lg font-bold">{config.formatter(totalValue)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Daily Average</p>
            <p className="text-lg font-bold">{config.formatter(Math.round(avgValue))}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">vs Yesterday</p>
            <p className={`text-lg font-bold ${Number(changePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(changePercent) >= 0 ? '+' : ''}{changePercent}%
            </p>
          </div>
        </div>

        <div className="h-[250px]">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPerformanceChart;
