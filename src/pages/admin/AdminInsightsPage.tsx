/**
 * Admin AI Insights Page
 * Actionable insights dashboard with demand forecasting and anomaly detection
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Store,
  RefreshCw,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useInsightsSummary } from "@/hooks/useInsights";
import ZoneDemandPanel from "@/components/insights/ZoneDemandPanel";
import DecliningMerchantsTable from "@/components/insights/DecliningMerchantsTable";
import AnomalySignalsPanel from "@/components/insights/AnomalySignalsPanel";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const trendIcons = {
  increasing: TrendingUp,
  stable: TrendingDown,
  decreasing: TrendingDown,
};

const trendColors = {
  increasing: "text-green-400",
  stable: "text-white/60",
  decreasing: "text-red-400",
};

const AdminInsightsPage = () => {
  const { data, isLoading, refetch } = useInsightsSummary();
  const [activeTab, setActiveTab] = useState("overview");

  const TrendIcon = data?.forecast.trend ? trendIcons[data.forecast.trend] : TrendingUp;
  const trendColor = data?.forecast.trend ? trendColors[data.forecast.trend] : "text-white/60";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                AI Insights
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </h1>
              <p className="text-sm text-white/40">Actionable predictions & alerts</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 py-6 space-y-6"
      >
        {/* Summary Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Peak Hours Card */}
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Predicted Peak</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 bg-white/10 mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {data?.forecast.peakHours[0]?.start || "—"} - {data?.forecast.peakHours[0]?.end || "—"}
                    </p>
                  )}
                </div>
              </div>
              {!isLoading && data?.forecast.peakHours[0] && (
                <p className="text-sm text-white/60">
                  ~{data.forecast.peakHours[0].expectedOrders} orders expected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Suggested Drivers Card */}
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Drivers Needed</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-white/10 mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {data?.summary.suggestedDrivers || 0}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                <span className={trendColor}>
                  {data?.forecast.trend === "increasing"
                    ? "Demand rising"
                    : data?.forecast.trend === "decreasing"
                    ? "Demand falling"
                    : "Stable demand"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Zone Shortages Card */}
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Zone Shortages</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-white/10 mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {data?.summary.criticalZones || 0} critical
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-white/60">
                {data?.summary.warningZones || 0} warning zones
              </p>
            </CardContent>
          </Card>

          {/* Anomalies Card */}
          <Card className="bg-zinc-900/80 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Anomalies</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 bg-white/10 mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {data?.summary.unresolvedAnomalies || 0} unresolved
                    </p>
                  )}
                </div>
              </div>
              {!isLoading && (data?.summary.criticalAnomalies || 0) > 0 && (
                <Badge variant="destructive">{data?.summary.criticalAnomalies} critical</Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 24-Hour Forecast Chart */}
        <motion.div variants={item}>
          <Card className="bg-zinc-900/80 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                24-Hour Demand Forecast
              </CardTitle>
              <CardDescription className="text-white/40">
                Based on last {data?.forecast.basedOnDays || 7} days of orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data?.forecast.hourlyForecast || []}>
                    <defs>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="hour"
                      stroke="rgba(255,255,255,0.4)"
                      tickFormatter={(h) => `${h}:00`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(h) => `${h}:00`}
                      formatter={(value: number) => [value, "Expected Orders"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="expectedOrders"
                      stroke="hsl(var(--primary))"
                      fill="url(#forecastGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for detailed sections */}
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="zones">Zone Gaps</TabsTrigger>
              <TabsTrigger value="merchants">Merchants</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <ZoneDemandPanel limit={5} />
                <AnomalySignalsPanel limit={5} />
              </div>
              <DecliningMerchantsTable limit={5} />
            </TabsContent>

            <TabsContent value="zones">
              <ZoneDemandPanel limit={20} />
            </TabsContent>

            <TabsContent value="merchants">
              <DecliningMerchantsTable limit={20} />
            </TabsContent>

            <TabsContent value="anomalies">
              <AnomalySignalsPanel limit={30} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Back to Admin */}
        <motion.div variants={item} className="pt-4">
          <Link to="/admin">
            <Button variant="outline" className="border-white/10">
              ← Back to Admin Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminInsightsPage;
