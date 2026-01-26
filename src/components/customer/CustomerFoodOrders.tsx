import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      case "in_progress": return "bg-blue-500/10 text-blue-500";
      case "confirmed": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eats"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Food Orders</h1>
        <p className="text-muted-foreground">Your order history and active orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All your food orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="p-2 rounded-lg bg-eats/10">
                    <UtensilsCrossed className="h-5 w-5 text-eats" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{order.restaurants?.name || 'Restaurant'}</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{format(new Date(order.created_at), 'MMM d, yyyy')}</span>
                      <span className="font-semibold text-foreground">${order.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No food orders yet</p>
              <p className="text-sm">Order from your favorite restaurants!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFoodOrders;
