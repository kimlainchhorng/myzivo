/**
 * Admin Drivers Module
 * CRUD for drivers
 */
import { useState } from "react";
import { format } from "date-fns";
import { 
  Users, Search, RefreshCw, Phone, Mail, Eye, Plus, 
  Car, CheckCircle, XCircle, Loader2, Edit, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDrivers, useUpdateDriverStatus, type Driver, type DriverStatus } from "@/hooks/useDrivers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDriversModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const { data: drivers, isLoading, refetch } = useDrivers();
  const updateDriverStatus = useUpdateDriverStatus();

  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = !searchQuery || 
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: DriverStatus | null) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-500",
      verified: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
      suspended: "bg-gray-500/10 text-gray-500",
    };
    return colors[status || "pending"] || colors.pending;
  };

  const handleStatusUpdate = (id: string, status: DriverStatus) => {
    updateDriverStatus.mutate({ 
      id, 
      status,
      documents_verified: status === "verified"
    });
  };

  const stats = {
    total: drivers?.length ?? 0,
    verified: drivers?.filter(d => d.status === "verified").length ?? 0,
    pending: drivers?.filter(d => d.status === "pending").length ?? 0,
    online: drivers?.filter(d => d.is_online).length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Drivers
          </h1>
          <p className="text-muted-foreground">Manage driver accounts and verification</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-500">{stats.verified}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-500">{stats.online}</p>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, phone..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
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
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No drivers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">Driver</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Contact</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Vehicle</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Online</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{driver.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {driver.total_trips ?? 0} trips • {driver.rating ?? 0}★
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-xs">{driver.phone}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{driver.email}</p>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <p className="text-xs capitalize">{driver.vehicle_type}</p>
                        <p className="text-xs text-muted-foreground">{driver.vehicle_plate}</p>
                      </td>
                      <td className="p-3">
                        <Select value={driver.status || "pending"} onValueChange={(v) => handleStatusUpdate(driver.id, v as DriverStatus)}>
                          <SelectTrigger className={cn("h-7 text-xs w-24", getStatusColor(driver.status))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant="outline" className={cn("text-[10px]", driver.is_online ? "text-green-500" : "text-gray-400")}>
                          {driver.is_online ? "Online" : "Offline"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                            <a href={`tel:${driver.phone}`}><Phone className="w-3 h-3" /></a>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                            <a href={`mailto:${driver.email}`}><Mail className="w-3 h-3" /></a>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => setSelectedDriver(driver)}
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

      {/* Driver Detail Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedDriver.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium text-sm">{selectedDriver.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">License #</Label>
                  <p className="font-medium">{selectedDriver.license_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Type</Label>
                  <p className="font-medium capitalize">{selectedDriver.vehicle_type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Plate</Label>
                  <p className="font-medium">{selectedDriver.vehicle_plate}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rating</Label>
                  <p className="font-medium">{selectedDriver.rating ?? "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Trips</Label>
                  <p className="font-medium">{selectedDriver.total_trips ?? 0}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedDriver(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
