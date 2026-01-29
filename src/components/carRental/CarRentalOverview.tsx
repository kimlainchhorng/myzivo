import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, Calendar, TrendingUp, Sparkles, ArrowUpRight, ChevronRight, Gauge, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, subDays, format } from "date-fns";
import { cn } from "@/lib/utils";

const CarRentalOverview = () => {
  const { user } = useAuth();

  // Fetch rental stats
  const { data: rentalStats, isLoading: statsLoading } = useQuery({
    queryKey: ["car-rental-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const todayStart = startOfDay(new Date()).toISOString();
      const yesterdayStart = startOfDay(subDays(new Date(), 1)).toISOString();
      
      const [todayRentals, yesterdayRentals, allRentals, cars] = await Promise.all([
        supabase
          .from("car_rentals")
          .select("id, total_amount, status")
          .gte("created_at", todayStart),
        supabase
          .from("car_rentals")
          .select("id, total_amount")
          .gte("created_at", yesterdayStart)
          .lt("created_at", todayStart),
        supabase
          .from("car_rentals")
          .select("id, status, total_amount"),
        supabase
          .from("rental_cars")
          .select("id, is_available"),
      ]);
      
      const todayRevenue = todayRentals.data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayRentals.data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
      const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0) : 0;
      
      const activeRentals = allRentals.data?.filter(r => r.status === 'confirmed').length || 0;
      const totalCars = cars.data?.length || 0;
      const rentedCars = cars.data?.filter(c => !c.is_available).length || 0;
      const utilization = totalCars > 0 ? Math.round((rentedCars / totalCars) * 100) : 0;
      const totalRevenue = allRentals.data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
      
      return {
        activeRentals,
        todayRevenue,
        revenueChange,
        totalBookings: allRentals.data?.length || 0,
        utilization,
        totalRevenue,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["car-rental-recent-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("car_rentals")
        .select(`
          id,
          status,
          total_amount,
          pickup_date,
          return_date,
          pickup_location,
          total_days,
          rental_cars (
            id,
            make,
            model,
            year,
            image_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch available cars
  const { data: availableCars, isLoading: carsLoading } = useQuery({
    queryKey: ["available-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_cars")
        .select("id, make, model, year, daily_rate, category, image_url")
        .eq("is_available", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = statsLoading || bookingsLoading || carsLoading;

  const stats = [
    { 
      label: "Active Rentals", 
      value: String(rentalStats?.activeRentals || 0), 
      icon: Car, 
      gradient: "from-primary to-teal-400", 
      trend: `+${rentalStats?.activeRentals || 0}`, 
      trendUp: true 
    },
    { 
      label: "Revenue", 
      value: `$${(rentalStats?.todayRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-green-600", 
      trend: `${Number(rentalStats?.revenueChange) >= 0 ? '+' : ''}${rentalStats?.revenueChange || 0}%`, 
      trendUp: Number(rentalStats?.revenueChange) >= 0 
    },
    { 
      label: "Total Bookings", 
      value: String(rentalStats?.totalBookings || 0), 
      icon: Calendar, 
      gradient: "from-amber-500 to-orange-500", 
      trend: "+5", 
      trendUp: true 
    },
    { 
      label: "Fleet Utilization", 
      value: `${rentalStats?.utilization || 0}%`, 
      icon: Gauge, 
      gradient: "from-blue-500 to-indigo-500", 
      trend: "+8%", 
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

  return (
    <div className="space-y-6 relative">
      {/* Floating Decorations */}
      <div className="absolute -top-2 right-16 text-3xl pointer-events-none hidden md:block animate-float-icon">
        🚗
      </div>
      <div className="absolute top-24 right-4 text-2xl pointer-events-none hidden md:block animate-pulse-slow">
        ✨
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="animate-wiggle">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            Car Rental Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your fleet and bookings with ease</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:scale-[1.02]">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    <div className={`flex items-center gap-0.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.trend}
                    </div>
                  )}
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: "300ms" }}>
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-xl h-full overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 transition-transform hover:scale-110">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Recent Bookings
                    <span className="text-lg">📋</span>
                  </CardTitle>
                  <CardDescription>Latest rental bookings</CardDescription>
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
                    const car = booking.rental_cars;
                    
                    return (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${400 + index * 80}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-lg group-hover:scale-110 transition-transform">
                            <Car className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {car?.make} {car?.model}
                              </span>
                              <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border text-xs`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${booking.status === 'confirmed' ? 'animate-pulse' : ''}`} />
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.total_days} days • {booking.pickup_location}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {booking.pickup_date ? format(new Date(booking.pickup_date), "MMM d") : ""} - {booking.return_date ? format(new Date(booking.return_date), "MMM d, yyyy") : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">${booking.total_amount?.toFixed(2) || "0.00"}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: "300ms" }}>
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-xl h-full overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 transition-transform hover:scale-110">
                    <Car className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Available Fleet
                      <span className="text-lg">🚗</span>
                    </CardTitle>
                    <CardDescription>Cars ready for rental</CardDescription>
                  </div>
                </div>
                <button className="text-sm text-primary hover:underline font-medium">View All →</button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {carsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
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
              ) : availableCars && availableCars.length > 0 ? (
                <div className="space-y-3">
                  {availableCars.map((car: any, index: number) => (
                    <div 
                      key={car.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group cursor-pointer animate-in fade-in slide-in-from-right-2 duration-300"
                      style={{ animationDelay: `${400 + index * 80}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-lg group-hover:scale-110 transition-transform">
                          <Car className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">
                            {car.make} {car.model}
                          </p>
                          <p className="text-xs text-muted-foreground">{car.year} • {car.category}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border font-bold">
                        ${car.daily_rate}/day
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No cars available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarRentalOverview;
