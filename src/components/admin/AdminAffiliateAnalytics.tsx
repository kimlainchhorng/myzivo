import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plane,
  DollarSign,
  MousePointerClick,
  TrendingUp,
  Globe,
  Users,
  Calendar,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
} from "lucide-react";
import { getAffiliateAnalytics, type AffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminAffiliateAnalytics = () => {
  const [analytics, setAnalytics] = useState<ReturnType<typeof getAffiliateAnalytics> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAnalytics(getAffiliateAnalytics());
      setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    refreshData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!analytics) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  const stats = [
    {
      label: "Total Clicks",
      value: analytics.totalClicks,
      change: "+12%",
      changePositive: true,
      icon: MousePointerClick,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
    {
      label: "Today's Clicks",
      value: analytics.todayClicks,
      change: "+8%",
      changePositive: true,
      icon: Calendar,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Est. Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      change: "+15%",
      changePositive: true,
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Avg. Order Value",
      value: `$${analytics.avgOrderValue.toFixed(0)}`,
      change: "-3%",
      changePositive: false,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  // Mock chart data
  const clicksOverTime = [
    { day: "Mon", clicks: 45, revenue: 89 },
    { day: "Tue", clicks: 52, revenue: 104 },
    { day: "Wed", clicks: 38, revenue: 76 },
    { day: "Thu", clicks: 65, revenue: 130 },
    { day: "Fri", clicks: 78, revenue: 156 },
    { day: "Sat", clicks: 92, revenue: 184 },
    { day: "Sun", clicks: 84, revenue: 168 },
  ];

  const partnerColors: Record<string, string> = {
    skyscanner: "#0770e3",
    kayak: "#ff690f",
    google_flights: "#4285f4",
    expedia: "#ffc72c",
  };

  const partnerData = Object.entries(analytics.clicksByPartner).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
    value,
    color: partnerColors[name] || "#6b7280",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="w-6 h-6 text-sky-500" />
            Affiliate Analytics
          </h2>
          <p className="text-muted-foreground">
            Track flight affiliate performance and revenue
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  stat.changePositive ? "text-emerald-500" : "text-red-500"
                )}>
                  {stat.changePositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Clicks Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              Clicks & Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clicksOverTime}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Partner Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4 text-purple-500" />
              Clicks by Partner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partnerData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={partnerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {partnerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {partnerData.map((partner) => (
                <Badge key={partner.name} variant="outline" className="gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: partner.color }}
                  />
                  {partner.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes & Airlines */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plane className="w-4 h-4 text-sky-500" />
              Top Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topRoutes.length > 0 ? (
              <div className="space-y-3">
                {analytics.topRoutes.map(([route, count], index) => (
                  <div key={route} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{route}</span>
                        <span className="text-sm text-muted-foreground">{count} clicks</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${(count / analytics.topRoutes[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No route data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Airlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-purple-500" />
              Top Airlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topAirlines.length > 0 ? (
              <div className="space-y-3">
                {analytics.topAirlines.map(([airline, count], index) => (
                  <div key={airline} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{airline}</span>
                        <span className="text-sm text-muted-foreground">{count} clicks</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(count / analytics.topAirlines[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No airline data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-emerald-500" />
            Recent Affiliate Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentClicks.length > 0 ? (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {analytics.recentClicks.map((click: AffiliateClick) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {click.origin} → {click.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {click.airline} • {click.passengers} pax • {click.cabinClass}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">${click.price}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(click.timestamp), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MousePointerClick className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No clicks recorded yet</p>
              <p className="text-sm">Affiliate clicks will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAffiliateAnalytics;
