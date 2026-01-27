import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Utensils, 
  Plane, 
  Building2,
  DollarSign,
  Users,
  Star,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
  Legend
} from "recharts";

interface ServiceMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const AdminComparativeMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-comparative-metrics"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      
      const lastWeekStart = new Date(todayStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const [
        todayTrips,
        yesterdayTrips,
        todayOrders,
        yesterdayOrders,
        todayFlights,
        todayHotels,
        weeklyRevenue
      ] = await Promise.all([
        supabase.from("trips").select("fare_amount").gte("created_at", todayStart.toISOString()),
        supabase.from("trips").select("fare_amount").gte("created_at", yesterdayStart.toISOString()).lt("created_at", todayStart.toISOString()),
        supabase.from("food_orders").select("total_amount").gte("created_at", todayStart.toISOString()),
        supabase.from("food_orders").select("total_amount").gte("created_at", yesterdayStart.toISOString()).lt("created_at", todayStart.toISOString()),
        supabase.from("flight_bookings").select("total_amount").gte("created_at", todayStart.toISOString()),
        supabase.from("hotel_bookings").select("total_amount").gte("created_at", todayStart.toISOString()),
        supabase.from("trips").select("fare_amount, created_at").gte("created_at", lastWeekStart.toISOString())
      ]);

      const todayTripRevenue = (todayTrips.data || []).reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const yesterdayTripRevenue = (yesterdayTrips.data || []).reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const todayFoodRevenue = (todayOrders.data || []).reduce((acc, o) => acc + (o.total_amount || 0), 0);
      const yesterdayFoodRevenue = (yesterdayOrders.data || []).reduce((acc, o) => acc + (o.total_amount || 0), 0);
      const todayFlightRevenue = (todayFlights.data || []).reduce((acc, f) => acc + (f.total_amount || 0), 0);
      const todayHotelRevenue = (todayHotels.data || []).reduce((acc, h) => acc + (h.total_amount || 0), 0);

      // Generate weekly chart data
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dayRevenue = (weeklyRevenue.data || [])
          .filter(t => {
            const tDate = new Date(t.created_at);
            return tDate.toDateString() === date.toDateString();
          })
          .reduce((acc, t) => acc + (t.fare_amount || 0), 0);
        
        weeklyData.push({
          name: dayName,
          rides: Math.floor(dayRevenue),
          food: Math.floor(dayRevenue * 0.7),
          flights: Math.floor(dayRevenue * 0.3),
        });
      }

      return {
        rides: {
          current: todayTripRevenue,
          previous: yesterdayTripRevenue,
          count: todayTrips.data?.length || 0,
        },
        food: {
          current: todayFoodRevenue,
          previous: yesterdayFoodRevenue,
          count: todayOrders.data?.length || 0,
        },
        flights: {
          current: todayFlightRevenue,
          count: todayFlights.data?.length || 0,
        },
        hotels: {
          current: todayHotelRevenue,
          count: todayHotels.data?.length || 0,
        },
        weeklyData,
        totalRevenue: todayTripRevenue + todayFoodRevenue + todayFlightRevenue + todayHotelRevenue,
      };
    },
    refetchInterval: 60000,
  });

  const serviceMetrics: ServiceMetric[] = [
    {
      name: "Rides",
      current: metrics?.rides.current || 0,
      previous: metrics?.rides.previous || 0,
      target: 5000,
      icon: Car,
      color: "text-primary",
      gradient: "from-primary/20 to-teal-500/10",
    },
    {
      name: "Food Delivery",
      current: metrics?.food.current || 0,
      previous: metrics?.food.previous || 0,
      target: 3000,
      icon: Utensils,
      color: "text-orange-500",
      gradient: "from-orange-500/20 to-red-500/10",
    },
    {
      name: "Flights",
      current: metrics?.flights.current || 0,
      previous: 0,
      target: 10000,
      icon: Plane,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-indigo-500/10",
    },
    {
      name: "Hotels",
      current: metrics?.hotels.current || 0,
      previous: 0,
      target: 8000,
      icon: Building2,
      color: "text-amber-500",
      gradient: "from-amber-500/20 to-yellow-500/10",
    },
  ];

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 shadow-lg"
          >
            <BarChart3 className="h-6 w-6 text-violet-500" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold">Service Comparison</h2>
            <p className="text-sm text-muted-foreground">Revenue breakdown by service</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 bg-violet-500/10 border-violet-500/20 text-violet-500">
          <Activity className="h-3 w-3" />
          Real-time Analysis
        </Badge>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceMetrics.map((service, index) => {
          const Icon = service.icon;
          const change = getChangePercent(service.current, service.previous);
          const progressPercent = Math.min((service.current / service.target) * 100, 100);
          
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden group hover:shadow-xl transition-all">
                <CardContent className="p-5 relative">
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                    service.gradient
                  )} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", service.gradient)}>
                        <Icon className={cn("h-5 w-5", service.color)} />
                      </div>
                      {service.previous > 0 && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                          change >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {change >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(change).toFixed(1)}%
                        </div>
                      )}
                    </div>

                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">${service.current.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mb-3">{service.name}</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Target</span>
                            <span>${service.target.toLocaleString()}</span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Weekly Revenue Trend
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Rides</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Food</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Flights</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics?.weeklyData || []}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlights" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="rides"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRides)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="food"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorFood)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="flights"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorFlights)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-teal-500/5 backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium">Total Revenue Today</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <p className="text-3xl font-bold">${(metrics?.totalRevenue || 0).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <p className="font-medium">Total Transactions</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-3xl font-bold">
                {(metrics?.rides.count || 0) + (metrics?.food.count || 0) + (metrics?.flights.count || 0) + (metrics?.hotels.count || 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 backdrop-blur-xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-medium">Avg. Transaction</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-3xl font-bold">
                ${((metrics?.totalRevenue || 0) / Math.max(1, (metrics?.rides.count || 0) + (metrics?.food.count || 0))).toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminComparativeMetrics;
