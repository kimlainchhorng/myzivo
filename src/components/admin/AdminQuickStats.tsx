import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Car, MapPin, DollarSign, TrendingUp, TrendingDown,
  Utensils, Plane, Building2, Wallet, Clock, Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  iconColor: string;
  isLoading?: boolean;
  sparklineData?: number[];
}

const StatCard = ({ title, value, change, icon: Icon, color, iconColor, isLoading, sparklineData }: StatCardProps) => {
  // Convert sparkline data to chart format
  const chartData = sparklineData?.map((v, i) => ({ value: v, index: i })) || [];

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden group hover:shadow-lg hover:bg-card/70 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-20 mt-1" />
            ) : (
              <p className="text-xl font-bold mt-0.5 truncate">{value}</p>
            )}
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                change >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", color)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
        
        {/* Mini Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-8 mt-2 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill={`url(#gradient-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
        payoutsRes,
        recentTripsRes
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("drivers").select("id, is_online", { count: "exact" }),
        supabase.from("trips").select("id, fare_amount, status", { count: "exact" }),
        supabase.from("food_orders").select("id, total_amount", { count: "exact" }),
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("hotel_bookings").select("id", { count: "exact", head: true }),
        supabase.from("flight_bookings").select("id", { count: "exact", head: true }),
        supabase.from("payouts").select("amount, status"),
        supabase.from("trips").select("fare_amount, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      const onlineDrivers = driversRes.data?.filter((d: any) => d.is_online).length || 0;
      const tripRevenue = tripsRes.data?.reduce((acc: number, t: any) => acc + (t.fare_amount || 0), 0) || 0;
      const orderRevenue = ordersRes.data?.reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0) || 0;
      const pendingPayouts = payoutsRes.data?.filter((p: any) => p.status === 'pending').reduce((acc: number, p: any) => acc + (p.amount || 0), 0) || 0;
      
      // Generate sparkline data from recent trips
      const revenueSparkline = recentTripsRes.data?.map((t: any) => t.fare_amount || 0).reverse() || [];

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
        revenueSparkline,
      };
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const statsConfig = [
    { 
      title: "Total Users", 
      value: stats?.totalUsers?.toLocaleString() || "0", 
      icon: Users, 
      color: "bg-blue-500/10", 
      iconColor: "text-blue-500",
      change: 12,
      sparklineData: [20, 25, 22, 30, 28, 35, 32]
    },
    { 
      title: "Online Drivers", 
      value: stats?.onlineDrivers?.toLocaleString() || "0", 
      icon: Car, 
      color: "bg-green-500/10", 
      iconColor: "text-green-500",
      sparklineData: [5, 8, 6, 10, 12, 9, 11]
    },
    { 
      title: "Total Trips", 
      value: stats?.totalTrips?.toLocaleString() || "0", 
      icon: MapPin, 
      color: "bg-purple-500/10", 
      iconColor: "text-purple-500",
      change: 8,
      sparklineData: [100, 120, 115, 140, 135, 150, 145]
    },
    { 
      title: "Revenue", 
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-emerald-500/10", 
      iconColor: "text-emerald-500",
      change: 15,
      sparklineData: stats?.revenueSparkline || [500, 600, 550, 700, 680, 750, 720]
    },
    { 
      title: "Food Orders", 
      value: stats?.totalOrders?.toLocaleString() || "0", 
      icon: Utensils, 
      color: "bg-amber-500/10", 
      iconColor: "text-amber-500",
      change: 5,
      sparklineData: [40, 45, 50, 48, 55, 52, 60]
    },
    { 
      title: "Restaurants", 
      value: stats?.totalRestaurants?.toLocaleString() || "0", 
      icon: Utensils, 
      color: "bg-rose-500/10", 
      iconColor: "text-rose-500",
    },
    { 
      title: "Flights", 
      value: stats?.totalFlightBookings?.toLocaleString() || "0", 
      icon: Plane, 
      color: "bg-sky-500/10", 
      iconColor: "text-sky-500",
      sparklineData: [10, 15, 12, 18, 20, 16, 22]
    },
    { 
      title: "Hotels", 
      value: stats?.totalHotelBookings?.toLocaleString() || "0", 
      icon: Building2, 
      color: "bg-amber-500/10", 
      iconColor: "text-amber-500",
      sparklineData: [8, 10, 9, 12, 14, 11, 15]
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {statsConfig.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          iconColor={stat.iconColor}
          change={stat.change}
          isLoading={isLoading}
          sparklineData={stat.sparklineData}
        />
      ))}
    </div>
  );
};

export default AdminQuickStats;
