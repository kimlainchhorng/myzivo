import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, DollarSign, Users, TrendingUp, ArrowUpRight, Sparkles, Calendar, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, subDays, format } from "date-fns";

const FlightOverview = () => {
  const { user } = useAuth();

  // Fetch booking stats
  const { data: bookingStats, isLoading: statsLoading } = useQuery({
    queryKey: ["flight-booking-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const todayStart = startOfDay(new Date()).toISOString();
      const yesterdayStart = startOfDay(subDays(new Date(), 1)).toISOString();
      
      const [todayBookings, yesterdayBookings, allBookings] = await Promise.all([
        supabase
          .from("flight_bookings")
          .select("id, total_amount, total_passengers, status")
          .gte("created_at", todayStart),
        supabase
          .from("flight_bookings")
          .select("id, total_amount")
          .gte("created_at", yesterdayStart)
          .lt("created_at", todayStart),
        supabase
          .from("flight_bookings")
          .select("id, status, total_amount, total_passengers"),
      ]);
      
      const todayRevenue = todayBookings.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayBookings.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0) : 0;
      
      const totalPassengers = todayBookings.data?.reduce((sum, b) => sum + (b.total_passengers || 0), 0) || 0;
      const confirmedCount = allBookings.data?.filter(b => b.status === 'confirmed').length || 0;
      const pendingCount = allBookings.data?.filter(b => b.status === 'pending').length || 0;
      const totalRevenue = allBookings.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      
      return {
        todayBookings: todayBookings.data?.length || 0,
        todayRevenue,
        revenueChange,
        totalPassengers,
        confirmedCount,
        pendingCount,
        totalBookings: allBookings.data?.length || 0,
        totalRevenue,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["flight-recent-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("flight_bookings")
        .select(`
          id,
          booking_reference,
          status,
          total_amount,
          total_passengers,
          cabin_class,
          created_at,
          flights (
            id,
            flight_number,
            departure_city,
            arrival_city,
            departure_time,
            arrival_time,
            airlines (
              name,
              code
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch popular routes
  const { data: popularRoutes, isLoading: routesLoading } = useQuery({
    queryKey: ["popular-flight-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("id, departure_city, arrival_city, economy_price, departure_airport, arrival_airport")
        .eq("is_active", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = statsLoading || bookingsLoading || routesLoading;

  const stats = [
    { 
      label: "Bookings Today", 
      value: String(bookingStats?.todayBookings || 0), 
      icon: Plane, 
      gradient: "from-sky-500 to-blue-600", 
      trend: `+${bookingStats?.todayBookings || 0}`, 
      trendUp: true 
    },
    { 
      label: "Revenue", 
      value: `$${(bookingStats?.todayRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-green-600", 
      trend: `${Number(bookingStats?.revenueChange) >= 0 ? '+' : ''}${bookingStats?.revenueChange || 0}%`, 
      trendUp: Number(bookingStats?.revenueChange) >= 0 
    },
    { 
      label: "Passengers", 
      value: String(bookingStats?.totalPassengers || 0), 
      icon: Users, 
      gradient: "from-amber-500 to-orange-600", 
      trend: "+12%", 
      trendUp: true 
    },
    { 
      label: "Total Bookings", 
      value: String(bookingStats?.totalBookings || 0), 
      icon: TrendingUp, 
      gradient: "from-primary to-teal-400", 
      trend: "+5%", 
      trendUp: true 
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "pending": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
      case "completed": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" };
    }
  };

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

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-0 right-12 text-3xl pointer-events-none opacity-20 hidden lg:block"
      >
        ✈️
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute top-24 right-0 text-2xl pointer-events-none opacity-15 hidden lg:block"
      >
        🌤️
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-sky-500" />
            </motion.div>
            Flight Booking Dashboard
          </h1>
          <p className="text-muted-foreground">Manage flights and bookings</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="text-sm font-medium text-sky-500">Live Data</span>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.trend}
                    </div>
                  )}
                </div>
                {isLoading ? (
                  <Skeleton className="h-9 w-20 mb-1" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl h-full overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10">
                  <Calendar className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest flight reservations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {bookingsLoading ? (
                <div className="divide-y divide-border/50">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentBookings.map((booking: any, index: number) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const flight = booking.flights;
                    
                    return (
                      <motion.div 
                        key={booking.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.08 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {flight?.departure_city} → {flight?.arrival_city}
                            </span>
                            <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border text-xs`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'pending' ? 'animate-pulse' : ''}`} />
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {flight?.airlines?.name} {flight?.flight_number} • {booking.cabin_class}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">Ref: {booking.booking_reference}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">${booking.total_amount?.toFixed(2) || "0.00"}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-500 transition-all duration-200" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plane className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl h-full overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-500/10">
                    <Plane className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <CardTitle>Available Routes</CardTitle>
                    <CardDescription>Popular flight destinations</CardDescription>
                  </div>
                </div>
                <button className="text-sm text-sky-500 hover:underline">View All</button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {routesLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : popularRoutes && popularRoutes.length > 0 ? (
                <div className="space-y-3">
                  {popularRoutes.map((route: any, index: number) => (
                    <motion.div 
                      key={route.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.08 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-sky-500/20 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                          <Plane className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{route.departure_city} → {route.arrival_city}</p>
                          <p className="text-xs text-muted-foreground">{route.departure_airport} - {route.arrival_airport}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-sky-500">From ${route.economy_price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Plane className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No routes available</p>
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-sky-500" />
                  <span className="font-semibold">Quick Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-xl bg-background/50">
                    {isLoading ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <p className="text-xl font-bold text-sky-500">{bookingStats?.confirmedCount || 0}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-background/50">
                    {isLoading ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <p className="text-xl font-bold text-amber-500">{bookingStats?.pendingCount || 0}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FlightOverview;
