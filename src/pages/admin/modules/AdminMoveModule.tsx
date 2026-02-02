/**
 * Admin Move Module
 * Manage package deliveries (Move service)
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Package, Truck, Clock, CheckCircle, Search, RefreshCw,
  MoreHorizontal, MapPin, User, Scale, Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { toast } from "sonner";

const statusBadgeConfig: Record<string, { className: string; label: string }> = {
  requested: { className: "bg-amber-500/10 text-amber-500", label: "Requested" },
  accepted: { className: "bg-blue-500/10 text-blue-500", label: "Accepted" },
  at_pickup: { className: "bg-orange-500/10 text-orange-500", label: "At Pickup" },
  picked_up: { className: "bg-purple-500/10 text-purple-500", label: "Picked Up" },
  at_dropoff: { className: "bg-indigo-500/10 text-indigo-500", label: "At Dropoff" },
  delivered: { className: "bg-green-500/10 text-green-500", label: "Delivered" },
  cancelled: { className: "bg-red-500/10 text-red-500", label: "Cancelled" },
};

export default function AdminMoveModule() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  // Fetch package deliveries
  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ["admin-package-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_deliveries")
        .select("*, driver:drivers(full_name, phone)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Create test delivery
  const createTestDelivery = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("package_deliveries")
        .insert({
          customer_name: "Test Customer",
          customer_phone: "555-0123",
          pickup_address: "123 Pickup St, Test City",
          pickup_lat: 40.7128,
          pickup_lng: -74.006,
          dropoff_address: "456 Dropoff Ave, Test City",
          dropoff_lat: 40.7580,
          dropoff_lng: -73.9855,
          package_size: "medium",
          package_weight: 5,
          package_contents: "Test Package",
          delivery_speed: "standard",
          estimated_payout: 18,
          status: "requested",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-package-deliveries"] });
      toast.success("Test delivery created");
    },
    onError: (error) => {
      toast.error("Failed to create test delivery: " + error.message);
    },
  });

  // Stats
  const stats = {
    total: deliveries?.length || 0,
    requested: deliveries?.filter((d) => d.status === "requested").length || 0,
    inTransit: deliveries?.filter((d) => ["accepted", "at_pickup", "picked_up", "at_dropoff"].includes(d.status || "")).length || 0,
    delivered: deliveries?.filter((d) => d.status === "delivered").length || 0,
  };

  // Filter deliveries
  const filteredDeliveries = deliveries?.filter((delivery) => {
    const matchesSearch =
      !searchTerm ||
      delivery.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.dropoff_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Pickup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{stats.requested}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              In Transit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Delivered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => createTestDelivery.mutate()} disabled={createTestDelivery.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test Delivery
          </Button>
        </div>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Package Deliveries</CardTitle>
          <CardDescription>Manage Move service package deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !filteredDeliveries || filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No deliveries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => {
                    const statusBadge = statusBadgeConfig[delivery.status || "requested"];
                    const driver = delivery.driver as { full_name?: string } | null;
                    return (
                      <TableRow key={delivery.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{delivery.package_size || "Medium"}</p>
                              <p className="text-xs text-muted-foreground">{delivery.package_weight || 0} lbs</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{delivery.customer_name || "Customer"}</p>
                            <p className="text-xs text-muted-foreground">{delivery.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="text-xs space-y-1">
                            <p className="truncate"><MapPin className="w-3 h-3 inline mr-1" />{delivery.pickup_address}</p>
                            <p className="truncate text-muted-foreground">→ {delivery.dropoff_address}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {driver?.full_name || <span className="text-muted-foreground">Unassigned</span>}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell>{formatPrice(delivery.estimated_payout || 0)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {delivery.created_at ? format(parseISO(delivery.created_at), "MMM d, HH:mm") : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
