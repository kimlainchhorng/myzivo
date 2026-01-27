import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Check, Package, Sparkles, MapPin, Phone, ChefHat, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

const RestaurantOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch restaurant
  const { data: restaurant } = useQuery({
    queryKey: ["user-restaurant", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["restaurant-orders", restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          items,
          status,
          total_amount,
          delivery_address,
          special_instructions,
          created_at,
          estimated_prep_time
        `)
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!restaurant?.id,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "ready_for_pickup" | "refunded" }) => {
      const { error } = await supabase
        .from("food_orders")
        .update({ status: newStatus })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", dot: "bg-yellow-500", gradient: "from-yellow-500 to-amber-500" };
      case "confirmed": return { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-500" };
      case "in_progress": return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", dot: "bg-blue-500", gradient: "from-blue-500 to-indigo-500" };
      case "completed": return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", dot: "bg-emerald-500", gradient: "from-emerald-500 to-green-600" };
      case "cancelled": return { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", dot: "bg-red-500", gradient: "from-red-500 to-rose-500" };
      default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", dot: "bg-muted-foreground", gradient: "from-muted to-muted" };
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
    return format(date, "MMM d, HH:mm");
  };

  const filteredOrders = orders?.filter(order => {
    if (activeTab === "pending") return ["pending", "confirmed"].includes(order.status);
    if (activeTab === "preparing") return order.status === "in_progress";
    if (activeTab === "completed") return order.status === "completed";
    return true;
  }) || [];

  const pendingCount = orders?.filter(o => ["pending", "confirmed"].includes(o.status)).length || 0;
  const preparingCount = orders?.filter(o => o.status === "in_progress").length || 0;

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

  const handleStatusUpdate = (orderId: string, newStatus: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "ready_for_pickup" | "refunded") => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  if (!restaurant && !isLoading) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-eats" />
            Orders
          </h1>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Restaurant Found</p>
            <p className="text-muted-foreground">Register your restaurant to manage orders.</p>
          </CardContent>
        </Card>
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
            <Sparkles className="h-6 w-6 text-eats" />
            Orders
          </h1>
          <p className="text-muted-foreground">Manage incoming and ongoing orders</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-eats/10 border border-eats/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eats opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-eats"></span>
          </span>
          <span className="text-sm font-medium text-eats">Live Orders</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 backdrop-blur-xl border border-border/50 p-1">
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4" />
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <ChefHat className="h-4 w-4" />
              Preparing
              {preparingCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{preparingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white">
              <Check className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-0 bg-card/50 backdrop-blur-xl">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <Skeleton className="h-14 w-14 rounded-xl" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-64" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                          <Skeleton className="h-10 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <motion.div 
                  key={activeTab}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {filteredOrders.map((order: any) => {
                    const statusConfig = getStatusConfig(order.status);
                    const items = Array.isArray(order.items) ? order.items : [];
                    const itemsSummary = items.slice(0, 3).map((i: any) => `${i.quantity || 1}x ${i.name || 'Item'}`).join(", ");
                    
                    return (
                      <motion.div key={order.id} variants={item}>
                        <Card className="relative border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${statusConfig.gradient}`} />
                          <CardContent className="p-5 pl-6">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                                  <ChefHat className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg">#{order.id.slice(0, 8)}</span>
                                    <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5 ${order.status === 'pending' || order.status === 'in_progress' ? 'animate-pulse' : ''}`} />
                                      {order.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {itemsSummary || "Order items"}{items.length > 3 ? ` +${items.length - 3} more` : ""}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    {order.delivery_address && (
                                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                                        <MapPin className="h-3 w-3" />
                                        {order.delivery_address.slice(0, 30)}...
                                      </span>
                                    )}
                                    {order.estimated_prep_time && (
                                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                                        <Clock className="h-3 w-3" />
                                        ~{order.estimated_prep_time} min
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(order.created_at)}</p>
                                  {order.special_instructions && (
                                    <p className="text-xs text-amber-500 mt-1 italic">Note: {order.special_instructions}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-xl">${order.total_amount?.toFixed(2) || "0.00"}</p>
                                <div className="flex gap-2 mt-3">
                                  {order.status === "pending" && (
                                    <Button 
                                      size="sm" 
                                      className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:shadow-xl"
                                      onClick={() => handleStatusUpdate(order.id, "confirmed")}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Accept
                                    </Button>
                                  )}
                                  {order.status === "confirmed" && (
                                    <Button 
                                      size="sm" 
                                      className="bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg hover:shadow-xl"
                                      onClick={() => handleStatusUpdate(order.id, "in_progress")}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Start Preparing
                                    </Button>
                                  )}
                                  {order.status === "in_progress" && (
                                    <Button 
                                      size="sm" 
                                      className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:shadow-xl"
                                      onClick={() => handleStatusUpdate(order.id, "completed")}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Mark Ready
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="p-4 rounded-2xl bg-muted/30 w-fit mx-auto mb-4">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-medium">No orders in this category</p>
                      <p className="text-sm text-muted-foreground">Orders will appear here when received</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default RestaurantOrders;
