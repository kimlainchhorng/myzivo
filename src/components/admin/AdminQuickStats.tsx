import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Car, MapPin, DollarSign, TrendingUp, TrendingDown,
  Utensils, Plane, Building2, Star, Clock, Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, change, icon: Icon, color, isLoading }: StatCardProps) => (
  <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden group hover:shadow-lg transition-all">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs mt-1",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(change)}% vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminQuickStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [
        usersRes, 
        driversRes, 
        tripsRes, 
        ordersRes,
        restaurantsRes,
        hotelsRes,
        flightsRes,
        payoutsRes
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("drivers").select("id, is_online", { count: "exact" }),
        supabase.from("trips").select("id, fare_amount, status", { count: "exact" }),
        supabase.from("food_orders").select("id, total_amount", { count: "exact" }),
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("hotel_bookings").select("id", { count: "exact", head: true }),
        supabase.from("flight_bookings").select("id", { count: "exact", head: true }),
        supabase.from("payouts").select("amount, status"),
      ]);

      const onlineDrivers = driversRes.data?.filter((d: any) => d.is_online).length || 0;
      const tripRevenue = tripsRes.data?.reduce((acc: number, t: any) => acc + (t.fare_amount || 0), 0) || 0;
      const orderRevenue = ordersRes.data?.reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0) || 0;
      const pendingPayouts = payoutsRes.data?.filter((p: any) => p.status === 'pending').reduce((acc: number, p: any) => acc + (p.amount || 0), 0) || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalDrivers: driversRes.count || 0,
        onlineDrivers,
        totalTrips: tripsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRestaurants: restaurantsRes.count || 0,
        totalHotelBookings: hotelsRes.count || 0,
        totalFlightBookings: flightsRes.count || 0,
        totalRevenue: tripRevenue + orderRevenue,
        pendingPayouts,
      };
    },
  });

  const statsConfig = [
    { title: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "bg-blue-500/10 text-blue-500", change: 12 },
    { title: "Online Drivers", value: stats?.onlineDrivers?.toLocaleString() || "0", icon: Car, color: "bg-green-500/10 text-green-500" },
    { title: "Total Trips", value: stats?.totalTrips?.toLocaleString() || "0", icon: MapPin, color: "bg-purple-500/10 text-purple-500", change: 8 },
    { title: "Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500", change: 15 },
    { title: "Food Orders", value: stats?.totalOrders?.toLocaleString() || "0", icon: Utensils, color: "bg-amber-500/10 text-amber-500", change: 5 },
    { title: "Restaurants", value: stats?.totalRestaurants?.toLocaleString() || "0", icon: Utensils, color: "bg-rose-500/10 text-rose-500" },
    { title: "Flight Bookings", value: stats?.totalFlightBookings?.toLocaleString() || "0", icon: Plane, color: "bg-sky-500/10 text-sky-500" },
    { title: "Hotel Bookings", value: stats?.totalHotelBookings?.toLocaleString() || "0", icon: Building2, color: "bg-amber-500/10 text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {statsConfig.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          change={stat.change}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default AdminQuickStats;
