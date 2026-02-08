/**
 * Driver Analytics Page
 * Earnings, deliveries, and performance charts for drivers
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ArrowLeft, DollarSign, Truck, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDriverProfile } from "@/hooks/useDriverApp";
import { useDriverEarningsByDay, useDriverStats } from "@/hooks/useDriverAnalytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type PeriodOption = "7days" | "14days" | "30days";

const DriverAnalyticsPage = () => {
  const [period, setPeriod] = useState<PeriodOption>("7days");
  const days = period === "7days" ? 7 : period === "14days" ? 14 : 30;

  const { data: driver, isLoading: driverLoading } = useDriverProfile();
  const { data: earningsByDay, isLoading: earningsLoading } = useDriverEarningsByDay(driver?.id, days);
  const { data: stats, isLoading: statsLoading } = useDriverStats(driver?.id);

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="bg-zinc-900 border-white/10 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-white/60 mb-4">Unable to load driver profile.</p>
            <Link to="/driver">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/driver">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-2 rounded-xl bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">My Analytics</h1>
              <p className="text-xs text-white/40">Performance insights</p>
            </div>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodOption)}>
            <TabsList className="bg-white/5">
              <TabsTrigger value="7days" className="text-xs">7D</TabsTrigger>
              <TabsTrigger value="14days" className="text-xs">14D</TabsTrigger>
              <TabsTrigger value="30days" className="text-xs">30D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Today</span>
              </div>
              {statsLoading ? (
                <Skeleton className="h-7 w-20 bg-white/10" />
              ) : (
                <p className="text-xl font-bold">${stats?.todayEarnings.toFixed(2)}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">This Week</span>
              </div>
              {statsLoading ? (
                <Skeleton className="h-7 w-20 bg-white/10" />
              ) : (
                <p className="text-xl font-bold">${stats?.weekEarnings.toFixed(2)}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Truck className="h-4 w-4" />
                <span className="text-xs">Deliveries</span>
              </div>
              {statsLoading ? (
                <Skeleton className="h-7 w-16 bg-white/10" />
              ) : (
                <p className="text-xl font-bold">{stats?.totalDeliveries}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Avg Time</span>
              </div>
              {statsLoading ? (
                <Skeleton className="h-7 w-16 bg-white/10" />
              ) : (
                <p className="text-xl font-bold">{stats?.avgDeliveryTime} min</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zinc-900/80 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Earnings by Day
              </CardTitle>
              <CardDescription className="text-white/40">Daily earnings trend</CardDescription>
            </CardHeader>
            <CardContent>
              {earningsLoading ? (
                <Skeleton className="h-[200px] w-full bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={earningsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.4)"
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short" })}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Earnings"]}
                    />
                    <Bar dataKey="earnings" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Deliveries Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-zinc-900/80 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-400" />
                Deliveries by Day
              </CardTitle>
              <CardDescription className="text-white/40">Daily delivery count</CardDescription>
            </CardHeader>
            <CardContent>
              {earningsLoading ? (
                <Skeleton className="h-[180px] w-full bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={earningsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.4)"
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short" })}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="deliveries"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Earnings (Month)</p>
                  {statsLoading ? (
                    <Skeleton className="h-10 w-28 bg-white/10 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-green-400 mt-1">
                      ${stats?.totalEarnings.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverAnalyticsPage;
