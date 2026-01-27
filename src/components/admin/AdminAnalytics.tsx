import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Download,
  RefreshCw,
  Calendar,
  Utensils,
  Plane,
  Building2,
  Star
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStats, useRevenueData, useTripsByType, useDailyTrips, useDriverActivity } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import AdminLiveMetrics from "./AdminLiveMetrics";
import AdminServiceHealth from "./AdminServiceHealth";
import AdminQuickActions from "./AdminQuickActions";
import AdminRecentActivity from "./AdminRecentActivity";
import AdminPerformanceChart from "./AdminPerformanceChart";

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  trips: { label: "Trips", color: "hsl(var(--chart-2))" },
  online: { label: "Online", color: "hsl(var(--chart-3))" },
  busy: { label: "Busy", color: "hsl(var(--chart-4))" },
};

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  gradient,
  isLoading = false,
  subtitle
}: { 
  title: string; 
  value: string; 
  change?: string; 
  changeType?: "positive" | "negative"; 
  icon: React.ElementType;
  gradient: string;
  isLoading?: boolean;
  subtitle?: string;
}) => (
  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl group hover:shadow-lg transition-all animate-in fade-in duration-300">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
    <CardContent className="relative p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {change && changeType && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              changeType === "positive" ? "text-green-500" : "text-red-500"
            )}>
              {changeType === "positive" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{change} from last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAnalyticsStats();
  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueData();
  const { data: tripsByType, isLoading: tripsByTypeLoading, refetch: refetchTripsByType } = useTripsByType();
  const { data: dailyTrips, isLoading: dailyTripsLoading, refetch: refetchDailyTrips } = useDailyTrips();
  const { data: driverActivity, isLoading: driverActivityLoading, refetch: refetchDriverActivity } = useDriverActivity();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchRevenue(),
      refetchTripsByType(),
      refetchDailyTrips(),
      refetchDriverActivity()
    ]);
    setIsRefreshing(false);
  };

  // Default data for empty states
  const defaultRevenueData = [
    { month: "Jan", revenue: 0, trips: 0 },
    { month: "Feb", revenue: 0, trips: 0 },
    { month: "Mar", revenue: 0, trips: 0 },
  ];

  const defaultTripsByType = [
    { name: "Economy", value: 25, color: "#22c55e" },
    { name: "Comfort", value: 25, color: "#3b82f6" },
    { name: "Premium", value: 25, color: "#8b5cf6" },
    { name: "XL", value: 25, color: "#f59e0b" },
  ];

  const defaultDailyTrips = [
    { day: "Mon", trips: 0 },
    { day: "Tue", trips: 0 },
    { day: "Wed", trips: 0 },
    { day: "Thu", trips: 0 },
    { day: "Fri", trips: 0 },
    { day: "Sat", trips: 0 },
    { day: "Sun", trips: 0 },
  ];

  const defaultDriverActivity = [
    { hour: "6am", online: 0, busy: 0 },
    { hour: "9am", online: 0, busy: 0 },
    { hour: "12pm", online: 0, busy: 0 },
    { hour: "3pm", online: 0, busy: 0 },
    { hour: "6pm", online: 0, busy: 0 },
    { hour: "9pm", online: 0, busy: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Overview of your platform performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers?.toLocaleString() || "0"} 
          icon={Users}
          gradient="from-blue-500/20 to-cyan-500/10"
          isLoading={statsLoading}
          change="+12%"
          changeType="positive"
        />
        <StatCard 
          title="Active Drivers" 
          value={stats?.activeDrivers?.toLocaleString() || "0"} 
          icon={Car}
          gradient="from-green-500/20 to-emerald-500/10"
          isLoading={statsLoading}
          subtitle="Online now"
        />
        <StatCard 
          title="Total Trips" 
          value={stats?.totalTrips?.toLocaleString() || "0"} 
          icon={MapPin}
          gradient="from-purple-500/20 to-pink-500/10"
          isLoading={statsLoading}
          change="+8%"
          changeType="positive"
        />
        <StatCard 
          title="Revenue" 
          value={`$${stats?.totalRevenue?.toLocaleString() || "0"}`} 
          icon={DollarSign}
          gradient="from-amber-500/20 to-orange-500/10"
          isLoading={statsLoading}
          change="+15%"
          changeType="positive"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Zap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversion</p>
              <p className="text-lg font-semibold">68%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <p className="text-lg font-semibold">4.8 ★</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wait Time</p>
              <p className="text-lg font-semibold">4.2 min</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10">
              <Utensils className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Food Orders</p>
              <p className="text-lg font-semibold">1.2K</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <Plane className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Flights</p>
              <p className="text-lg font-semibold">342</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Building2 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hotels</p>
              <p className="text-lg font-semibold">156</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  Revenue Overview
                </CardTitle>
                <CardDescription>Monthly revenue trends</CardDescription>
              </div>
              <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                +15% vs last period
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={revenueData?.length ? revenueData : defaultRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" className="text-xs" />
                  <YAxis stroke="hsl(var(--muted-foreground))" className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Car className="h-4 w-4 text-purple-500" />
              </div>
              Trips by Vehicle Type
            </CardTitle>
            <CardDescription>Distribution of trips across vehicle types</CardDescription>
          </CardHeader>
          <CardContent>
            {tripsByTypeLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <PieChart>
                    <Pie
                      data={tripsByType?.length ? tripsByType : defaultTripsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(tripsByType?.length ? tripsByType : defaultTripsByType).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {(tripsByType?.length ? tripsByType : defaultTripsByType).map((type) => (
                    <div key={type.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {type.name} ({type.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <BarChart className="h-4 w-4 text-green-500" />
              </div>
              Daily Trip Volume
            </CardTitle>
            <CardDescription>Number of trips per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyTripsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTrips?.length ? dailyTrips : defaultDailyTrips}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" className="text-xs" />
                    <YAxis stroke="hsl(var(--muted-foreground))" className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="trips" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
              Driver Activity
            </CardTitle>
            <CardDescription>Online vs busy drivers throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            {driverActivityLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <LineChart data={driverActivity?.length ? driverActivity : defaultDriverActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" className="text-xs" />
                    <YAxis stroke="hsl(var(--muted-foreground))" className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="online" 
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="busy" 
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Online Drivers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-muted-foreground">Busy Drivers</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Metrics & Performance */}
      <AdminLiveMetrics />
      
      {/* Performance Chart */}
      <AdminPerformanceChart />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AdminQuickActions />
        </div>
        <div className="lg:col-span-1">
          <AdminServiceHealth />
        </div>
        <div className="lg:col-span-1">
          <AdminRecentActivity />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
