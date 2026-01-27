import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { TrendingUp, DollarSign, Car, Clock, Users, Calendar, Fuel, MapPin, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
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
    { name: "Tesla Model 3", rentals: 48, revenue: 9600, utilization: 92, emoji: "⚡" },
    { name: "BMW X5", rentals: 42, revenue: 12600, utilization: 88, emoji: "🚙" },
    { name: "Mercedes E-Class", rentals: 38, revenue: 11400, utilization: 85, emoji: "💎" },
    { name: "Toyota Camry", rentals: 35, revenue: 5250, utilization: 78, emoji: "🚗" },
    { name: "Honda CR-V", rentals: 32, revenue: 6400, utilization: 75, emoji: "🚙" },
  ];

  const stats = [
    { 
      label: "Total Revenue", 
      sublabel: "Last 6 months",
      value: "$65,700", 
      change: "+18%", 
      trend: "up",
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/20 to-green-500/10"
    },
    { 
      label: "Total Rentals", 
      sublabel: "This period",
      value: "362", 
      change: "+22%", 
      trend: "up",
      icon: Car,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/20 to-cyan-500/10"
    },
    { 
      label: "Avg Duration", 
      sublabel: "Per rental",
      value: "3.2 days", 
      change: "Stable", 
      trend: "neutral",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/20 to-orange-500/10"
    },
    { 
      label: "Fleet Utilization", 
      sublabel: "Current rate",
      value: "78%", 
      change: "+5%", 
      trend: "up",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/20 to-pink-500/10"
    },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 relative"
    >
      {/* Floating Decorations */}
      <motion.div
        className="absolute -top-2 right-16 text-3xl pointer-events-none hidden md:block"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        📊
      </motion.div>
      <motion.div
        className="absolute top-24 right-4 text-2xl pointer-events-none hidden md:block"
        animate={{ y: [0, 10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        ✨
      </motion.div>

      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <TrendingUp className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Analytics Dashboard
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
            </h1>
            <p className="text-muted-foreground">Track your rental business performance</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Real-time Data
        </Badge>
      </motion.div>

      {/* Main Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === "up" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : stat.trend === "down"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {stat.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                    {stat.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <div className="mt-1">
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, color: "blue", value: "86", label: "New Customers" },
          { icon: Calendar, color: "green", value: "24", label: "Active Rentals" },
          { icon: Fuel, color: "amber", value: "$2,340", label: "Fuel Costs" },
          { icon: MapPin, color: "purple", value: "185 km", label: "Avg Distance" },
        ].map((stat, index) => (
          <Card key={index} className="border-0 bg-card/50 backdrop-blur-xl hover:bg-card/70 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-500" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Monthly Performance
              </CardTitle>
              <CardDescription>Rentals and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="rentals" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Rentals" />
                  <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                Weekly Booking Trend
              </CardTitle>
              <CardDescription>Bookings by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#weeklyGradient)" 
                    strokeWidth={3}
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
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🚗</span>
                Rentals by Category
              </CardTitle>
              <CardDescription>Vehicle category popularity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
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
                      borderRadius: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                Top Performing Vehicles
              </CardTitle>
              <CardDescription>Highest revenue generators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topVehicles.map((vehicle, index) => (
                  <motion.div 
                    key={vehicle.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                    className="p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-200 border border-border/50 hover:border-primary/20 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${
                          index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}
                        </div>
                        <div>
                          <p className="font-semibold flex items-center gap-1.5 group-hover:text-primary transition-colors">
                            {vehicle.name}
                            <span className="text-sm">{vehicle.emoji}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{vehicle.rentals} rentals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">${vehicle.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${vehicle.utilization}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-teal-500"
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-12 text-right">{vehicle.utilization}%</span>
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
