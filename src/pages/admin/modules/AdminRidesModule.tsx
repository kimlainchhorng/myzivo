/**
 * Admin Rides Module
 * Manage ride requests and live trips with full CRUD
 */
import { useState } from "react";
import { format } from "date-fns";
import { 
  Car, Search, Download, RefreshCw, Phone, Mail, Eye, MapPin, 
  Clock, User, CheckCircle, XCircle, Filter, Loader2, MessageSquare, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRideRequests, useUpdateRideRequest, type RideRequest, type RideRequestStatus } from "@/hooks/useRideRequests";
import { useAdminTrips, useUpdateTripStatus, useCreateTestTrip, type Trip, type TripStatus } from "@/hooks/useTrips";
import { useDrivers } from "@/hooks/useDrivers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const requestStatusOptions: { value: RideRequestStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "assigned", label: "Assigned", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { value: "en_route", label: "En Route", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "completed", label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

const tripStatusOptions: { value: TripStatus; label: string; color: string }[] = [
  { value: "requested", label: "Requested", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "accepted", label: "Accepted", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "en_route", label: "En Route", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { value: "arrived", label: "Arrived", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { value: "in_progress", label: "In Progress", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "completed", label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

export default function AdminRidesModule() {
  const [activeTab, setActiveTab] = useState<"requests" | "trips">("trips");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Ride Requests data
  const { data: rideRequests, isLoading: requestsLoading, refetch: refetchRequests } = useRideRequests(
    activeTab === "requests" ? (statusFilter as RideRequestStatus | "all") : "all"
  );
  const updateRideRequest = useUpdateRideRequest();

  // Live Trips data
  const { data: trips, isLoading: tripsLoading, refetch: refetchTrips } = useAdminTrips(
    activeTab === "trips" ? (statusFilter as TripStatus | "all") : "all"
  );
  const updateTripStatus = useUpdateTripStatus();
  const createTestTrip = useCreateTestTrip();

  const { data: drivers } = useDrivers();
  const verifiedDrivers = drivers?.filter(d => d.status === "verified") || [];

  const isLoading = activeTab === "requests" ? requestsLoading : tripsLoading;
  const refetch = activeTab === "requests" ? refetchRequests : refetchTrips;

  // Filter ride requests
  const filteredRequests = rideRequests?.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.customer_name.toLowerCase().includes(query) ||
      request.customer_phone.includes(query) ||
      request.pickup_address.toLowerCase().includes(query) ||
      request.dropoff_address.toLowerCase().includes(query) ||
      request.id.toLowerCase().includes(query)
    );
  }) || [];

  // Filter trips
  const filteredTrips = trips?.filter(trip => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trip.pickup_address.toLowerCase().includes(query) ||
      trip.dropoff_address.toLowerCase().includes(query) ||
      trip.id.toLowerCase().includes(query)
    );
  }) || [];

  const getRequestStatusColor = (status: string) => {
    return requestStatusOptions.find(s => s.value === status)?.color || requestStatusOptions[0].color;
  };

  const getTripStatusColor = (status: string | null) => {
    return tripStatusOptions.find(s => s.value === status)?.color || tripStatusOptions[0].color;
  };

  const handleRequestStatusUpdate = (id: string, newStatus: RideRequestStatus) => {
    updateRideRequest.mutate({ id, updates: { status: newStatus } });
  };

  const handleTripStatusUpdate = (id: string, newStatus: TripStatus) => {
    updateTripStatus.mutate({ id, status: newStatus });
  };

  const handleAssignDriverToRequest = (id: string, driverId: string) => {
    updateRideRequest.mutate({ 
      id, 
      updates: { 
        assigned_driver_id: driverId,
        status: "assigned" as RideRequestStatus
      } 
    });
  };

  const handleAssignDriverToTrip = async (tripId: string, driverId: string) => {
    const { error } = await supabase
      .from("trips")
      .update({ driver_id: driverId, status: "accepted" })
      .eq("id", tripId);

    if (error) {
      toast.error("Failed to assign driver");
      return;
    }

    // Send notification to driver
    try {
      const session = await supabase.auth.getSession();
      await fetch('https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-driver-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          driver_id: driverId,
          title: 'New Trip Assigned',
          body: 'You have been assigned a new trip',
          data: { type: 'trip', trip_id: tripId },
        }),
      });
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }

    toast.success("Driver assigned successfully");
    refetchTrips();
  };

  const handleSaveNotes = () => {
    if (selectedRequest) {
      updateRideRequest.mutate({
        id: selectedRequest.id,
        updates: { admin_notes: adminNotes }
      });
      toast.success("Notes saved");
    }
  };

  const handleExportCSV = () => {
    if (activeTab === "requests" && filteredRequests.length) {
      const headers = ["ID", "Date", "Customer", "Phone", "Email", "Pickup", "Dropoff", "Type", "Status", "Driver"];
      const rows = filteredRequests.map(r => [
        r.id,
        format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
        r.customer_name,
        r.customer_phone,
        r.customer_email,
        r.pickup_address,
        r.dropoff_address,
        r.ride_type,
        r.status,
        r.assigned_driver_id || "Unassigned"
      ]);
      const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
      downloadCSV(csv, "ride-requests");
    } else if (activeTab === "trips" && filteredTrips.length) {
      const headers = ["ID", "Date", "Pickup", "Dropoff", "Fare", "Status", "Driver"];
      const rows = filteredTrips.map(t => [
        t.id,
        format(new Date(t.created_at), "yyyy-MM-dd HH:mm"),
        t.pickup_address,
        t.dropoff_address,
        `$${(t.fare_amount || 0).toFixed(2)}`,
        t.status || "requested",
        t.driver?.full_name || "Unassigned"
      ]);
      const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
      downloadCSV(csv, "trips");
    }
  };

  const downloadCSV = (csv: string, prefix: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Rides Management
          </h1>
          <p className="text-muted-foreground">Manage ride requests and live trips</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => createTestTrip.mutate()}
            disabled={createTestTrip.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {createTestTrip.isPending ? "Creating..." : "Create Test Trip"}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "requests" | "trips"); setStatusFilter("all"); }}>
        <TabsList>
          <TabsTrigger value="trips" className="gap-2">
            <Car className="w-4 h-4" />
            Live Trips
            <Badge variant="outline" className="ml-1">{trips?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Ride Requests
            <Badge variant="outline" className="ml-1">{rideRequests?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Live Trips Tab */}
        <TabsContent value="trips" className="space-y-6">
          {/* Trip Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {tripStatusOptions.map((status) => {
              const count = trips?.filter(t => t.status === status.value).length ?? 0;
              return (
                <Card key={status.value} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setStatusFilter(status.value)}>
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
                placeholder="Search by address or ID..."
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
                {tripStatusOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trips Table */}
          <Card>
            <CardContent className="p-0">
              {tripsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No trips found</p>
                  <p className="text-sm">Create a test trip to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="text-left p-3 font-medium">Date/Time</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Pickup</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Drop-off</th>
                        <th className="text-left p-3 font-medium">Fare</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Driver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map((trip) => (
                        <tr key={trip.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <p className="font-mono text-xs">{format(new Date(trip.created_at), "MMM d, h:mm a")}</p>
                            <p className="text-[10px] text-muted-foreground">#{trip.id.slice(0, 8)}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell max-w-[150px]">
                            <p className="truncate text-xs">{trip.pickup_address}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell max-w-[150px]">
                            <p className="truncate text-xs">{trip.dropoff_address}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-bold">${(trip.fare_amount || 0).toFixed(2)}</p>
                          </td>
                          <td className="p-3">
                            <Select value={trip.status || "requested"} onValueChange={(v) => handleTripStatusUpdate(trip.id, v as TripStatus)}>
                              <SelectTrigger className={cn("h-7 text-xs w-28", getTripStatusColor(trip.status))}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {tripStatusOptions.map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Select 
                              value={trip.driver_id || "unassigned"} 
                              onValueChange={(v) => v !== "unassigned" && handleAssignDriverToTrip(trip.id, v)}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ride Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Request Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {requestStatusOptions.map((status) => {
              const count = rideRequests?.filter(r => r.status === status.value).length ?? 0;
              return (
                <Card key={status.value} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setStatusFilter(status.value)}>
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
                placeholder="Search by name, phone, address..."
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
                {requestStatusOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <Card>
            <CardContent className="p-0">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No ride requests found</p>
                  <p className="text-sm">Requests from the Rides form will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="text-left p-3 font-medium">Date/Time</th>
                        <th className="text-left p-3 font-medium">Customer</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Pickup</th>
                        <th className="text-left p-3 font-medium hidden md:table-cell">Drop-off</th>
                        <th className="text-left p-3 font-medium hidden lg:table-cell">Scheduled</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium hidden lg:table-cell">Driver</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <p className="font-mono text-xs">{format(new Date(request.created_at), "MMM d, h:mm a")}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{request.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{request.customer_phone}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell max-w-[150px]">
                            <p className="truncate text-xs">{request.pickup_address}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell max-w-[150px]">
                            <p className="truncate text-xs">{request.dropoff_address}</p>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <p className="text-xs">{request.scheduled_at ? format(new Date(request.scheduled_at), "MMM d, h:mm a") : "ASAP"}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] capitalize">{request.ride_type}</Badge>
                          </td>
                          <td className="p-3">
                            <Select value={request.status} onValueChange={(v) => handleRequestStatusUpdate(request.id, v as RideRequestStatus)}>
                              <SelectTrigger className={cn("h-7 text-xs w-28", getRequestStatusColor(request.status))}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {requestStatusOptions.map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <Select 
                              value={request.assigned_driver_id || "unassigned"} 
                              onValueChange={(v) => v !== "unassigned" && handleAssignDriverToRequest(request.id, v)}
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
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                                <a href={`tel:${request.customer_phone}`}><Phone className="w-3 h-3" /></a>
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                                <a href={`mailto:${request.customer_email}`}><Mail className="w-3 h-3" /></a>
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setAdminNotes(request.admin_notes || "");
                                }}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ride Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedRequest.customer_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedRequest.customer_phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium text-sm">{selectedRequest.customer_email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="font-medium capitalize">{selectedRequest.ride_type}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Pickup</Label>
                <p className="text-sm">{selectedRequest.pickup_address}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Drop-off</Label>
                <p className="text-sm">{selectedRequest.dropoff_address}</p>
              </div>

              {selectedRequest.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Customer Notes</Label>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                <Textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
                <Button onClick={handleSaveNotes}>Save Notes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}