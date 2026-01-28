import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  Car, 
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Utensils,
  Plane,
  Building2,
  RefreshCw,
  Wifi
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: number;
  icon: React.ElementType;
  color: string;
  progress?: number;
  isLoading?: boolean;
  pulse?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  subValue, 
  change, 
  icon: Icon, 
  color, 
  progress,
  isLoading,
  pulse
}: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border-0 bg-card/50 backdrop-blur-xl overflow-hidden group hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-transform group-hover:scale-110", 
            color,
            pulse && "animate-pulse"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
              change >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="h-1 mt-2" />
            )}
          </>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AdminLiveMetrics = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ["admin-live-metrics"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

      const [
        onlineDriversRes,
        activeTripsRes,
        todayTripsRes,
        yesterdayTripsRes,
        todayOrdersRes,
        pendingPayoutsRes,
        activeBookingsRes,
        openTicketsRes,
        revenueRes,
        hotelBookingsRes,
        flightBookingsRes
      ] = await Promise.all([
        supabase.from("drivers").select("id").eq("is_online", true),
        supabase.from("trips").select("id").in("status", ["requested", "accepted", "en_route", "arrived", "in_progress"]),
        supabase.from("trips").select("id, fare_amount").gte("created_at", todayStart),
        supabase.from("trips").select("id").gte("created_at", yesterdayStart).lt("created_at", todayStart),
        supabase.from("food_orders").select("id, total_amount").gte("created_at", todayStart),
        supabase.from("payouts").select("id, amount").eq("status", "pending"),
        supabase.from("car_rentals").select("id").in("status", ["confirmed", "in_progress"]),
        supabase.from("support_tickets").select("id").eq("status", "open"),
        supabase.from("trips").select("fare_amount").eq("status", "completed").gte("created_at", todayStart),
        supabase.from("hotel_bookings").select("id").gte("created_at", todayStart),
        supabase.from("flight_bookings").select("id").gte("created_at", todayStart),
      ]);

      const todayRevenue = (revenueRes.data || []).reduce((acc, t) => acc + (t.fare_amount || 0), 0);
      const foodRevenue = (todayOrdersRes.data || []).reduce((acc, o) => acc + (o.total_amount || 0), 0);
      const pendingPayoutAmount = (pendingPayoutsRes.data || []).reduce((acc, p) => acc + (p.amount || 0), 0);

      const todayTripsCount = todayTripsRes.data?.length || 0;
      const yesterdayTripsCount = yesterdayTripsRes.data?.length || 0;
      const tripChange = yesterdayTripsCount > 0 
        ? Math.round(((todayTripsCount - yesterdayTripsCount) / yesterdayTripsCount) * 100)
        : 0;

      return {
        onlineDrivers: onlineDriversRes.data?.length || 0,
        activeTrips: activeTripsRes.data?.length || 0,
        todayTrips: todayTripsCount,
        tripChange,
        todayOrders: todayOrdersRes.data?.length || 0,
        pendingPayouts: pendingPayoutsRes.data?.length || 0,
        pendingPayoutAmount,
        activeBookings: activeBookingsRes.data?.length || 0,
        openTickets: openTicketsRes.data?.length || 0,
        todayRevenue: todayRevenue + foodRevenue,
        hotelBookings: hotelBookingsRes.data?.length || 0,
        flightBookings: flightBookingsRes.data?.length || 0,
      };
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/20 shadow-lg shadow-green-500/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500 font-semibold tracking-wide">LIVE METRICS</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">Auto-refresh every 30s</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-muted/30">
            <Clock className="h-3 w-3" />
            {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1.5"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Online Drivers"
          value={metrics?.onlineDrivers || 0}
          icon={Car}
          color="bg-green-500/10 text-green-500"
          change={12}
          isLoading={isLoading}
          pulse={metrics?.onlineDrivers && metrics.onlineDrivers > 0}
        />
        <MetricCard
          title="Active Trips"
          value={metrics?.activeTrips || 0}
          subValue="In progress now"
          icon={MapPin}
          color="bg-blue-500/10 text-blue-500"
          isLoading={isLoading}
          pulse={metrics?.activeTrips && metrics.activeTrips > 0}
        />
        <MetricCard
          title="Today's Revenue"
          value={`$${(metrics?.todayRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-emerald-500/10 text-emerald-500"
          change={8}
          isLoading={isLoading}
        />
        <MetricCard
          title="Pending Payouts"
          value={metrics?.pendingPayouts || 0}
          subValue={`$${(metrics?.pendingPayoutAmount || 0).toLocaleString()} total`}
          icon={Zap}
          color="bg-amber-500/10 text-amber-500"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Trips"
          value={metrics?.todayTrips || 0}
          icon={Activity}
          color="bg-purple-500/10 text-purple-500"
          change={metrics?.tripChange}
          isLoading={isLoading}
        />
        <MetricCard
          title="Food Orders Today"
          value={metrics?.todayOrders || 0}
          icon={Utensils}
          color="bg-rose-500/10 text-rose-500"
          change={15}
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Rentals"
          value={metrics?.activeBookings || 0}
          icon={Car}
          color="bg-indigo-500/10 text-indigo-500"
          isLoading={isLoading}
        />
        <MetricCard
          title="Open Tickets"
          value={metrics?.openTickets || 0}
          icon={Activity}
          color={metrics?.openTickets && metrics.openTickets > 5 ? "bg-red-500/10 text-red-500" : "bg-cyan-500/10 text-cyan-500"}
          isLoading={isLoading}
        />
      </div>

      {/* Travel Services */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <MetricCard
          title="Hotel Bookings Today"
          value={metrics?.hotelBookings || 0}
          icon={Building2}
          color="bg-violet-500/10 text-violet-500"
          isLoading={isLoading}
        />
        <MetricCard
          title="Flight Bookings Today"
          value={metrics?.flightBookings || 0}
          icon={Plane}
          color="bg-sky-500/10 text-sky-500"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminLiveMetrics;
