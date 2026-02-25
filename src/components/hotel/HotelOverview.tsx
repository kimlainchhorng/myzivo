import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, DollarSign, Users, Star, ArrowUpRight, Sparkles, TrendingUp, Calendar, BedDouble, AlertCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, subDays, format } from "date-fns";

const HotelOverview = () => {
  const { user } = useAuth();

  // Fetch hotel data
  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ["user-hotel-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch booking stats
  const { data: bookingStats, isLoading: statsLoading } = useQuery({
    queryKey: ["hotel-booking-stats", hotel?.id],
    queryFn: async () => {
      if (!hotel?.id) return null;
      
      const todayStart = startOfDay(new Date()).toISOString();
      const yesterdayStart = startOfDay(subDays(new Date(), 1)).toISOString();
      
      const [todayBookings, yesterdayBookings, allBookings, rooms] = await Promise.all([
        supabase
          .from("hotel_bookings")
          .select("id, total_amount, status, created_at")
          .eq("hotel_id", hotel.id)
          .gte("created_at", todayStart),
        supabase
          .from("hotel_bookings")
          .select("id, total_amount")
          .eq("hotel_id", hotel.id)
          .gte("created_at", yesterdayStart)
          .lt("created_at", todayStart),
        supabase
          .from("hotel_bookings")
          .select("id, status, total_amount, nights")
          .eq("hotel_id", hotel.id),
        supabase
          .from("hotel_rooms")
          .select("id, total_rooms, is_available")
          .eq("hotel_id", hotel.id),
      ]);
      
      const todayRevenue = todayBookings.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayBookings.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0) : 0;
      
      const totalRooms = rooms.data?.reduce((sum, r) => sum + (r.total_rooms || 0), 0) || 0;
      const occupiedRooms = allBookings.data?.filter(b => b.status === 'confirmed').length || 0;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      
      const confirmedCount = allBookings.data?.filter(b => b.status === 'confirmed').length || 0;
      const pendingCount = allBookings.data?.filter(b => b.status === 'pending').length || 0;
      const totalRevenue = allBookings.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      
      return {
        todayBookings: todayBookings.data?.length || 0,
        todayRevenue,
        revenueChange,
        occupancyRate,
        confirmedCount,
        pendingCount,
        totalBookings: allBookings.data?.length || 0,
        totalRevenue,
        totalRooms,
      };
    },
    enabled: !!hotel?.id,
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["hotel-recent-bookings", hotel?.id],
    queryFn: async () => {
      if (!hotel?.id) return [];
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select("id, guest_name, status, total_amount, check_in_date, check_out_date, nights, guests, booking_reference")
        .eq("hotel_id", hotel.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!hotel?.id,
  });

  // Fetch room types
  const { data: roomTypes, isLoading: roomsLoading } = useQuery({
    queryKey: ["hotel-room-types", hotel?.id],
    queryFn: async () => {
      if (!hotel?.id) return [];
      const { data, error } = await supabase
        .from("hotel_rooms")
        .select("id, name, room_type, total_rooms, price_per_night, is_available")
        .eq("hotel_id", hotel.id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!hotel?.id,
  });

  const isLoading = hotelLoading || statsLoading || bookingsLoading || roomsLoading;

  const stats = [
    { 
      label: "Bookings Today", 
      value: String(bookingStats?.todayBookings || 0), 
      icon: Hotel, 
      gradient: "from-amber-500 to-orange-600", 
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
      label: "Occupancy", 
      value: `${bookingStats?.occupancyRate || 0}%`, 
      icon: Users, 
      gradient: "from-blue-500 to-indigo-600", 
      trend: "+8%", 
      trendUp: true 
    },
    { 
      label: "Avg Rating", 
      value: hotel?.rating?.toFixed(1) || "4.7", 
      icon: Star, 
      gradient: "from-primary to-teal-400", 
      trend: "+0.2", 
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

  if (!hotel && !hotelLoading) {
    return (
      <div className="space-y-6 relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Hotel Dashboard
          </h1>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Hotel Found</p>
            <p className="text-muted-foreground">Register your hotel to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-0 right-12 pointer-events-none opacity-20 hidden lg:block"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center backdrop-blur-sm">
          <Hotel className="w-6 h-6 text-amber-500/50" />
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        className="absolute top-20 right-0 pointer-events-none opacity-15 hidden lg:block"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center backdrop-blur-sm">
          <BedDouble className="w-5 h-5 text-blue-500/50" />
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-8 pointer-events-none opacity-10 hidden lg:block"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-primary/50" />
        </div>
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
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
            {hotel?.name || "Hotel Dashboard"}
          </h1>
          <p className="text-muted-foreground">Manage hotels and reservations</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-sm font-medium text-amber-500">Live Data</span>
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
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest guest reservations</CardDescription>
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
                    return (
                      <motion.div 
                        key={booking.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.08 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{booking.guest_name || "Guest"}</span>
                            <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border text-xs`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'pending' ? 'animate-pulse' : ''}`} />
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.check_in_date), "MMM d")} - {format(new Date(booking.check_out_date), "MMM d")} • {booking.nights} nights
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">Ref: {booking.booking_reference}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">${booking.total_amount?.toFixed(2) || "0.00"}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BedDouble className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Room Types</CardTitle>
                  <CardDescription>Availability & pricing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {roomsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : roomTypes && roomTypes.length > 0 ? (
                <div className="space-y-3">
                  {roomTypes.map((room: any, index: number) => (
                    <motion.div 
                      key={room.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-blue-500/20 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                          <BedDouble className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{room.total_rooms} rooms</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-blue-500">${room.price_per_night}</p>
                        <Badge variant={room.is_available ? "default" : "secondary"} className="text-xs">
                          {room.is_available ? "Available" : "Full"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BedDouble className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No rooms configured</p>
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">Quick Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    {isLoading ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <p className="text-xl font-bold text-amber-500">{bookingStats?.confirmedCount || 0}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    {isLoading ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <p className="text-xl font-bold text-blue-500">{bookingStats?.pendingCount || 0}</p>
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

export default HotelOverview;
