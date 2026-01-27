import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Car, Clock, Users, Calendar, Fuel, MapPin } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CarRentalAnalytics = () => {
  const monthlyData = [
    { month: "Jan", rentals: 45, revenue: 8500 },
    { month: "Feb", rentals: 52, revenue: 9200 },
    { month: "Mar", rentals: 48, revenue: 8800 },
    { month: "Apr", rentals: 65, revenue: 11500 },
    { month: "May", rentals: 72, revenue: 13200 },
    { month: "Jun", rentals: 80, revenue: 14500 },
  ];

  const weeklyTrend = [
    { day: "Mon", bookings: 12 },
    { day: "Tue", bookings: 18 },
    { day: "Wed", bookings: 15 },
    { day: "Thu", bookings: 22 },
    { day: "Fri", bookings: 35 },
    { day: "Sat", bookings: 42 },
    { day: "Sun", bookings: 28 },
  ];

  const categoryData = [
    { name: "SUV", value: 35, color: "#22c55e" },
    { name: "Sedan", value: 28, color: "#3b82f6" },
    { name: "Electric", value: 20, color: "#8b5cf6" },
    { name: "Luxury", value: 12, color: "#f59e0b" },
    { name: "Economy", value: 5, color: "#ef4444" },
  ];

  const topVehicles = [
    { name: "Tesla Model 3", rentals: 48, revenue: 9600, utilization: 92 },
    { name: "BMW X5", rentals: 42, revenue: 12600, utilization: 88 },
    { name: "Mercedes E-Class", rentals: 38, revenue: 11400, utilization: 85 },
    { name: "Toyota Camry", rentals: 35, revenue: 5250, utilization: 78 },
    { name: "Honda CR-V", rentals: 32, revenue: 6400, utilization: 75 },
  ];

  const stats = [
    { 
      label: "Total Revenue (6mo)", 
      value: "$65,700", 
      change: "+18%", 
      trend: "up",
      icon: DollarSign,
      gradient: "from-emerald-500/20 to-green-500/10"
    },
    { 
      label: "Total Rentals", 
      value: "362", 
      change: "+22%", 
      trend: "up",
      icon: Car,
      gradient: "from-blue-500/20 to-cyan-500/10"
    },
    { 
      label: "Avg Rental Duration", 
      value: "3.2 days", 
      change: "Consistent", 
      trend: "neutral",
      icon: Clock,
      gradient: "from-amber-500/20 to-orange-500/10"
    },
    { 
      label: "Fleet Utilization", 
      value: "78%", 
      change: "+5%", 
      trend: "up",
      icon: TrendingUp,
      gradient: "from-purple-500/20 to-pink-500/10"
    },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your rental business performance</p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                    <span className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-muted-foreground"}`}>
                      {stat.change}
                    </span>
                    {stat.trend === "up" && <span className="text-xs text-muted-foreground">vs last period</span>}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-background/50">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Customers</p>
              <p className="text-lg font-semibold">86</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Rentals</p>
              <p className="text-lg font-semibold">24</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Fuel className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fuel Costs</p>
              <p className="text-lg font-semibold">$2,340</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <MapPin className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Distance</p>
              <p className="text-lg font-semibold">185 km</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <BarChart className="h-4 w-4 text-primary" />
                </div>
                Monthly Performance
              </CardTitle>
              <CardDescription>Rentals and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="rentals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Rentals" />
                  <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                Weekly Booking Trend
              </CardTitle>
              <CardDescription>Bookings by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#weeklyGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Breakdown & Top Vehicles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Rentals by Category</CardTitle>
              <CardDescription>Vehicle category popularity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Top Performing Vehicles
              </CardTitle>
              <CardDescription>Highest revenue generators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVehicles.map((vehicle, index) => (
                  <motion.div 
                    key={vehicle.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500/20 text-amber-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.name}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.rentals} rentals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-500">${vehicle.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${vehicle.utilization}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-blue-500"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">{vehicle.utilization}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CarRentalAnalytics;
