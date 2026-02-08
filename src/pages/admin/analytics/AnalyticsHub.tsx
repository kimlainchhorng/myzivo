/**
 * Admin Analytics Hub
 * Main dashboard with KPIs and navigation to sub-pages
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Clock,
  TrendingUp,
  Users,
  Store,
  Truck,
  ChevronRight,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminKPIs, useOrdersTrend } from "@/hooks/useAdminAnalytics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DateRange } from "@/lib/analytics";

type DateRangeOption = "today" | "7days" | "30days" | "90days";

function getDateRange(option: DateRangeOption): DateRange {
  const end = new Date();
  const start = new Date();
  
  switch (option) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const AnalyticsHub = () => {
  const [rangeOption, setRangeOption] = useState<DateRangeOption>("7days");
  const dateRange = useMemo(() => getDateRange(rangeOption), [rangeOption]);

  const { data: kpis, isLoading: kpisLoading, refetch } = useAdminKPIs(dateRange);
  const { data: ordersTrend, isLoading: trendLoading } = useOrdersTrend(dateRange);

  const navLinks = [
    {
      title: "Orders Analytics",
      description: "Detailed order trends and status breakdown",
      href: "/admin/analytics/orders",
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Revenue Analytics",
      description: "GMV, platform fees, and tips analysis",
      href: "/admin/analytics/revenue",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Drivers Performance",
      description: "Top drivers, delivery times, and earnings",
      href: "/admin/analytics/drivers",
      icon: Truck,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Merchants Performance",
      description: "Restaurant rankings and prep times",
      href: "/admin/analytics/merchants",
      icon: Store,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Eats Analytics</h1>
              <p className="text-sm text-muted-foreground">Performance dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={rangeOption} onValueChange={(v) => setRangeOption(v as DateRangeOption)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="today">Today</TabsTrigger>
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

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 py-6 space-y-6"
      >
        {/* KPI Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs font-medium">Total Orders</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">{kpis?.totalOrders.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Delivered</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold text-green-500">{kpis?.deliveredOrders.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs font-medium">Cancelled</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold text-red-500">{kpis?.cancelledOrders.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">GMV</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">${kpis?.gmv.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Platform Revenue</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold text-primary">${kpis?.platformRevenue.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Avg Delivery</span>
              </div>
              {kpisLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">{kpis?.avgDeliveryTime || 0} min</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Trend Chart */}
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Orders Trend
              </CardTitle>
              <CardDescription>Daily orders over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ordersTrend}>
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                    <Area
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      fill="url(#ordersGradient)"
                      strokeWidth={2}
                      name="Orders"
                    />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stroke="hsl(var(--chart-2))"
                      fill="none"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Delivered"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Cards */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold mb-4">Detailed Analytics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="border-0 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl ${link.bgColor}`}>
                        <link.icon className={`h-5 w-5 ${link.color}`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold mt-4">{link.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Back to Admin */}
        <motion.div variants={item} className="pt-4">
          <Link to="/admin">
            <Button variant="outline">← Back to Admin Dashboard</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnalyticsHub;
