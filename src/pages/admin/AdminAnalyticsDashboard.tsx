import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight,
  Eye, Package, Car, UserPlus, Plane, Store, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";

type TimeRange = "7d" | "30d" | "90d" | "1y";

function getDateRange(range: TimeRange): string {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const PIE_COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(217, 91%, 60%)",
  "hsl(35, 91%, 55%)",
  "hsl(280, 65%, 60%)",
  "hsl(0, 84%, 60%)",
  "hsl(190, 80%, 50%)",
];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
  },
};

function StatCard({
  title, value, icon: Icon, trend, subtitle, color = "green",
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  subtitle?: string;
  color?: "green" | "blue" | "orange" | "purple" | "sky" | "red";
}) {
  const colorMap: Record<string, string> = {
    green: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    sky: "text-sky-500 bg-sky-500/10",
    red: "text-red-500 bg-red-500/10",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", colorMap[color])}>
            <Icon className="w-4 h-4" />
          </div>
          {trend !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-xs font-semibold", trend >= 0 ? "text-emerald-500" : "text-red-500")}>
              {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const since = useMemo(() => getDateRange(timeRange), [timeRange]);

  // Travel bookings
  const { data: bookingStats } = useQuery({
    queryKey: ["admin-booking-stats", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_orders")
        .select("id, provider, status, total, currency, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Page views
  const { data: pageViews } = useQuery({
    queryKey: ["admin-page-views", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("event_name, page, created_at, device_type")
        .eq("event_name", "page_view")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // New user signups in period
  const { data: userGrowthData } = useQuery({
    queryKey: ["admin-user-growth", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Total platform user count
  const { data: totalUsersCount } = useQuery({
    queryKey: ["admin-total-users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
  });

  // Ride trips
  const { data: tripData } = useQuery({
    queryKey: ["admin-trips", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, status, created_at")
        .gte("created_at", since);
      if (error) return [];
      return data || [];
    },
    enabled: isAdmin,
  });

  // Store orders
  const { data: storeOrderData } = useQuery({
    queryKey: ["admin-store-orders", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_orders")
        .select("id, status, total, created_at")
        .gte("created_at", since);
      if (error) return [];
      return data || [];
    },
    enabled: isAdmin,
  });

  // Delivery orders
  const { data: deliveryData } = useQuery({
    queryKey: ["admin-deliveries", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("id, status, created_at")
        .gte("created_at", since);
      if (error) return [];
      return data || [];
    },
    enabled: isAdmin,
  });

  // Feedback / support submissions
  const { data: feedbackData } = useQuery({
    queryKey: ["admin-feedback", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .select("id, category, created_at")
        .gte("created_at", since);
      if (error) return [];
      return data || [];
    },
    enabled: isAdmin,
  });

  // --- Computed booking stats ---
  const stats = useMemo(() => {
    if (!bookingStats) return null;
    const total = bookingStats.length;
    const confirmed = bookingStats.filter((b) => b.status === "confirmed").length;
    const pending = bookingStats.filter((b) => b.status === "pending").length;
    const cancelled = bookingStats.filter((b) => b.status === "cancelled").length;
    const revenue = bookingStats
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (Number(b.total) || 0), 0);
    const avgValue = confirmed > 0 ? revenue / confirmed : 0;
    const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const byService: Record<string, number> = {};
    bookingStats.forEach((b) => {
      const key = b.provider || "other";
      byService[key] = (byService[key] || 0) + 1;
    });
    return { total, confirmed, pending, cancelled, revenue, avgValue, confirmRate, byService };
  }, [bookingStats]);

  // --- Daily bookings & revenue chart ---
  const dailyData = useMemo(() => {
    if (!bookingStats) return [];
    const byDay: Record<string, { date: string; bookings: number; revenue: number }> = {};
    bookingStats.forEach((b) => {
      const day = b.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, bookings: 0, revenue: 0 };
      byDay[day].bookings++;
      if (b.status === "confirmed") byDay[day].revenue += Number(b.total) || 0;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [bookingStats]);

  // --- Service breakdown bar chart ---
  const serviceData = useMemo(() => {
    if (!stats?.byService) return [];
    const labels: Record<string, string> = {
      flight: "Flights", hotel: "Hotels", car_rental: "Car Rental", activity: "Activities",
    };
    return Object.entries(stats.byService).map(([service, count]) => ({
      service: labels[service] || service,
      count,
    }));
  }, [stats]);

  // --- Revenue breakdown pie chart ---
  const revenuePieData = useMemo(() => {
    if (!bookingStats) return [];
    const rev: Record<string, number> = {};
    bookingStats.forEach((b) => {
      if (b.status === "confirmed") {
        const key = b.provider || "other";
        rev[key] = (rev[key] || 0) + (Number(b.total) || 0);
      }
    });
    const labels: Record<string, string> = {
      flight: "Flights", hotel: "Hotels", car_rental: "Car Rental", activity: "Activities",
    };
    return Object.entries(rev).map(([k, v]) => ({ name: labels[k] || k, value: Math.round(v) }));
  }, [bookingStats]);

  // --- Top pages list ---
  const topPages = useMemo(() => {
    if (!pageViews) return [];
    const counts: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const page = pv.page || "/";
      counts[page] = (counts[page] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [pageViews]);

  // --- User growth bar chart ---
  const userGrowthChart = useMemo(() => {
    if (!userGrowthData) return [];
    const byDay: Record<string, number> = {};
    userGrowthData.forEach((u) => {
      const day = u.created_at.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [userGrowthData]);

  // --- Rides by day chart ---
  const tripsChart = useMemo(() => {
    if (!tripData) return [];
    const byDay: Record<string, { date: string; trips: number; completed: number }> = {};
    (tripData as any[]).forEach((t) => {
      const day = (t.created_at as string).slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, trips: 0, completed: 0 };
      byDay[day].trips++;
      if (t.status === "completed") byDay[day].completed++;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [tripData]);

  // --- Store orders by day chart ---
  const storeOrdersChart = useMemo(() => {
    if (!storeOrderData) return [];
    const byDay: Record<string, { date: string; orders: number; revenue: number }> = {};
    (storeOrderData as any[]).forEach((o) => {
      const day = (o.created_at as string).slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, orders: 0, revenue: 0 };
      byDay[day].orders++;
      if (o.total) byDay[day].revenue += Number(o.total) || 0;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [storeOrderData]);

  // --- Device breakdown ---
  const deviceBreakdown = useMemo(() => {
    if (!pageViews) return [];
    const counts: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const device = (pv as any).device_type || "unknown";
      counts[device] = (counts[device] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pageViews]);

  // --- Feedback by category ---
  const feedbackByCategory = useMemo(() => {
    if (!feedbackData) return [];
    const counts: Record<string, number> = {};
    (feedbackData as any[]).forEach((f) => {
      const cat = f.category || "general";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [feedbackData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">This page is restricted to administrators.</p>
            <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rangeLabel = timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : timeRange === "90d" ? "90 days" : "1 year";

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Platform-wide performance · last {rangeLabel}
          </p>
          <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
            {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs h-7 px-3"
              >
                {range === "7d" ? "7D" : range === "30d" ? "30D" : range === "90d" ? "90D" : "1Y"}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Section 1: Travel & Bookings ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Plane className="w-3.5 h-3.5" /> Travel & Bookings
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Bookings"
              value={stats?.total ?? "—"}
              icon={ShoppingBag}
              color="green"
            />
            <StatCard
              title="Confirmed"
              value={stats?.confirmed ?? "—"}
              icon={TrendingUp}
              subtitle={stats ? `${stats.confirmRate}% confirm rate` : undefined}
              color="blue"
            />
            <StatCard
              title="Total Revenue"
              value={stats ? `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              icon={DollarSign}
              color="orange"
            />
            <StatCard
              title="Avg. Booking Value"
              value={stats ? `$${stats.avgValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              icon={TrendingUp}
              subtitle={stats ? `${stats.pending} pending · ${stats.cancelled} cancelled` : undefined}
              color="purple"
            />
          </div>
        </section>

        {/* ── Section 2: Users & Growth ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Users & Growth
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={totalUsersCount !== undefined ? totalUsersCount.toLocaleString() : "—"}
              icon={Users}
              color="sky"
            />
            <StatCard
              title="New Signups"
              value={userGrowthData?.length?.toLocaleString() ?? "—"}
              icon={UserPlus}
              subtitle="In selected period"
              color="green"
            />
            <StatCard
              title="Page Views"
              value={pageViews?.length?.toLocaleString() ?? "—"}
              icon={Eye}
              color="blue"
            />
            <StatCard
              title="Support Submissions"
              value={(feedbackData as any[])?.length?.toLocaleString() ?? "—"}
              icon={Activity}
              color="purple"
            />
          </div>
        </section>

        {/* ── Section 3: Operations ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Car className="w-3.5 h-3.5" /> Operations
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ride Trips"
              value={(tripData as any[])?.length?.toLocaleString() ?? "—"}
              icon={Car}
              subtitle={(tripData as any[]) ? `${(tripData as any[]).filter((t: any) => t.status === "completed").length} completed` : undefined}
              color="orange"
            />
            <StatCard
              title="Store Orders"
              value={(storeOrderData as any[])?.length?.toLocaleString() ?? "—"}
              icon={Store}
              color="green"
            />
            <StatCard
              title="Delivery Orders"
              value={(deliveryData as any[])?.length?.toLocaleString() ?? "—"}
              icon={Package}
              color="sky"
            />
            <StatCard
              title="Services Booked"
              value={serviceData.reduce((s, d) => s + d.count, 0) || "—"}
              icon={ShoppingBag}
              color="blue"
            />
          </div>
        </section>

        {/* ── Charts ── */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="bookings" className="text-xs">Bookings Trend</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">User Growth</TabsTrigger>
            <TabsTrigger value="rides" className="text-xs">Ride Activity</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs">Store Orders</TabsTrigger>
            <TabsTrigger value="services" className="text-xs">By Service</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs">Top Pages</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs">Feedback</TabsTrigger>
          </TabsList>

          {/* Bookings Trend */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Bookings & Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend />
                      <Area type="monotone" dataKey="bookings" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} name="Bookings" />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.1} name="Revenue ($)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No booking data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Breakdown Pie */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                {revenuePieData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenuePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={125}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {revenuePieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 min-w-[200px]">
                      <p className="text-sm font-semibold text-foreground">Breakdown</p>
                      {revenuePieData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-sm text-foreground">{entry.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-foreground">${entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">Total</span>
                          <span className="text-sm font-bold text-primary">
                            ${revenuePieData.reduce((s, e) => s + e.value, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No revenue data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Growth */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">New User Signups per Day</CardTitle>
                {userGrowthData && (
                  <Badge variant="secondary">{userGrowthData.length.toLocaleString()} total in period</Badge>
                )}
              </CardHeader>
              <CardContent>
                {userGrowthChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={userGrowthChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="New Users" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No signup data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ride Activity */}
          <TabsContent value="rides">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Daily Ride Activity</CardTitle>
                {tripData && (
                  <Badge variant="secondary">{(tripData as any[]).length.toLocaleString()} trips in period</Badge>
                )}
              </CardHeader>
              <CardContent>
                {tripsChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={tripsChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend />
                      <Area type="monotone" dataKey="trips" stroke="hsl(35, 91%, 55%)" fill="hsl(35, 91%, 55%)" fillOpacity={0.15} name="Total Trips" />
                      <Area type="monotone" dataKey="completed" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} name="Completed" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No ride data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store Orders */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Store & Eats Orders</CardTitle>
                {storeOrderData && (
                  <Badge variant="secondary">{(storeOrderData as any[]).length.toLocaleString()} orders in period</Badge>
                )}
              </CardHeader>
              <CardContent>
                {storeOrdersChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={storeOrdersChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend />
                      <Area type="monotone" dataKey="orders" stroke="hsl(280, 65%, 60%)" fill="hsl(280, 65%, 60%)" fillOpacity={0.15} name="Orders" />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} name="Revenue ($)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No store order data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Service */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bookings by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={serviceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="service" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No service data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Pages */}
          <TabsContent value="pages">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 10 Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  {topPages.length > 0 ? (
                    <div className="space-y-2">
                      {topPages.map((p, i) => (
                        <div key={p.page} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center text-xs p-0 shrink-0">
                              {i + 1}
                            </Badge>
                            <span className="text-sm text-foreground font-medium truncate max-w-[240px]">{p.page}</span>
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground shrink-0">{p.views.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-16">No page view data for this period.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {deviceBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {deviceBreakdown.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-16">No device data.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Feedback & Support by Category</CardTitle>
                {feedbackData && (
                  <Badge variant="secondary">{(feedbackData as any[]).length.toLocaleString()} submissions</Badge>
                )}
              </CardHeader>
              <CardContent>
                {feedbackByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={feedbackByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={130} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="hsl(190, 80%, 50%)" radius={[0, 4, 4, 0]} name="Submissions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-16">No feedback data for this period.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Quick Access ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Access</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {[
              { label: "Flight Orders", path: "/admin/flight-orders", emoji: "✈️" },
              { label: "Trip Heatmap", path: "/admin/operations/heatmap", emoji: "🗺️" },
              { label: "Driver Verify", path: "/admin/drivers/verification", emoji: "🪪" },
              { label: "Moderation", path: "/admin/moderation", emoji: "🛡️" },
              { label: "Support", path: "/admin/support", emoji: "🎧" },
              { label: "System Health", path: "/admin/system-health", emoji: "💚" },
              { label: "God View", path: "/admin/god-view", emoji: "👁️" },
              { label: "Refunds", path: "/admin/payments/refunds", emoji: "↩️" },
              { label: "Stores", path: "/admin/stores", emoji: "🏪" },
              { label: "Ads Analytics", path: "/admin/ads/analytics", emoji: "📊" },
              { label: "Remote Config", path: "/admin/remote-config", emoji: "⚙️" },
              { label: "Auth Shield", path: "/admin/auth-shield", emoji: "🔐" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-center"
              >
                <span className="text-xl">{link.emoji}</span>
                <span className="text-[11px] font-medium text-foreground leading-tight">{link.label}</span>
              </button>
            ))}
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}
