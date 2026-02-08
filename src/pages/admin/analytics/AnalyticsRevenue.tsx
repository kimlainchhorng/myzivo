/**
 * Revenue Analytics Page
 * GMV, platform fees, and tips analysis
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, ArrowLeft, RefreshCw, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueTrend, useAdminKPIs } from "@/hooks/useAdminAnalytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
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

const AnalyticsRevenue = () => {
  const [rangeOption, setRangeOption] = useState<DateRangeOption>("30days");
  const dateRange = useMemo(() => getDateRange(rangeOption), [rangeOption]);

  const { data: revenueTrend, isLoading: trendLoading, refetch } = useRevenueTrend(dateRange);
  const { data: kpis, isLoading: kpisLoading } = useAdminKPIs(dateRange);

  // Calculate totals from trend
  const totals = useMemo(() => {
    if (!revenueTrend) return { gmv: 0, platformRevenue: 0, tips: 0 };
    return revenueTrend.reduce(
      (acc, day) => ({
        gmv: acc.gmv + day.gmv,
        platformRevenue: acc.platformRevenue + day.platformRevenue,
        tips: acc.tips + day.tips,
      }),
      { gmv: 0, platformRevenue: 0, tips: 0 }
    );
  }, [revenueTrend]);

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
            <div className="p-2 rounded-xl bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Revenue Analytics</h1>
              <p className="text-sm text-muted-foreground">GMV, platform fees, and tips</p>
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
        {/* Revenue KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-0 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">GMV</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">${totals.gmv.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Platform Revenue</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  ${totals.platformRevenue.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Tips</span>
              </div>
              {trendLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-amber-500">${totals.tips.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Avg Order Value</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  ${kpis?.totalOrders ? (totals.gmv / kpis.totalOrders).toFixed(2) : "0"}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle>Revenue Per Day</CardTitle>
              <CardDescription>GMV and platform revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
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
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="gmv" stroke="#3b82f6" fill="url(#gmvGrad)" strokeWidth={2} name="GMV" />
                    <Area type="monotone" dataKey="platformRevenue" stroke="#22c55e" fill="url(#revenueGrad)" strokeWidth={2} name="Platform Revenue" />
                    <Line type="monotone" dataKey="tips" stroke="#f59e0b" strokeWidth={2} dot={false} name="Tips" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Comparison */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle>Daily Revenue Comparison</CardTitle>
              <CardDescription>Bar chart of GMV vs Platform Revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueTrend?.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { day: "numeric" })}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="gmv" fill="#3b82f6" radius={[4, 4, 0, 0]} name="GMV" />
                    <Bar dataKey="platformRevenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Platform Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsRevenue;
