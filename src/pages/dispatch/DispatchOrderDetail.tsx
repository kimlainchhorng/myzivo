/**
 * Dispatch Order Detail Page
 */
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DispatchOrderDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["dispatch-order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select(`*, restaurants:restaurant_id(name, address), drivers:driver_id(full_name, phone)`)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/dispatch/orders"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{id?.slice(0, 8).toUpperCase()}</h1>
          <Badge>{order?.status}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><strong>Restaurant:</strong> {(order?.restaurants as any)?.name}</div>
          <div><strong>Delivery:</strong> {order?.delivery_address}</div>
          <div><strong>Driver:</strong> {(order?.drivers as any)?.full_name || "Unassigned"}</div>
          <div><strong>Total:</strong> ${((order?.total_amount || 0)).toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchOrderDetail;
