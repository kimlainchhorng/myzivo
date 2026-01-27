import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, UtensilsCrossed, Plane, Hotel, MapPin, TrendingUp, ArrowUpRight, Sparkles, ChevronRight, Calendar, CreditCard, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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

      return {
        rides: trips.count || 0,
        foodOrders: foodOrders.count || 0,
        carRentals: carRentals.count || 0,
        flights: flights.count || 0,
        hotels: hotels.count || 0,
        totalSpent,
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
    { label: "Total Rides", value: stats?.rides || 0, icon: MapPin, gradient: "from-rides to-green-500" },
    { label: "Food Orders", value: stats?.foodOrders || 0, icon: UtensilsCrossed, gradient: "from-eats to-red-500" },
    { label: "Car Rentals", value: stats?.carRentals || 0, icon: Car, gradient: "from-primary to-teal-400" },
    { label: "Flights", value: stats?.flights || 0, icon: Plane, gradient: "from-sky-500 to-blue-600" },
    { label: "Hotels", value: stats?.hotels || 0, icon: Hotel, gradient: "from-amber-500 to-orange-600" },
  ];

  const quickActions = [
    { label: "Book Ride", icon: MapPin, gradient: "from-rides to-green-500", href: "/ride" },
    { label: "Order Food", icon: UtensilsCrossed, gradient: "from-eats to-red-500", href: "/food" },
    { label: "Book Flight", icon: Plane, gradient: "from-sky-500 to-blue-600", href: "/book-flight" },
    { label: "Book Hotel", icon: Hotel, gradient: "from-amber-500 to-orange-600", href: "/book-hotel" },
  ];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">Here's an overview of your bookings and activity.</p>
        </div>
        {!statsLoading && stats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20"
          >
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="font-bold text-lg">${stats.totalSpent.toFixed(2)}</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  {statsLoading ? (
                    <Skeleton className="h-4 w-8" />
                  ) : stat.value > 0 && (
                    <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                      <Star className="h-3 w-3 fill-emerald-500" />
                    </div>
                  )}
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest bookings and orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.08 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                          <activity.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[150px]">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${activity.amount?.toFixed(2) || "0.00"}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground">Book your first trip!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <Sparkles className="h-5 w-5 text-secondary-foreground" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription>Book your next adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      to={action.href}
                      className="flex flex-col items-center justify-center p-5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Additional quick links */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/rent-car"
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors text-sm"
                  >
                    <Car className="h-4 w-4 text-primary" />
                    <span>Rent Car</span>
                  </Link>
                  <Link
                    to="/trip-history"
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors text-sm"
                  >
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Trip History</span>
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
