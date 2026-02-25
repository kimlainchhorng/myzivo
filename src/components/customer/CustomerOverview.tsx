import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, Plane, Hotel, MapPin, TrendingUp, ArrowUpRight, Sparkles, ChevronRight, Calendar, CreditCard, Star, Clock, Wallet, Gift, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CustomerOverview = () => {
  const { user } = useAuth();

  // Fetch real stats from all booking tables
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["customer-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const [trips, foodOrders, carRentals, flights, hotels] = await Promise.all([
        supabase.from("trips").select("id, fare_amount", { count: "exact" }).eq("rider_id", user.id),
        supabase.from("food_orders").select("id, total_amount", { count: "exact" }).eq("customer_id", user.id),
        supabase.from("car_rentals").select("id, total_amount", { count: "exact" }).eq("customer_id", user.id),
        supabase.from("flight_bookings").select("id, total_amount", { count: "exact" }).eq("customer_id", user.id),
        supabase.from("hotel_bookings").select("id, total_amount", { count: "exact" }).eq("customer_id", user.id),
      ]);
      
      const totalSpent = 
        (trips.data?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0) +
        (foodOrders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0) +
        (carRentals.data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0) +
        (flights.data?.reduce((sum, f) => sum + (f.total_amount || 0), 0) || 0) +
        (hotels.data?.reduce((sum, h) => sum + (h.total_amount || 0), 0) || 0);

      const totalBookings = (trips.count || 0) + (foodOrders.count || 0) + (carRentals.count || 0) + (flights.count || 0) + (hotels.count || 0);

      return {
        rides: trips.count || 0,
        foodOrders: foodOrders.count || 0,
        carRentals: carRentals.count || 0,
        flights: flights.count || 0,
        hotels: hotels.count || 0,
        totalSpent,
        totalBookings,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["customer-recent-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const [trips, foodOrders, hotels, flights, carRentals] = await Promise.all([
        supabase.from("trips").select("id, pickup_address, fare_amount, created_at, status").eq("rider_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("food_orders").select("id, delivery_address, total_amount, created_at, status, restaurants(name)").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("hotel_bookings").select("id, total_amount, created_at, status, hotels(name)").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(2),
        supabase.from("flight_bookings").select("id, total_amount, created_at, status, flights(departure_city, arrival_city)").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(2),
        supabase.from("car_rentals").select("id, total_amount, created_at, status, rental_cars(make, model)").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(2),
      ]);

      const activities: any[] = [];
      
      trips.data?.forEach(t => activities.push({ type: "ride", description: t.pickup_address?.slice(0, 30) + "...", date: t.created_at, amount: t.fare_amount, icon: MapPin, gradient: "from-rides to-green-500", status: t.status }));
      foodOrders.data?.forEach((o: any) => activities.push({ type: "food", description: o.restaurants?.name || "Restaurant", date: o.created_at, amount: o.total_amount, icon: UtensilsCrossed, gradient: "from-eats to-red-500", status: o.status }));
      hotels.data?.forEach((h: any) => activities.push({ type: "hotel", description: h.hotels?.name || "Hotel", date: h.created_at, amount: h.total_amount, icon: Hotel, gradient: "from-amber-500 to-orange-600", status: h.status }));
      flights.data?.forEach((f: any) => activities.push({ type: "flight", description: `${f.flights?.departure_city || ""} → ${f.flights?.arrival_city || ""}`, date: f.created_at, amount: f.total_amount, icon: Plane, gradient: "from-sky-500 to-blue-600", status: f.status }));
      carRentals.data?.forEach((c: any) => activities.push({ type: "car", description: `${c.rental_cars?.make || ""} ${c.rental_cars?.model || ""}`, date: c.created_at, amount: c.total_amount, icon: Car, gradient: "from-primary to-teal-400", status: c.status }));

      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    },
    enabled: !!user?.id,
  });

  const statCards = [
    { label: "Rides", value: stats?.rides || 0, icon: MapPin, gradient: "from-rides to-green-500", color: "text-rides" },
    { label: "Food", value: stats?.foodOrders || 0, icon: UtensilsCrossed, gradient: "from-eats to-red-500", color: "text-eats" },
    { label: "Cars", value: stats?.carRentals || 0, icon: Car, gradient: "from-primary to-teal-400", color: "text-primary" },
    { label: "Flights", value: stats?.flights || 0, icon: Plane, gradient: "from-sky-500 to-blue-600", color: "text-sky-500" },
    { label: "Hotels", value: stats?.hotels || 0, icon: Hotel, gradient: "from-amber-500 to-orange-600", color: "text-amber-500" },
  ];

  const quickActions = [
    { label: "Book Ride", icon: MapPin, gradient: "from-rides to-green-500", href: "/ride", description: "Get a ride now" },
    { label: "Order Food", icon: UtensilsCrossed, gradient: "from-eats to-red-500", href: "/food", description: "Hungry? Order up" },
    { label: "Book Flight", icon: Plane, gradient: "from-sky-500 to-blue-600", href: "/book-flight", description: "Find flights" },
    { label: "Book Hotel", icon: Hotel, gradient: "from-amber-500 to-orange-600", href: "/book-hotel", description: "Places to stay" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(date, "MMM d, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "in_progress": case "preparing": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's your activity overview.</p>
        </div>
        
        {/* Wallet Summary */}
        {!statsLoading && stats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                <p className="font-bold text-xl">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Bookings</p>
                <p className="font-bold text-xl">{stats.totalBookings}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid - Premium Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  {!statsLoading && stat.value > 0 && (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-0">
                      Active
                    </Badge>
                  )}
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <motion.p 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold"
                  >
                    {stat.value}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-xl h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <span>Recent Activity</span>
                </div>
                <Link to="/trip-history" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  View all
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </CardTitle>
              <CardDescription>Your latest bookings and orders</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {activityLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                        <Skeleton className="h-11 w-11 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))
                  ) : recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${activity.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                            <activity.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[160px]">{activity.description}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                              <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5 border capitalize", getStatusColor(activity.status))}>
                                {activity.status?.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">${activity.amount?.toFixed(2) || "0.00"}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="font-medium text-muted-foreground">No recent activity</p>
                      <p className="text-xs text-muted-foreground mt-1">Book your first trip!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card backdrop-blur-xl shadow-xl h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.02] to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30">
                  <Sparkles className="h-5 w-5 text-secondary-foreground" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Book your next adventure</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.08 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={action.href}
                      className="flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/20 border border-border/30 hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 group"
                    >
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg mb-3 group-hover:scale-110 group-hover:shadow-xl transition-all`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-semibold text-sm">{action.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{action.description}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Additional quick links */}
              <div className="mt-5 pt-5 border-t border-border/30">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/rent-car"
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Rent Car</span>
                  </Link>
                  <Link
                    to="/promotions"
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Gift className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium">Promos</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerOverview;
