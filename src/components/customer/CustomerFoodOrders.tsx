import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Sparkles, Clock, DollarSign, MapPin, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CustomerFoodOrders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-food-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("food_orders")
        .select("*, restaurants(name, logo_url)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500" };
      case "in_progress": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500" };
      case "confirmed": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500" };
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-eats/20 border-t-eats animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Food Orders
          </h1>
          <p className="text-muted-foreground">Your order history and active orders</p>
        </div>
        <Link to="/food">
          <Button className="gap-2 bg-gradient-to-r from-eats to-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <UtensilsCrossed className="h-4 w-4" />
            Order Food
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-eats/10">
                <UtensilsCrossed className="h-5 w-5 text-eats" />
              </div>
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>All your food orders</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {orders && orders.length > 0 ? (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-border/50"
              >
                {orders.map((order: any) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <motion.div 
                      key={order.id}
                      variants={item}
                      className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-eats to-red-500 shadow-lg group-hover:scale-110 transition-transform">
                        <UtensilsCrossed className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg">{order.restaurants?.name || 'Restaurant'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <p className="truncate">{order.delivery_address}</p>
                            </div>
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border flex-shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${order.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-semibold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
                            <DollarSign className="h-3.5 w-3.5" />
                            {order.total_amount?.toFixed(2)}
                          </span>
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-7">
                              <RefreshCw className="h-3 w-3" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="p-4 rounded-2xl bg-muted/30 w-fit mx-auto mb-4">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">No food orders yet</p>
                <p className="text-sm text-muted-foreground mb-6">Order from your favorite restaurants!</p>
                <Link to="/food">
                  <Button className="gap-2 bg-gradient-to-r from-eats to-red-500">
                    <UtensilsCrossed className="h-4 w-4" />
                    Browse Restaurants
                  </Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerFoodOrders;
