import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, RefreshCw, User, Car, MapPin, DollarSign, 
  ShoppingBag, Star, AlertCircle, CheckCircle, Clock,
  ArrowRight, Bell, Zap, TrendingUp, Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "trip" | "order" | "payout" | "user" | "driver" | "alert" | "system";
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
  meta?: Record<string, any>;
}

const activityIcons: Record<string, { icon: any; color: string; bg: string }> = {
  trip: { icon: MapPin, color: "text-blue-500", bg: "bg-blue-500/10" },
  order: { icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-500/10" },
  payout: { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  user: { icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
  driver: { icon: Car, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  alert: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  system: { icon: Shield, color: "text-slate-500", bg: "bg-slate-500/10" },
};

const AdminActivityFeed = () => {
  const [filter, setFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: recentTrips, refetch: refetchTrips } = useQuery({
    queryKey: ["admin-recent-trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, status, fare_amount, created_at, pickup_address")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentOrders, refetch: refetchOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select("id, status, total_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentPayouts, refetch: refetchPayouts } = useQuery({
    queryKey: ["admin-recent-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("id, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchTrips(), refetchOrders(), refetchPayouts()]);
    setIsRefreshing(false);
  };

  // Combine all activities into a single timeline
  const activities: ActivityItem[] = [
    ...(recentTrips?.map(trip => ({
      id: `trip-${trip.id}`,
      type: "trip" as const,
      title: "New Trip",
      description: trip.pickup_address?.substring(0, 40) || "Trip started",
      timestamp: new Date(trip.created_at),
      icon: MapPin,
      color: "blue",
      meta: { status: trip.status, amount: trip.fare_amount },
    })) || []),
    ...(recentOrders?.map(order => ({
      id: `order-${order.id}`,
      type: "order" as const,
      title: "Food Order",
      description: `Order placed - $${order.total_amount?.toFixed(2)}`,
      timestamp: new Date(order.created_at),
      icon: ShoppingBag,
      color: "amber",
      meta: { status: order.status, amount: order.total_amount },
    })) || []),
    ...(recentPayouts?.map(payout => ({
      id: `payout-${payout.id}`,
      type: "payout" as const,
      title: "Payout Requested",
      description: `$${payout.amount?.toFixed(2)} payout - ${payout.status}`,
      timestamp: new Date(payout.created_at),
      icon: DollarSign,
      color: "green",
      meta: { status: payout.status, amount: payout.amount },
    })) || []),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-500/10 text-green-500",
      pending: "bg-amber-500/10 text-amber-500",
      in_progress: "bg-blue-500/10 text-blue-500",
      cancelled: "bg-red-500/10 text-red-500",
      processing: "bg-purple-500/10 text-purple-500",
    };
    return statusColors[status] || "bg-slate-500/10 text-slate-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
            <Activity className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Activity Feed</h1>
            <p className="text-muted-foreground">Real-time platform activity stream</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Zap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Trips</p>
              <p className="text-lg font-semibold">
                {recentTrips?.filter(t => t.status === 'in_progress').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-lg font-semibold">
                {recentOrders?.filter(o => o.status === 'pending').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Activity</p>
              <p className="text-lg font-semibold">{activities.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              <p className="text-lg font-semibold">
                {recentPayouts?.filter(p => p.status === 'pending').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stream */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Live stream of platform events</CardDescription>
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="trip">Trips</TabsTrigger>
                <TabsTrigger value="order">Orders</TabsTrigger>
                <TabsTrigger value="payout">Payouts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/50" />
                
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => {
                    const config = activityIcons[activity.type];
                    const Icon = config.icon;
                    return (
                      <div 
                        key={activity.id}
                        className="relative flex items-start gap-4 pl-10 animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute left-0 p-2 rounded-full border-4 border-background",
                          config.bg
                        )}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{activity.title}</p>
                                {activity.meta?.status && (
                                  <Badge 
                                    className={cn(
                                      "text-xs border-transparent capitalize",
                                      getStatusBadge(activity.meta.status)
                                    )}
                                  >
                                    {activity.meta.status.replace("_", " ")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {formatTime(activity.timestamp)}
                              </p>
                              {activity.meta?.amount && (
                                <p className="text-sm font-semibold text-green-500 mt-1">
                                  ${activity.meta.amount.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityFeed;
