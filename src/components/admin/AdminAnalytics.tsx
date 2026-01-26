import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  TrendingUp,
  TrendingDown
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
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStats, useRevenueData, useTripsByType, useDailyTrips, useDriverActivity } from "@/hooks/useAnalytics";

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
  isLoading = false
}: { 
  title: string; 
  value: string; 
  change?: string; 
  changeType?: "positive" | "negative"; 
  icon: React.ElementType;
  isLoading?: boolean;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
          {change && changeType && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}>
              {changeType === "positive" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{change} from last month</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminAnalytics = () => {
  const { data: stats, isLoading: statsLoading } = useAnalyticsStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData();
  const { data: tripsByType, isLoading: tripsByTypeLoading } = useTripsByType();
  const { data: dailyTrips, isLoading: dailyTripsLoading } = useDailyTrips();
  const { data: driverActivity, isLoading: driverActivityLoading } = useDriverActivity();

  // Default data for empty states
  const defaultRevenueData = [
    { month: "Jan", revenue: 0, trips: 0 },
    { month: "Feb", revenue: 0, trips: 0 },
    { month: "Mar", revenue: 0, trips: 0 },
  ];

  const defaultTripsByType = [
    { name: "Economy", value: 25, color: "hsl(var(--primary))" },
    { name: "Comfort", value: 25, color: "hsl(var(--chart-2))" },
    { name: "Premium", value: 25, color: "hsl(var(--chart-3))" },
    { name: "XL", value: 25, color: "hsl(var(--chart-4))" },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Overview of your ride-sharing platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers?.toLocaleString() || "0"} 
          icon={Users}
          isLoading={statsLoading}
        />
        <StatCard 
          title="Active Drivers" 
          value={stats?.activeDrivers?.toLocaleString() || "0"} 
          icon={Car}
          isLoading={statsLoading}
        />
        <StatCard 
          title="Total Trips" 
          value={stats?.totalTrips?.toLocaleString() || "0"} 
          icon={MapPin}
          isLoading={statsLoading}
        />
        <StatCard 
          title="Revenue" 
          value={`$${stats?.totalRevenue?.toLocaleString() || "0"}`} 
          icon={DollarSign}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Trips Overview</CardTitle>
            <CardDescription>Monthly revenue and trip trends</CardDescription>
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trips by Vehicle Type</CardTitle>
            <CardDescription>Distribution of trips across vehicle types</CardDescription>
          </CardHeader>
          <CardContent>
            {tripsByTypeLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <>
                <ChartContainer config={chartConfig} className="h-[300px]">
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
        <Card>
          <CardHeader>
            <CardTitle>Daily Trip Volume</CardTitle>
            <CardDescription>Number of trips per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyTripsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={dailyTrips?.length ? dailyTrips : defaultDailyTrips}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="trips" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Activity</CardTitle>
            <CardDescription>Online vs busy drivers throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            {driverActivityLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={driverActivity?.length ? driverActivity : defaultDriverActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="online" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="busy" 
                      stroke="hsl(var(--chart-4))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
                    <span className="text-sm text-muted-foreground">Online Drivers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]" />
                    <span className="text-sm text-muted-foreground">Busy Drivers</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
