import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, DollarSign, Clock, TrendingUp, Package, Sparkles, ArrowUpRight, ChevronRight, Star, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay } from "date-fns";

const RestaurantOverview = () => {
  const { user } = useAuth();

  // Fetch restaurant data
  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ["user-restaurant-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch today's orders and stats
  const { data: orderStats, isLoading: statsLoading } = useQuery({
    queryKey: ["restaurant-order-stats", restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return null;
      
      const todayStart = startOfDay(new Date()).toISOString();
      const yesterdayStart = startOfDay(subDays(new Date(), 1)).toISOString();
      
      const [todayOrders, yesterdayOrders, allOrders] = await Promise.all([
        supabase
          .from("food_orders")
          .select("id, total_amount, status, created_at")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", todayStart),
        supabase
          .from("food_orders")
          .select("id, total_amount")
          .eq("restaurant_id", restaurant.id)
          .gte("created_at", yesterdayStart)
          .lt("created_at", todayStart),
        supabase
          .from("food_orders")
          .select("id, status")
          .eq("restaurant_id", restaurant.id),
      ]);
      
      const todayRevenue = todayOrders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const yesterdayRevenue = yesterdayOrders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0) : 0;
      
      const pendingCount = allOrders.data?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0;
      const completedCount = allOrders.data?.filter(o => o.status === 'completed').length || 0;
      
      return {
        todayOrders: todayOrders.data?.length || 0,
        todayRevenue,
        revenueChange,
        pendingCount,
        completedCount,
        totalOrders: allOrders.data?.length || 0,
      };
    },
    enabled: !!restaurant?.id,
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["restaurant-recent-orders", restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const { data, error } = await supabase
        .from("food_orders")
        .select("id, items, status, total_amount, created_at")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!restaurant?.id,
  });

  const isLoading = restaurantLoading || statsLoading || ordersLoading;

  const stats = [
    { 
      label: "Today's Orders", 
      value: orderStats?.todayOrders || 0, 
      icon: Package, 
      gradient: "from-eats to-red-500", 
      trend: `${(orderStats?.todayOrders || 0) > 0 ? '+' : ''}${orderStats?.todayOrders || 0}` 
    },
    { 
      label: "Revenue", 
      value: `$${(orderStats?.todayRevenue || 0).toFixed(2)}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-green-600", 
      trend: `${Number(orderStats?.revenueChange) >= 0 ? '+' : ''}${orderStats?.revenueChange || 0}%` 
    },
    { 
      label: "Avg Prep Time", 
      value: "18 min", 
      icon: Clock, 
      gradient: "from-amber-500 to-orange-500", 
      trend: "-2 min" 
    },
    { 
      label: "Rating", 
      value: restaurant?.rating?.toFixed(1) || "4.8", 
      icon: Star, 
      gradient: "from-primary to-teal-400", 
      trend: "+0.2" 
    },
  ];

  const quickStats = [
    { label: "Orders Completed", value: String(orderStats?.completedCount || 0), color: "text-emerald-500" },
    { label: "Orders Pending", value: String(orderStats?.pendingCount || 0), color: "text-amber-500" },
    { label: "Total Orders", value: String(orderStats?.totalOrders || 0), color: "text-primary" },
    { label: "Avg Order Value", value: orderStats?.totalOrders ? `$${(orderStats.todayRevenue / Math.max(orderStats.todayOrders, 1)).toFixed(2)}` : "$0.00", color: "text-blue-500" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", dot: "bg-yellow-500" };
      case "confirmed": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
      case "in_progress": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "completed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground" };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return format(date, "MMM d");
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

  if (!restaurant && !restaurantLoading) {
    return (
      <div className="space-y-6 relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-eats" />
            Restaurant Dashboard
          </h1>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Restaurant Found</p>
            <p className="text-muted-foreground">Register your restaurant to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Food Emojis */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-0 right-12 text-3xl pointer-events-none opacity-20 hidden lg:block"
      >
        🍕
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute top-20 right-0 text-2xl pointer-events-none opacity-15 hidden lg:block"
      >
        🍔
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
              <Sparkles className="h-6 w-6 text-eats" />
            </motion.div>
            {restaurant?.name || "Restaurant Dashboard"}
          </h1>
          <p className="text-muted-foreground">Manage your orders and menu</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-eats/10 border border-eats/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eats opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-eats"></span>
          </span>
          <span className="text-sm font-medium text-eats">Live Orders</span>
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
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
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
                <p className="text-xs text-muted-foreground">{stat.label}</p>
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eats to-orange-500" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-eats/10">
                  <Package className="h-5 w-5 text-eats" />
                </div>
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Orders that need your attention</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="divide-y divide-border/50">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentOrders.map((order: any, index: number) => {
                    const statusConfig = getStatusConfig(order.status);
                    const items = Array.isArray(order.items) ? order.items : [];
                    const itemsSummary = items.slice(0, 2).map((i: any) => `${i.quantity || 1}x ${i.name || 'Item'}`).join(", ");
                    
                    return (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.08 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">#{order.id.slice(0, 8)}</span>
                            <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border text-xs`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${order.status === 'pending' || order.status === 'confirmed' ? 'animate-pulse' : ''}`} />
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{itemsSummary || "Order items"}{items.length > 2 ? ` +${items.length - 2} more` : ""}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">${order.total_amount?.toFixed(2) || "0.00"}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-eats transition-colors" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No orders yet</p>
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-400" />
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Today's performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {quickStats.map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground">{stat.label}</span>
                    {isLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantOverview;
