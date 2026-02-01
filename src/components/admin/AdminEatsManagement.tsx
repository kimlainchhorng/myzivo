import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Utensils, Store, ChefHat, Bike, Clock, DollarSign, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  Search, Filter, RefreshCw, Eye, Star, Package,
  Loader2, Phone, Mail, CreditCard, RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFoodOrders, useUpdateFoodOrder } from "@/hooks/useEatsOrders";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { RefundDialog } from "./RefundDialog";
import { getPaymentStatusBadge, getRefundStatusBadge } from "@/hooks/usePaymentAdmin";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export default function AdminEatsManagement() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refundOrder, setRefundOrder] = useState<{
    id: string;
    amount: number;
    customerName: string;
  } | null>(null);

  const { data: foodOrders, isLoading, refetch } = useFoodOrders(statusFilter);
  const updateOrder = useUpdateFoodOrder();

  // Calculate stats from real data
  const stats = {
    activeOrders: foodOrders?.filter(o => !["completed", "cancelled"].includes(o.status || "")).length ?? 0,
    completedToday: foodOrders?.filter(o => {
      const today = new Date().toDateString();
      return o.status === "completed" && new Date(o.created_at).toDateString() === today;
    }).length ?? 0,
    revenue: foodOrders?.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0,
  };

  const getStatusBadge = (status: string | null) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      preparing: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      ready: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      driver_assigned: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      out_for_delivery: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const handleStatusUpdate = (id: string, newStatus: BookingStatus) => {
    updateOrder.mutate({ id, updates: { status: newStatus } });
  };

  // Filter orders by search
  const filteredOrders = foodOrders?.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const customerInfo = order.special_instructions || "";
    return (
      order.id.toLowerCase().includes(query) ||
      customerInfo.toLowerCase().includes(query) ||
      (order.restaurants as { name?: string })?.name?.toLowerCase().includes(query)
    );
  }) || [];

  // Parse customer info from special_instructions
  const parseCustomerInfo = (specialInstructions: string | null) => {
    if (!specialInstructions) return { name: "Unknown", phone: "", email: "" };
    try {
      const match = specialInstructions.match(/Customer Info: ({.*})/);
      if (match) {
        const info = JSON.parse(match[1]);
        return {
          name: info.customer_name || "Unknown",
          phone: info.customer_phone || "",
          email: info.customer_email || "",
        };
      }
    } catch {}
    return { name: "Unknown", phone: "", email: "" };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-eats/20 to-red-500/10">
            <Utensils className="h-6 w-6 text-eats" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ZIVO Eats Management</h1>
            <p className="text-muted-foreground">Manage food orders & restaurants</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { 
            label: "Active Orders", 
            value: isLoading ? "..." : stats.activeOrders, 
            icon: Package, 
            color: "text-eats", 
            bg: "bg-eats/10" 
          },
          { 
            label: "Completed Today", 
            value: isLoading ? "..." : stats.completedToday, 
            icon: CheckCircle, 
            color: "text-green-500", 
            bg: "bg-green-500/10" 
          },
          { 
            label: "Total Orders", 
            value: isLoading ? "..." : (foodOrders?.length ?? 0), 
            icon: Utensils, 
            color: "text-amber-500", 
            bg: "bg-amber-500/10" 
          },
          { 
            label: "Total Revenue", 
            value: isLoading ? "..." : `$${stats.revenue.toLocaleString()}`, 
            icon: DollarSign, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
          },
        ].map((stat, i) => (
          <Card key={i} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-eats data-[state=active]:text-white">
            <Package className="h-4 w-4" />
            Live Orders
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="gap-2">
            <Store className="h-4 w-4" />
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="gap-2">
            <ChefHat className="h-4 w-4" />
            Kitchen Status
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Bike className="h-4 w-4" />
            Delivery Fleet
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders, customers, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-eats" />
                Food Orders
                <Badge variant="outline" className="ml-2 text-eats border-eats/30">
                  {filteredOrders.length} Orders
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No food orders found</p>
                </div>
              ) : (
              <div className="space-y-3">
                {filteredOrders.map((order, i) => {
                  const customer = parseCustomerInfo(order.special_instructions);
                  const items = (order.items as { name: string; quantity: number }[]) || [];
                  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                  
                  return (
                  <div 
                    key={order.id}
                    className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start lg:items-center gap-4 flex-wrap">
                        <div className="text-center min-w-[90px]">
                          <p className="font-mono text-xs font-bold">{order.id.slice(0, 8)}</p>
                          <Badge variant="outline" className={cn("text-[10px] mt-1", getStatusBadge(order.status))}>
                            {(order.status || "pending").replace("_", " ")}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(order.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <div className="h-12 w-px bg-border hidden sm:block" />
                        <div className="min-w-[100px]">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                        <div className="min-w-[120px]">
                          <p className="font-medium">{(order.restaurants as { name?: string })?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="h-12 w-px bg-border hidden lg:block" />
                        <div className="min-w-[80px]">
                          <p className="font-medium">{(order.drivers as { full_name?: string })?.full_name || "Unassigned"}</p>
                          <p className="text-xs text-muted-foreground">Driver</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[90px]">
                          <p className="font-bold text-lg">${(order.total_amount ?? 0).toFixed(2)}</p>
                          {/* Payment status badges */}
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {(() => {
                              const paymentBadge = getPaymentStatusBadge((order as { payment_status?: string }).payment_status || null);
                              const refundBadge = getRefundStatusBadge((order as { refund_status?: string }).refund_status || null);
                              return (
                                <>
                                  <Badge variant="outline" className={cn("text-[10px]", paymentBadge.className)}>
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {paymentBadge.label}
                                  </Badge>
                                  {refundBadge && (
                                    <Badge variant="outline" className={cn("text-[10px]", refundBadge.className)}>
                                      {refundBadge.label}
                                    </Badge>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <Select 
                          value={order.status || "pending"} 
                          onValueChange={(v) => handleStatusUpdate(order.id, v as BookingStatus)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          {customer.phone && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                              <a href={`tel:${customer.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {customer.email && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                              <a href={`mailto:${customer.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {/* Refund Button - only show if paid and not refunded */}
                          {(order as { payment_status?: string }).payment_status === "paid" && 
                           (order as { refund_status?: string }).refund_status !== "refunded" && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                              onClick={() => setRefundOrder({
                                id: order.id,
                                amount: order.total_amount || 0,
                                customerName: customer.name
                              })}
                              title="Process Refund"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Restaurant management and status overview</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kitchen" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Real-time kitchen preparation status</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bike className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Delivery driver fleet management</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Order issues and complaints</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refund Dialog */}
      {refundOrder && (
        <RefundDialog
          open={!!refundOrder}
          onOpenChange={(open) => !open && setRefundOrder(null)}
          type="eats"
          id={refundOrder.id}
          amount={refundOrder.amount}
          customerName={refundOrder.customerName}
        />
      )}
    </div>
  );
}
