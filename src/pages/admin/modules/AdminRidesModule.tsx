/**
 * Admin Rides Module
 * Manage ride requests with full CRUD
 */
import { useState } from "react";
import { format } from "date-fns";
import { 
  Car, Search, Download, RefreshCw, Phone, Mail, Eye, MapPin, 
  Clock, User, CheckCircle, XCircle, Filter, Loader2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRideRequests, useUpdateRideRequest, type RideRequest, type RideRequestStatus } from "@/hooks/useRideRequests";
import { useDrivers } from "@/hooks/useDrivers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusOptions: { value: RideRequestStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "assigned", label: "Assigned", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { value: "en_route", label: "En Route", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "completed", label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

export default function AdminRidesModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RideRequestStatus | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: rideRequests, isLoading, refetch } = useRideRequests(statusFilter);
  const { data: drivers } = useDrivers();
  const updateRideRequest = useUpdateRideRequest();

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

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || statusOptions[0].color;
  };

  const handleStatusUpdate = (id: string, newStatus: RideRequestStatus) => {
    updateRideRequest.mutate({ id, updates: { status: newStatus } });
  };

  const handleAssignDriver = (id: string, driverId: string) => {
    updateRideRequest.mutate({ 
      id, 
      updates: { 
        assigned_driver_id: driverId,
        status: "assigned" as RideRequestStatus
      } 
    });
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
    if (!filteredRequests.length) return;
    
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
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rides-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const verifiedDrivers = drivers?.filter(d => d.status === "verified") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Rides Management
          </h1>
          <p className="text-muted-foreground">Manage all ride requests</p>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusOptions.map((status) => {
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RideRequestStatus | "all")}>
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
                        <Select value={request.status} onValueChange={(v) => handleStatusUpdate(request.id, v as RideRequestStatus)}>
                          <SelectTrigger className={cn("h-7 text-xs w-28", getStatusColor(request.status))}>
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
                          value={request.assigned_driver_id || "unassigned"} 
                          onValueChange={(v) => v !== "unassigned" && handleAssignDriver(request.id, v)}
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
