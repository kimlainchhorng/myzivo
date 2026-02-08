/**
 * Orders Analytics Page
 * Detailed order trends, status breakdown, and peak hours
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersTrend, useOrdersByStatus, usePeakHours } from "@/hooks/useAdminAnalytics";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DateRange } from "@/lib/analytics";

type DateRangeOption = "7days" | "30days" | "90days";

function getDateRange(option: DateRangeOption): DateRange {
  const end = new Date();
  const start = new Date();
  
  switch (option) {
    case "7days":
      start.setDate(start.getDate() - 7);
      break;
    case "30days":
      start.setDate(start.getDate() - 30);
      break;
    case "90days":
      start.setDate(start.getDate() - 90);
      break;
  }
  
  return { start, end };
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  ready_for_pickup: "#06b6d4",
  out_for_delivery: "#0ea5e9",
  cancelled: "#ef4444",
  refunded: "#6b7280",
};

const AnalyticsOrders = () => {
  const [rangeOption, setRangeOption] = useState<DateRangeOption>("30days");
  const dateRange = useMemo(() => getDateRange(rangeOption), [rangeOption]);

  const { data: ordersTrend, isLoading: trendLoading, refetch } = useOrdersTrend(dateRange);
  const { data: statusData, isLoading: statusLoading } = useOrdersByStatus(dateRange);
  const { data: peakHours, isLoading: peakLoading } = usePeakHours(dateRange);

  const pieData = statusData?.map((s) => ({
    name: s.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: s.count,
    color: STATUS_COLORS[s.status] || "#6b7280",
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/analytics">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-2 rounded-xl bg-blue-500/10">
              <ShoppingCart className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Orders Analytics</h1>
              <p className="text-sm text-muted-foreground">Trends, status, and peak hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={rangeOption} onValueChange={(v) => setRangeOption(v as DateRangeOption)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="7days">7 Days</TabsTrigger>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="90days">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Orders Trend */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle>Orders Per Day</CardTitle>
              <CardDescription>Total, delivered, and cancelled orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={ordersTrend}>
                    <defs>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="url(#ordersGrad)" strokeWidth={2} name="Total" />
                    <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="url(#deliveredGrad)" strokeWidth={2} name="Delivered" />
                    <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={false} name="Cancelled" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 bg-card/50 h-full">
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Distribution across all statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {statusLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {pieData?.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Peak Hours */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 bg-card/50 h-full">
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Orders distribution by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                {peakLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={peakHours?.filter((h) => h.hour >= 6 && h.hour <= 23)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOrders;
