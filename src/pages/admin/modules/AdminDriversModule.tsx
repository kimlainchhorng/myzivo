/**
 * Admin Drivers Module
 * CRUD for drivers with service toggles and notification logs
 * Region-scoped when a region is selected
 */
import { useState } from "react";
import { format } from "date-fns";
import { 
  Users, Search, RefreshCw, Phone, Mail, Eye, Plus, 
  Car, CheckCircle, XCircle, Loader2, Edit, Trash2,
  UtensilsCrossed, Package, Bell, BellOff, ChevronDown, MapPin
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrivers, useUpdateDriverStatus, type Driver, type DriverStatus } from "@/hooks/useDrivers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRegion } from "@/contexts/RegionContext";

interface NotificationLog {
  id: string;
  title: string;
  body: string | null;
  notification_type: string;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  platform: string | null;
}

export default function AdminDriversModule() {
  const queryClient = useQueryClient();
  const { selectedRegionId, selectedRegion } = useRegion();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [notificationLogsOpen, setNotificationLogsOpen] = useState(false);

  // Fetch drivers scoped by region
  const { data: drivers, isLoading, refetch } = useDrivers({ regionId: selectedRegionId });
  const updateDriverStatus = useUpdateDriverStatus();

  // Fetch notification logs for selected driver
  const { data: notificationLogs } = useQuery({
    queryKey: ['driver-notification-logs', selectedDriver?.id],
    queryFn: async () => {
      if (!selectedDriver?.id) return [];
      const { data, error } = await supabase
        .from('driver_notification_logs')
        .select('*')
        .eq('driver_id', selectedDriver.id)
        .order('sent_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as NotificationLog[];
    },
    enabled: !!selectedDriver?.id,
  });

  // Update service toggles mutation
  const updateServiceToggles = useMutation({
    mutationFn: async ({ driverId, field, value }: { driverId: string; field: string; value: boolean }) => {
      const { error } = await supabase
        .from('drivers')
        .update({ [field]: value })
        .eq('id', driverId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Service toggle updated');
    },
    onError: (error: any) => {
      toast.error('Failed to update', { description: error.message });
    },
  });

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

  const handleServiceToggle = (driverId: string, field: string, value: boolean) => {
    updateServiceToggles.mutate({ driverId, field, value });
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
                    <th className="text-left p-3 font-medium hidden xl:table-cell">Services</th>
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
                      <td className="p-3 hidden xl:table-cell">
                        <div className="flex gap-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] cursor-pointer",
                              (driver as any).rides_enabled !== false ? "text-blue-500 border-blue-500" : "text-gray-400"
                            )}
                            onClick={() => handleServiceToggle(driver.id, 'rides_enabled', (driver as any).rides_enabled === false)}
                          >
                            <Car className="w-2.5 h-2.5 mr-0.5" />
                            R
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] cursor-pointer",
                              (driver as any).eats_enabled !== false ? "text-orange-500 border-orange-500" : "text-gray-400"
                            )}
                            onClick={() => handleServiceToggle(driver.id, 'eats_enabled', (driver as any).eats_enabled === false)}
                          >
                            <UtensilsCrossed className="w-2.5 h-2.5 mr-0.5" />
                            E
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] cursor-pointer",
                              (driver as any).move_enabled !== false ? "text-purple-500 border-purple-500" : "text-gray-400"
                            )}
                            onClick={() => handleServiceToggle(driver.id, 'move_enabled', (driver as any).move_enabled === false)}
                          >
                            <Package className="w-2.5 h-2.5 mr-0.5" />
                            M
                          </Badge>
                        </div>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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

              {/* Service Toggles */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-3 block">Service Toggles</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Rides</span>
                    </div>
                    <Switch
                      checked={(selectedDriver as any).rides_enabled !== false}
                      onCheckedChange={(checked) => handleServiceToggle(selectedDriver.id, 'rides_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Eats</span>
                    </div>
                    <Switch
                      checked={(selectedDriver as any).eats_enabled !== false}
                      onCheckedChange={(checked) => handleServiceToggle(selectedDriver.id, 'eats_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Move</span>
                    </div>
                    <Switch
                      checked={(selectedDriver as any).move_enabled !== false}
                      onCheckedChange={(checked) => handleServiceToggle(selectedDriver.id, 'move_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Push Notification Status */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-3 block">Push Notifications</Label>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  {(selectedDriver as any).fcm_token || (selectedDriver as any).apns_token ? (
                    <>
                      <Bell className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-600">Enabled</p>
                        <p className="text-xs text-muted-foreground">
                          Platform: {(selectedDriver as any).device_platform || 'Unknown'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Not Configured</p>
                        <p className="text-xs text-muted-foreground">
                          Driver has not registered a push token
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notification Logs */}
              <Collapsible open={notificationLogsOpen} onOpenChange={setNotificationLogsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-3 h-auto border-t">
                    <span className="text-sm font-medium">Notification History</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      notificationLogsOpen && "rotate-180"
                    )} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-[200px]">
                    {notificationLogs && notificationLogs.length > 0 ? (
                      <div className="space-y-2 p-2">
                        {notificationLogs.map((log) => (
                          <div key={log.id} className="p-2 bg-muted/30 rounded-xl text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{log.title}</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px]",
                                  log.delivered_at ? "text-green-500" :
                                  log.failed_at ? "text-red-500" : "text-amber-500"
                                )}
                              >
                                {log.delivered_at ? "Delivered" : log.failed_at ? "Failed" : "Sent"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground line-clamp-1">{log.body}</p>
                            <p className="text-muted-foreground mt-1">
                              {log.sent_at ? format(new Date(log.sent_at), 'MMM d, h:mm a') : 'N/A'}
                            </p>
                            {log.error_message && (
                              <p className="text-red-500 mt-1">{log.error_message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No notifications sent
                      </div>
                    )}
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSelectedDriver(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
