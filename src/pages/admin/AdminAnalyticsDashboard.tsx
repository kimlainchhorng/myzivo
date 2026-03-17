import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Plane, Hotel, Car, ShoppingBag } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";

type TimeRange = "7d" | "30d" | "90d";

function getDateRange(range: TimeRange): string {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default function AdminAnalyticsDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const since = useMemo(() => getDateRange(timeRange), [timeRange]);

  // Booking analytics from travel_orders
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

  // Page view analytics
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

  // Compute stats
  const stats = useMemo(() => {
    if (!bookingStats) return null;
    const total = bookingStats.length;
    const confirmed = bookingStats.filter((b) => b.status === "confirmed").length;
    const revenue = bookingStats
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (Number(b.total) || 0), 0);
    const byService: Record<string, number> = {};
    bookingStats.forEach((b) => {
      const key = b.provider || "other";
      byService[key] = (byService[key] || 0) + 1;
    });
    return { total, confirmed, revenue, byService };
  }, [bookingStats]);

  // Daily chart data
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

  // Service breakdown for bar chart
  const serviceData = useMemo(() => {
    if (!stats?.byService) return [];
    const icons: Record<string, string> = { flight: "✈️", hotel: "🏨", car_rental: "🚗", activity: "🎯" };
    return Object.entries(stats.byService).map(([service, count]) => ({
      service: `${icons[service] || "📦"} ${service}`,
      count,
    }));
  }, [stats]);

  // Page view stats
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

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="max-w-7xl space-y-6">
        {/* Time range selector */}
        <div className="flex justify-end">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </Button>
            ))}
          </div>
        </div>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <ShoppingBag className="w-4 h-4" /> Total Bookings
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.total ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="w-4 h-4" /> Confirmed
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.confirmed ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="w-4 h-4" /> Revenue
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${stats?.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Users className="w-4 h-4" /> Page Views
                </div>
                <p className="text-2xl font-bold text-foreground">{pageViews?.length?.toLocaleString() ?? "—"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="bookings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bookings">Bookings Trend</TabsTrigger>
              <TabsTrigger value="services">By Service</TabsTrigger>
              <TabsTrigger value="pages">Top Pages</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Bookings & Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Area type="monotone" dataKey="bookings" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} name="Bookings" />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.1} name="Revenue ($)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No booking data for this period.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bookings by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={serviceData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="service" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No service data for this period.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 10 Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  {topPages.length > 0 ? (
                    <div className="space-y-3">
                      {topPages.map((p, i) => (
                        <div key={p.page} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center text-xs p-0">
                              {i + 1}
                            </Badge>
                            <span className="text-sm text-foreground font-medium truncate max-w-[300px]">{p.page}</span>
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground">{p.views.toLocaleString()} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">No page view data for this period.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </AdminLayout>
  );
}
