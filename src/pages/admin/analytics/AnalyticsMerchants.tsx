/**
 * Merchants Analytics Page
 * Restaurant rankings, prep times, and revenue leaderboard
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ArrowLeft, RefreshCw, Star, Clock, DollarSign, Trophy, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopRestaurants } from "@/hooks/useAdminAnalytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

const AnalyticsMerchants = () => {
  const [rangeOption, setRangeOption] = useState<DateRangeOption>("30days");
  const dateRange = useMemo(() => getDateRange(rangeOption), [rangeOption]);

  const { data: topRestaurants, isLoading, refetch } = useTopRestaurants(dateRange, 20);

  const chartData = topRestaurants?.slice(0, 10).map((r) => ({
    name: r.name.length > 15 ? r.name.substring(0, 15) + "..." : r.name,
    orders: r.orders,
    revenue: r.revenue,
  }));

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Trophy className="h-4 w-4 text-orange-500" />;
    return <span className="text-sm text-muted-foreground">#{index + 1}</span>;
  };

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
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Store className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Merchants Performance</h1>
              <p className="text-sm text-muted-foreground">Restaurant rankings and metrics</p>
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
        {/* Top Restaurants Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle>Top 10 Restaurants by Orders</CardTitle>
              <CardDescription>Order count and revenue comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prep Time Analysis */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle>Average Prep Time by Restaurant</CardTitle>
              <CardDescription>Minutes from order acceptance to ready</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topRestaurants?.filter((r) => r.avgPrepTime > 0).slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => (v.length > 10 ? v.substring(0, 10) + "..." : v)}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value} min`, "Avg Prep Time"]}
                    />
                    <Bar dataKey="avgPrepTime" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Prep Time" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Restaurants Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 bg-card/50">
            <CardHeader>
              <CardTitle>Restaurant Leaderboard</CardTitle>
              <CardDescription>Ranked by total orders</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topRestaurants?.map((restaurant, index) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                          {getRankBadge(index)}
                        </div>
                        <div>
                          <p className="font-semibold">{restaurant.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <ShoppingCart className="h-3 w-3" />
                              <span>{restaurant.orders} orders</span>
                            </div>
                            {restaurant.avgPrepTime > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{restaurant.avgPrepTime} min prep</span>
                              </div>
                            )}
                            {restaurant.rating > 0 && (
                              <div className="flex items-center gap-1 text-sm text-yellow-500">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{restaurant.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-500 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>{restaurant.revenue.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">total revenue</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsMerchants;
