/**
 * Dispatch Order Detail Page
 */
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (value: number | null | undefined) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
};

const PaymentStatusBadge = ({ status }: { status: string | null }) => {
  switch (status) {
    case "paid":
      return (
        <div className="flex items-center gap-1 text-chart-2">
          <CheckCircle className="h-4 w-4" />
          <span>Paid</span>
        </div>
      );
    case "pending":
      return (
        <div className="flex items-center gap-1 text-chart-4">
          <Clock className="h-4 w-4" />
          <span>Pending</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-1 text-destructive">
          <XCircle className="h-4 w-4" />
          <span>Failed</span>
        </div>
      );
    default:
      return <span className="text-muted-foreground">Unknown</span>;
  }
};

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

  // Calculate driver payout from cents
  const driverPayout = (order?.driver_payout_cents || 0) / 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/dispatch/orders"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{id?.slice(0, 8).toUpperCase()}</h1>
          <Badge>{order?.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><strong>Restaurant:</strong> {(order?.restaurants as any)?.name}</div>
            <div><strong>Delivery:</strong> {order?.delivery_address}</div>
            <div><strong>Driver:</strong> {(order?.drivers as any)?.full_name || "Unassigned"}</div>
            <div><strong>Total:</strong> {formatCurrency(order?.total_amount)}</div>
          </CardContent>
        </Card>

        {/* Profit Breakdown Card */}
        <Card>
          <CardHeader><CardTitle>Profit Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Paid</span>
              <span className="font-medium">{formatCurrency(order?.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order?.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatCurrency(order?.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tip</span>
              <span>{formatCurrency(order?.tip_amount)}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver Payout</span>
              <span className="font-medium text-chart-3">-{formatCurrency(driverPayout)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-medium text-chart-2">{formatCurrency(order?.platform_fee)}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-medium">Payment Status</span>
              <PaymentStatusBadge status={order?.payment_status} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DispatchOrderDetail;
