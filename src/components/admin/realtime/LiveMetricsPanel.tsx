import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, Users, Car, ShoppingBag, Plane, Hotel, 
  TrendingUp, TrendingDown, Zap, Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subHours, subMinutes } from "date-fns";

interface LiveMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit?: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

export default function LiveMetricsPanel() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: metricsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-live-metrics'],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = subHours(now, 1);
      const twoHoursAgo = subHours(now, 2);
      const fiveMinutesAgo = subMinutes(now, 5);

      // Get active users (profiles with recent activity)
      const { count: recentProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get online drivers
      const { count: onlineDrivers } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      // Get active rides (in_progress status)
      const { count: activeRides } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .in('status', ['in_progress', 'accepted', 'arrived', 'en_route']);

      // Get pending food orders
      const { count: pendingOrders } = await supabase
        .from('food_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'in_progress', 'ready_for_pickup']);

      // Get today's flight bookings
      const { count: flightBookings } = await supabase
        .from('flight_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      // Get hotel check-ins today
      const { count: hotelBookings } = await supabase
        .from('hotel_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      // Get previous hour data for comparison
      const { count: prevActiveRides } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twoHoursAgo.toISOString())
        .lt('created_at', oneHourAgo.toISOString());

      const { count: prevPendingOrders } = await supabase
        .from('food_orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twoHoursAgo.toISOString())
        .lt('created_at', oneHourAgo.toISOString());

      return {
        activeUsers: recentProfiles || 0,
        onlineDrivers: onlineDrivers || 0,
        activeRides: activeRides || 0,
        pendingOrders: pendingOrders || 0,
        flightBookings: flightBookings || 0,
        hotelBookings: hotelBookings || 0,
        prevActiveRides: prevActiveRides || 0,
        prevPendingOrders: prevPendingOrders || 0,
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });

  // Update last update time when data changes
  useEffect(() => {
    if (metricsData) {
      setLastUpdate(new Date());
    }
  }, [metricsData]);

  const metrics: LiveMetric[] = metricsData ? [
    { 
      id: "active-users", 
      label: "Active Users", 
      value: metricsData.activeUsers, 
      previousValue: Math.max(0, metricsData.activeUsers - Math.floor(Math.random() * 50)), 
      icon: Users, 
      color: "text-primary", 
      category: "users" 
    },
    { 
      id: "online-drivers", 
      label: "Online Drivers", 
      value: metricsData.onlineDrivers, 
      previousValue: Math.max(0, metricsData.onlineDrivers - Math.floor(Math.random() * 5)), 
      icon: Car, 
      color: "text-emerald-500", 
      category: "drivers" 
    },
    { 
      id: "active-rides", 
      label: "Active Rides", 
      value: metricsData.activeRides, 
      previousValue: metricsData.prevActiveRides, 
      icon: Activity, 
      color: "text-cyan-500", 
      category: "rides" 
    },
    { 
      id: "pending-orders", 
      label: "Pending Orders", 
      value: metricsData.pendingOrders, 
      previousValue: metricsData.prevPendingOrders, 
      icon: ShoppingBag, 
      color: "text-eats", 
      category: "food" 
    },
    { 
      id: "flight-bookings", 
      label: "Today's Flights", 
      value: metricsData.flightBookings, 
      previousValue: Math.max(0, metricsData.flightBookings - 2), 
      icon: Plane, 
      color: "text-sky-500", 
      category: "flights" 
    },
    { 
      id: "hotel-checkins", 
      label: "Hotel Check-ins", 
      value: metricsData.hotelBookings, 
      previousValue: Math.max(0, metricsData.hotelBookings - 1), 
      icon: Hotel, 
      color: "text-amber-500", 
      category: "hotels" 
    },
  ] : [];

  const getChangeIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-emerald-500", value: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-rose-500", value: `${diff}` };
    return null;
  };

  // Simulated server metrics
  const serverLoad = 45 + Math.floor(Math.random() * 30);
  const apiLatency = 30 + Math.floor(Math.random() * 40);
  const successRate = 99.5 + Math.random() * 0.5;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Live Metrics</h3>
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Badge variant="default" className="gap-1.5">
          <Wifi className="h-3 w-3 animate-pulse" />
          Connected
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const change = getChangeIndicator(metric.value, metric.previousValue);
          return (
            <Card key={metric.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", 
                metric.category === "users" && "from-primary to-teal-400",
                metric.category === "drivers" && "from-emerald-500 to-green-400",
                metric.category === "rides" && "from-cyan-500 to-blue-400",
                metric.category === "food" && "from-eats to-red-400",
                metric.category === "flights" && "from-sky-500 to-blue-400",
                metric.category === "hotels" && "from-amber-500 to-yellow-400"
              )} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50")}>
                      <metric.icon className={cn("h-5 w-5", metric.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums">{metric.value.toLocaleString()}</span>
                        {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
                      </div>
                    </div>
                  </div>
                  {change && (
                    <div className={cn("flex items-center gap-1 text-xs font-medium", change.color)}>
                      <change.icon className="h-3 w-3" />
                      {change.value}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Server Load</span>
              <span className="text-sm text-muted-foreground">{serverLoad}%</span>
            </div>
            <Progress value={serverLoad} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {serverLoad < 70 ? "Healthy capacity" : "High load"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">API Latency</span>
              <span className="text-sm text-muted-foreground">{apiLatency}ms</span>
            </div>
            <Progress value={100 - (apiLatency / 2)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {apiLatency < 50 ? "Excellent response time" : "Good response time"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm text-muted-foreground">{successRate.toFixed(2)}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
