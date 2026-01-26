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
  ResponsiveContainer,
} from "recharts";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 12500, trips: 450 },
  { month: "Feb", revenue: 15200, trips: 520 },
  { month: "Mar", revenue: 18900, trips: 680 },
  { month: "Apr", revenue: 22100, trips: 790 },
  { month: "May", revenue: 25800, trips: 890 },
  { month: "Jun", revenue: 28500, trips: 980 },
];

const tripsByType = [
  { name: "Economy", value: 45, color: "hsl(var(--primary))" },
  { name: "Comfort", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Premium", value: 15, color: "hsl(var(--chart-3))" },
  { name: "XL", value: 10, color: "hsl(var(--chart-4))" },
];

const dailyTrips = [
  { day: "Mon", trips: 145 },
  { day: "Tue", trips: 132 },
  { day: "Wed", trips: 168 },
  { day: "Thu", trips: 178 },
  { day: "Fri", trips: 210 },
  { day: "Sat", trips: 245 },
  { day: "Sun", trips: 198 },
];

const driverActivity = [
  { hour: "6am", online: 25, busy: 18 },
  { hour: "9am", online: 85, busy: 72 },
  { hour: "12pm", online: 92, busy: 68 },
  { hour: "3pm", online: 78, busy: 55 },
  { hour: "6pm", online: 110, busy: 95 },
  { hour: "9pm", online: 65, busy: 48 },
];

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
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  changeType: "positive" | "negative"; 
  icon: React.ElementType;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
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
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminAnalytics = () => {
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
          value="12,458" 
          change="+12.5%" 
          changeType="positive"
          icon={Users}
        />
        <StatCard 
          title="Active Drivers" 
          value="856" 
          change="+8.2%" 
          changeType="positive"
          icon={Car}
        />
        <StatCard 
          title="Total Trips" 
          value="45,280" 
          change="+23.1%" 
          changeType="positive"
          icon={MapPin}
        />
        <StatCard 
          title="Revenue" 
          value="$128,450" 
          change="+18.7%" 
          changeType="positive"
          icon={DollarSign}
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
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={revenueData}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trips by Vehicle Type</CardTitle>
            <CardDescription>Distribution of trips across vehicle types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={tripsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tripsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {tripsByType.map((type) => (
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
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={dailyTrips}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Activity</CardTitle>
            <CardDescription>Online vs busy drivers throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={driverActivity}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
