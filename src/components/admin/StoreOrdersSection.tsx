/**
 * StoreOrdersSection — Store owner order management.
 * Shows orders grouped by status with receipt verification and confirmation actions.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, Clock, ImageIcon, CheckCircle2, Truck, Package,
  XCircle, Eye, Phone, MapPin, Loader2, AlertTriangle, User
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface StoreOrder {
  id: string;
  store_id: string;
  customer_id: string;
  status: string;
  items: any[];
  delivery_address: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  payment_provider: string | null;
  receipt_url: string | null;
  receipt_uploaded_at: string | null;
  payment_confirmed_at: string | null;
  assigned_driver_id: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  notes: string | null;
  created_at: string;
}

interface Props {
  storeId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_payment: { label: "Pending Payment", color: "bg-amber-100 text-amber-700", icon: Clock },
  receipt_uploaded: { label: "Receipt Uploaded", color: "bg-blue-100 text-blue-700", icon: ImageIcon },
  payment_confirmed: { label: "Payment Confirmed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  assigned: { label: "Assigned to Driver", color: "bg-purple-100 text-purple-700", icon: Truck },
  picked_up: { label: "Picked Up", color: "bg-indigo-100 text-indigo-700", icon: Package },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function StoreOrdersSection({ storeId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("pending");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["store-orders", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_orders")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as StoreOrder[];
    },
    enabled: !!storeId,
    refetchInterval: 15000, // poll every 15s for new orders
  });

  const confirmPayment = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("store_orders")
        .update({
          status: "payment_confirmed",
          payment_confirmed_at: new Date().toISOString(),
          confirmed_by: user?.id,
        })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
      toast.success("Payment confirmed! Customer has been notified.");
      setSelectedOrder(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("store_orders")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancel_reason: "Payment not verified by store",
        })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
      toast.success("Order rejected.");
      setSelectedOrder(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const assignToDriver = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("store_orders")
        .update({ status: "assigned" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders", storeId] });
      toast.success("Order sent to driver for pickup!");
      setSelectedOrder(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Filter orders
  const pendingOrders = orders.filter(o => ["pending_payment", "receipt_uploaded"].includes(o.status));
  const confirmedOrders = orders.filter(o => ["payment_confirmed", "assigned", "picked_up"].includes(o.status));
  const completedOrders = orders.filter(o => ["delivered", "cancelled"].includes(o.status));

  const filterCounts = {
    pending: pendingOrders.length,
    active: confirmedOrders.length,
    completed: completedOrders.length,
  };

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case "pending": return pendingOrders;
      case "active": return confirmedOrders;
      case "completed": return completedOrders;
      default: return orders;
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setActiveFilter("pending")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{filterCounts.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setActiveFilter("active")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{filterCounts.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setActiveFilter("completed")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{filterCounts.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1 gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending {filterCounts.pending > 0 && `(${filterCounts.pending})`}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 gap-1">
            <Truck className="w-3.5 h-3.5" /> Active {filterCounts.active > 0 && `(${filterCounts.active})`}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Done
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Order List */}
      <div className="space-y-3">
        {getFilteredOrders().length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No {activeFilter} orders</p>
              <p className="text-xs mt-1">Orders will appear here when customers place them</p>
            </CardContent>
          </Card>
        ) : (
          getFilteredOrders().map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
            const StatusIcon = config.icon;
            return (
              <Card key={order.id} className="cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all" onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${config.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {order.customer_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {order.customer_name}
                          </span>
                        )}
                        <span>{format(new Date(order.created_at), "MMM d, h:mm a")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(order.items as any[]).length} item{(order.items as any[]).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCents(order.total_cents)}</p>
                      {order.status === "receipt_uploaded" && (
                        <Badge variant="destructive" className="text-[10px] mt-1 animate-pulse">
                          Review Receipt
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  <Badge variant="secondary" className={`text-xs ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="rounded-xl border border-border p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Customer</p>
                  {selectedOrder.customer_name && (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" /> {selectedOrder.customer_name}
                    </p>
                  )}
                  {selectedOrder.customer_phone && (
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-sm flex items-center gap-2 text-primary">
                      <Phone className="w-4 h-4" /> {selectedOrder.customer_phone}
                    </a>
                  )}
                  {selectedOrder.delivery_address && (
                    <p className="text-sm flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {selectedOrder.delivery_address}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="rounded-xl border border-border p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Items</p>
                  {(selectedOrder.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="text-muted-foreground">{formatCents(item.price_cents * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCents(selectedOrder.subtotal_cents)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Delivery</span>
                      <span>{formatCents(selectedOrder.delivery_fee_cents)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span>{formatCents(selectedOrder.total_cents)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Receipt */}
                {selectedOrder.receipt_url && (
                  <div className="rounded-xl border border-border p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Payment Receipt</p>
                    {selectedOrder.payment_provider && (
                      <p className="text-xs text-muted-foreground">
                        Paid via <span className="font-medium text-foreground">{selectedOrder.payment_provider.toUpperCase()}</span>
                      </p>
                    )}
                    <img
                      src={selectedOrder.receipt_url}
                      alt="Payment receipt"
                      className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setReceiptPreview(selectedOrder.receipt_url)}
                    />
                    {selectedOrder.receipt_uploaded_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Uploaded {format(new Date(selectedOrder.receipt_uploaded_at), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                )}

                {/* No receipt yet */}
                {!selectedOrder.receipt_url && selectedOrder.status === "pending_payment" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">Customer has not uploaded payment receipt yet.</p>
                  </div>
                )}

                {/* Actions */}
                {selectedOrder.status === "receipt_uploaded" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1.5"
                      onClick={() => confirmPayment.mutate(selectedOrder.id)}
                      disabled={confirmPayment.isPending}
                    >
                      {confirmPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirm Payment
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => rejectOrder.mutate(selectedOrder.id)}
                      disabled={rejectOrder.isPending}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}

                {selectedOrder.status === "payment_confirmed" && (
                  <Button
                    className="w-full gap-1.5"
                    onClick={() => assignToDriver.mutate(selectedOrder.id)}
                    disabled={assignToDriver.isPending}
                  >
                    {assignToDriver.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                    Send to Driver for Pickup
                  </Button>
                )}

                {selectedOrder.payment_confirmed_at && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    Payment confirmed {format(new Date(selectedOrder.payment_confirmed_at), "MMM d, h:mm a")}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Fullscreen Preview */}
      <Dialog open={!!receiptPreview} onOpenChange={() => setReceiptPreview(null)}>
        <DialogContent className="max-w-2xl p-2">
          {receiptPreview && (
            <img src={receiptPreview} alt="Receipt" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
