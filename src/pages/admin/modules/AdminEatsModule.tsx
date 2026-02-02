/**
 * Admin Eats Module
 * Manage food orders
 */
import { useState } from "react";
import { format } from "date-fns";
import { 
  UtensilsCrossed, Search, Download, RefreshCw, Phone, Mail, Eye, 
  Store, Package, Loader2, Clock, User, Bike, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFoodOrders, useUpdateFoodOrder, useCreateTestFoodOrder } from "@/hooks/useEatsOrders";
import { useDrivers } from "@/hooks/useDrivers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

const statusOptions: { value: BookingStatus; label: string; color: string }[] = [
  { value: "pending", label: "New", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "ready_for_pickup", label: "Ready", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { value: "in_progress", label: "Out for Delivery", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "completed", label: "Delivered", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

export default function AdminEatsModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: foodOrders, isLoading, refetch } = useFoodOrders(statusFilter);
  const { data: drivers } = useDrivers();
  const updateOrder = useUpdateFoodOrder();
  const createTestOrder = useCreateTestFoodOrder();

  const filteredOrders = foodOrders?.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const restaurantName = (order.restaurants as { name?: string })?.name || "";
    return (
      order.id.toLowerCase().includes(query) ||
      restaurantName.toLowerCase().includes(query) ||
      (order.special_instructions || "").toLowerCase().includes(query)
    );
  }) || [];

  const getStatusColor = (status: string | null) => {
    return statusOptions.find(s => s.value === status)?.color || statusOptions[0].color;
  };

  const handleStatusUpdate = (id: string, newStatus: BookingStatus) => {
    updateOrder.mutate({ id, updates: { status: newStatus } });
  };

  const handleAssignDriver = (id: string, driverId: string) => {
    updateOrder.mutate({ id, updates: { driver_id: driverId } });
  };

  const handleExportCSV = () => {
    if (!filteredOrders.length) return;
    
    const headers = ["ID", "Date", "Restaurant", "Items", "Total", "Status", "Driver"];
    const rows = filteredOrders.map(o => [
      o.id,
      format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      (o.restaurants as { name?: string })?.name || "Unknown",
      ((o.items as any[]) || []).length,
      o.total_amount || 0,
      o.status || "pending",
      (o.drivers as { full_name?: string })?.full_name || "Unassigned"
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eats-orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const verifiedDrivers = drivers?.filter(d => d.status === "verified") || [];

  // Parse items for order details
  const parseItems = (items: any) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-eats" />
            Eats Orders
          </h1>
          <p className="text-muted-foreground">Manage all food orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createTestOrder.mutate()}
            disabled={createTestOrder.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {createTestOrder.isPending ? "Creating..." : "Create Test Order"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statusOptions.map((status) => {
          const count = foodOrders?.filter(o => o.status === status.value).length ?? 0;
          return (
            <Card key={status.value} className="cursor-pointer hover:border-eats/30 transition-colors" onClick={() => setStatusFilter(status.value)}>
              <CardContent className="p-3">
                <Badge variant="outline" className={cn("text-[10px] mb-1", status.color)}>
                  {status.label}
                </Badge>
                <p className="text-xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by order ID, restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No food orders found</p>
              <p className="text-sm">Orders from the Eats flow will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">Date/Time</th>
                    <th className="text-left p-3 font-medium">Restaurant</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Items</th>
                    <th className="text-left p-3 font-medium">Total</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Driver</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const items = parseItems(order.items);
                    const restaurantName = (order.restaurants as { name?: string })?.name || "Unknown";
                    const driverName = (order.drivers as { full_name?: string })?.full_name || null;
                    
                    return (
                      <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <p className="font-mono text-xs">{format(new Date(order.created_at), "MMM d, h:mm a")}</p>
                          <p className="text-[10px] text-muted-foreground">#{order.id.slice(0, 8)}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{restaurantName}</p>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <p className="text-xs">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold">${(order.total_amount ?? 0).toFixed(2)}</p>
                        </td>
                        <td className="p-3">
                          <Select value={order.status || "pending"} onValueChange={(v) => handleStatusUpdate(order.id, v as BookingStatus)}>
                            <SelectTrigger className={cn("h-7 text-xs w-28", getStatusColor(order.status))}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <Select 
                            value={order.driver_id || "unassigned"} 
                            onValueChange={(v) => v !== "unassigned" && handleAssignDriver(order.id, v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-28">
                              <SelectValue placeholder="Assign" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {verifiedDrivers.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Order ID</Label>
                  <p className="font-mono text-sm">{selectedOrder.id.slice(0, 12)}...</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Restaurant</Label>
                  <p className="font-medium">{(selectedOrder.restaurants as { name?: string })?.name || "Unknown"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(selectedOrder.status))}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <p className="font-bold">${(selectedOrder.total_amount ?? 0).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Items</Label>
                <ScrollArea className="h-32 mt-1 border rounded-lg p-2">
                  {parseItems(selectedOrder.items).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items</p>
                  ) : (
                    <div className="space-y-2">
                      {parseItems(selectedOrder.items).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {selectedOrder.delivery_address && (
                <div>
                  <Label className="text-xs text-muted-foreground">Delivery Address</Label>
                  <p className="text-sm">{selectedOrder.delivery_address}</p>
                </div>
              )}

              {selectedOrder.special_instructions && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedOrder.special_instructions}</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}