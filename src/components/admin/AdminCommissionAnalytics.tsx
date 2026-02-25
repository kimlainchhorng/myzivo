import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Percent, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Car,
  Utensils,
  Package,
  PieChart,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";

const commissionTrends = [
  { month: "Aug", rides: 45200, food: 28400, packages: 8900 },
  { month: "Sep", rides: 48600, food: 31200, packages: 9800 },
  { month: "Oct", rides: 52100, food: 34500, packages: 11200 },
  { month: "Nov", rides: 55800, food: 38900, packages: 12800 },
  { month: "Dec", rides: 62400, food: 45200, packages: 14500 },
  { month: "Jan", rides: 58200, food: 42100, packages: 13200 },
];

const serviceBreakdown = [
  { name: "Rides", value: 58200, color: "hsl(var(--primary))", percentage: 51.2 },
  { name: "Food Delivery", value: 42100, color: "hsl(var(--eats))", percentage: 37.1 },
  { name: "Packages", value: 13200, color: "#f59e0b", percentage: 11.7 },
];

const vehicleBreakdown = [
  { type: "Economy", commission: 18, revenue: 28500, trips: 4250, trend: 5.2 },
  { type: "Comfort", commission: 22, revenue: 18200, trips: 2100, trend: 8.4 },
  { type: "Premium", commission: 25, revenue: 8900, trips: 680, trend: 12.1 },
  { type: "XL", commission: 20, revenue: 2600, trips: 320, trend: -2.3 },
];

const topEarningDrivers = [
  { name: "Michael Chen", trips: 342, commission: 4250, avatar: "MC" },
  { name: "Sarah Wilson", trips: 298, commission: 3890, avatar: "SW" },
  { name: "James Rodriguez", trips: 276, commission: 3420, avatar: "JR" },
  { name: "Emily Davis", trips: 254, commission: 3180, avatar: "ED" },
  { name: "Robert Kim", trips: 231, commission: 2950, avatar: "RK" },
];

const AdminCommissionAnalytics = () => {
  const totalCommission = serviceBreakdown.reduce((sum, s) => sum + s.value, 0);
  const prevMonthCommission = 102500;
  const growthPercent = ((totalCommission - prevMonthCommission) / prevMonthCommission) * 100;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Commission</p>
                <p className="text-xl font-bold">${totalCommission.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {growthPercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={cn("text-xs", growthPercent >= 0 ? "text-green-500" : "text-red-500")}>
                    {growthPercent >= 0 ? "+" : ""}{growthPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg. Rate</p>
                <p className="text-xl font-bold">21.3%</p>
                <p className="text-xs text-muted-foreground mt-1">Across all services</p>
              </div>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Percent className="h-5 w-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ride Commission</p>
                <p className="text-xl font-bold">${serviceBreakdown[0].value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{serviceBreakdown[0].percentage}% of total</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Car className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-500/10 to-pink-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivery Commission</p>
                <p className="text-xl font-bold">${(serviceBreakdown[1].value + serviceBreakdown[2].value).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{(serviceBreakdown[1].percentage + serviceBreakdown[2].percentage).toFixed(1)}% of total</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Utensils className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Commission Trends
            </CardTitle>
            <CardDescription>Monthly commission by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={commissionTrends}>
                  <defs>
                    <linearGradient id="ridesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="foodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--eats))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--eats))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="packagesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Area type="monotone" dataKey="rides" stroke="hsl(var(--primary))" fill="url(#ridesGradient)" strokeWidth={2} name="Rides" />
                  <Area type="monotone" dataKey="food" stroke="hsl(var(--eats))" fill="url(#foodGradient)" strokeWidth={2} name="Food" />
                  <Area type="monotone" dataKey="packages" stroke="#f59e0b" fill="url(#packagesGradient)" strokeWidth={2} name="Packages" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Rides</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-eats" />
                <span className="text-sm text-muted-foreground">Food</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground">Packages</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Service Distribution
            </CardTitle>
            <CardDescription>Commission by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {serviceBreakdown.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <span className="text-sm font-medium">{service.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vehicle Breakdown */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Commission by Vehicle Type
            </CardTitle>
            <CardDescription>Rides commission breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicleBreakdown.map((vehicle, index) => (
                <motion.div
                  key={vehicle.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-xl border border-border/50 bg-background/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-medium">
                        {vehicle.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {vehicle.commission}% rate
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {vehicle.trend >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={cn("text-xs font-medium", vehicle.trend >= 0 ? "text-green-500" : "text-red-500")}>
                        {vehicle.trend >= 0 ? "+" : ""}{vehicle.trend}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{vehicle.trips.toLocaleString()} trips</span>
                    <span className="font-semibold">${vehicle.revenue.toLocaleString()}</span>
                  </div>
                  <Progress value={(vehicle.revenue / vehicleBreakdown[0].revenue) * 100} className="mt-2 h-1.5" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Earning Drivers */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Commission Generators
            </CardTitle>
            <CardDescription>Drivers generating highest platform commission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEarningDrivers.map((driver, index) => (
                <motion.div
                  key={driver.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-teal-400/20">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">{driver.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.trips} trips</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${driver.commission.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">commission</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCommissionAnalytics;
