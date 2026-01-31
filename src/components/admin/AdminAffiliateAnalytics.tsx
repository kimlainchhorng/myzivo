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
  Sparkles,
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
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Affiliate Analytics
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track flight affiliate performance and revenue
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center", stat.bgColor)}>
                  <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                  stat.changePositive ? "text-emerald-500" : "text-red-500"
                )}>
                  {stat.changePositive ? (
                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  ) : (
                    <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold mt-2 sm:mt-3">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Clicks Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              Clicks & Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="h-48 sm:h-64">
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
                  <XAxis dataKey="day" stroke="#666" fontSize={10} tickMargin={8} />
                  <YAxis stroke="#666" fontSize={10} width={30} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
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
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Globe className="w-4 h-4 text-purple-500" />
              Clicks by Partner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {partnerData.length > 0 ? (
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={partnerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
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
              <div className="h-40 sm:h-48 flex flex-col items-center justify-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No data yet</p>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 justify-center">
              {partnerData.map((partner) => (
                <Badge key={partner.name} variant="outline" className="gap-1 text-[10px] sm:text-xs px-2 py-0.5">
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                    style={{ backgroundColor: partner.color }}
                  />
                  {partner.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes & Airlines - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Routes */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Plane className="w-4 h-4 text-sky-500" />
              Top Routes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {analytics.topRoutes.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {analytics.topRoutes.map(([route, count], index) => (
                  <div key={route} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-sky-500/20 text-sky-500 text-[10px] sm:text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-xs sm:text-sm truncate">{route}</span>
                        <span className="text-[10px] sm:text-sm text-muted-foreground shrink-0">{count}</span>
                      </div>
                      <div className="h-1 sm:h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all"
                          style={{ width: `${(count / analytics.topRoutes[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Plane className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No route data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Airlines */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4 text-purple-500" />
              Top Airlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {analytics.topAirlines.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {analytics.topAirlines.map(([airline, count], index) => (
                  <div key={airline} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500/20 text-purple-500 text-[10px] sm:text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-xs sm:text-sm truncate">{airline}</span>
                        <span className="text-[10px] sm:text-sm text-muted-foreground shrink-0">{count}</span>
                      </div>
                      <div className="h-1 sm:h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${(count / analytics.topAirlines[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No airline data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Clicks */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Clock className="w-4 h-4 text-emerald-500" />
            Recent Affiliate Clicks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {analytics.recentClicks.length > 0 ? (
            <ScrollArea className="h-48 sm:h-64">
              <div className="space-y-2">
                {analytics.recentClicks.map((click: AffiliateClick) => (
                  <div
                    key={click.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
                        <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {click.origin} → {click.destination}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {click.airline} • {click.passengers} pax
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-bold text-emerald-500 text-sm sm:text-base">${click.price}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {format(new Date(click.timestamp), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <MousePointerClick className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="font-medium text-sm">No clicks recorded yet</p>
              <p className="text-xs sm:text-sm">Affiliate clicks will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAffiliateAnalytics;
