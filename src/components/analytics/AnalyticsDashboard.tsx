import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Car, UtensilsCrossed, 
  Plane, Hotel, Key, ArrowUpRight, ArrowDownRight, Calendar, MapPin, Clock
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface AnalyticsDashboardProps {
  service?: 'all' | 'rides' | 'eats' | 'rental' | 'flights' | 'hotels';
}

const AnalyticsDashboard = ({ service = 'all' }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock data - in production, this would come from your database
  const revenueData = [
    { date: "Mon", rides: 2400, eats: 1398, rental: 800, flights: 3200, hotels: 2100 },
    { date: "Tue", rides: 1398, eats: 2800, rental: 950, flights: 2800, hotels: 1800 },
    { date: "Wed", rides: 3200, eats: 3908, rental: 1200, flights: 4100, hotels: 2400 },
    { date: "Thu", rides: 2780, eats: 3800, rental: 1100, flights: 3600, hotels: 2200 },
    { date: "Fri", rides: 4890, eats: 4800, rental: 1800, flights: 5200, hotels: 3100 },
    { date: "Sat", rides: 5390, eats: 5200, rental: 2100, flights: 4800, hotels: 3500 },
    { date: "Sun", rides: 4490, eats: 4100, rental: 1600, flights: 4200, hotels: 2900 },
  ];

  const serviceBreakdown = [
    { name: "Rides", value: 35, color: "hsl(174, 72%, 50%)" },
    { name: "Eats", value: 28, color: "hsl(24, 95%, 58%)" },
    { name: "Flights", value: 20, color: "hsl(200, 80%, 55%)" },
    { name: "Hotels", value: 12, color: "hsl(38, 92%, 50%)" },
    { name: "Car Rental", value: 5, color: "hsl(280, 70%, 60%)" },
  ];

  const topLocations = [
    { city: "New York", rides: 12500, revenue: "$187,500" },
    { city: "Los Angeles", rides: 9800, revenue: "$147,000" },
    { city: "Chicago", rides: 7200, revenue: "$108,000" },
    { city: "Miami", rides: 6500, revenue: "$97,500" },
    { city: "San Francisco", rides: 5800, revenue: "$87,000" },
  ];

  const kpis = [
    { 
      label: "Total Revenue", 
      value: "$847,320", 
      change: "+12.5%", 
      trend: "up", 
      icon: DollarSign,
      color: "text-success" 
    },
    { 
      label: "Active Users", 
      value: "124,847", 
      change: "+8.2%", 
      trend: "up", 
      icon: Users,
      color: "text-primary" 
    },
    { 
      label: "Total Trips/Orders", 
      value: "89,432", 
      change: "+15.3%", 
      trend: "up", 
      icon: Car,
      color: "text-rides" 
    },
    { 
      label: "Avg. Rating", 
      value: "4.82", 
      change: "-0.02", 
      trend: "down", 
      icon: TrendingUp,
      color: "text-warning" 
    },
  ];

  const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    rides: Math.floor(Math.random() * 500) + 100,
    eats: Math.floor(Math.random() * 400) + 50,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights across all services</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <Badge 
                  variant="outline" 
                  className={kpi.trend === 'up' ? 'text-success border-success' : 'text-destructive border-destructive'}
                >
                  {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {kpi.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="rides" stackId="1" stroke="hsl(174, 72%, 50%)" fill="hsl(174, 72%, 50%)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="eats" stackId="1" stroke="hsl(24, 95%, 58%)" fill="hsl(24, 95%, 58%)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="flights" stackId="1" stroke="hsl(200, 80%, 55%)" fill="hsl(200, 80%, 55%)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="hotels" stackId="1" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="rental" stackId="1" stroke="hsl(280, 70%, 60%)" fill="hsl(280, 70%, 60%)" fillOpacity={0.6} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Revenue by service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {serviceBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hourly Activity
            </CardTitle>
            <CardDescription>Rides and orders by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={2} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="rides" fill="hsl(174, 72%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eats" fill="hsl(24, 95%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Locations
            </CardTitle>
            <CardDescription>Highest performing cities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topLocations.map((location, i) => (
                <div key={location.city} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{location.city}</span>
                      <span className="text-sm text-muted-foreground">{location.revenue}</span>
                    </div>
                    <Progress value={(location.rides / 12500) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service-specific quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Car, label: "Rides Today", value: "2,847", color: "text-rides" },
          { icon: UtensilsCrossed, label: "Orders Today", value: "1,923", color: "text-eats" },
          { icon: Key, label: "Active Rentals", value: "156", color: "text-primary" },
          { icon: Plane, label: "Flights Booked", value: "423", color: "text-sky-500" },
          { icon: Hotel, label: "Room Nights", value: "892", color: "text-amber-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
