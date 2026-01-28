import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings2, 
  Search, 
  Ban, 
  CheckCircle, 
  MessageSquare,
  Send,
  MapPin,
  Phone,
  Mail,
  Car,
  Star,
  AlertTriangle,
  Power,
  History,
  ExternalLink,
  Clock,
  Activity
} from "lucide-react";
import { useDrivers, useUpdateDriverStatus, Driver, DriverStatus } from "@/hooks/useDrivers";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AdminDriverControl = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"suspend" | "activate" | "message">("message");
  const [actionReason, setActionReason] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useDrivers();
  
  // Fetch action history
  const { data: actionHistory } = useQuery({
    queryKey: ["admin-driver-actions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_driver_actions")
        .select(`
          id,
          action_type,
          reason,
          created_at,
          driver:drivers(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
  const updateStatus = useUpdateDriverStatus();

  const logActionMutation = useMutation({
    mutationFn: async ({ driverId, type, reason }: { driverId: string; type: string; reason: string }) => {
      const { error } = await supabase
        .from("admin_driver_actions")
        .insert({
          admin_id: user?.id,
          driver_id: driverId,
          action_type: type,
          reason
        });
      if (error) throw error;
    },
  });

  const filteredDrivers = drivers?.filter((driver) => {
    const matchesSearch = 
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const openActionDialog = (driver: Driver, type: "suspend" | "activate" | "message") => {
    setSelectedDriver(driver);
    setActionType(type);
    setActionReason("");
    setMessageContent("");
    setIsActionDialogOpen(true);
  };

  const handleSuspend = async () => {
    if (!selectedDriver || !actionReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    updateStatus.mutate(
      { id: selectedDriver.id, status: "suspended" },
      {
        onSuccess: () => {
          logActionMutation.mutate({
            driverId: selectedDriver.id,
            type: "suspend",
            reason: actionReason
          });
          toast.success(`${selectedDriver.full_name} has been suspended`);
          setIsActionDialogOpen(false);
        }
      }
    );
  };

  const handleActivate = async () => {
    if (!selectedDriver) return;

    updateStatus.mutate(
      { id: selectedDriver.id, status: "verified" },
      {
        onSuccess: () => {
          logActionMutation.mutate({
            driverId: selectedDriver.id,
            type: "activate",
            reason: actionReason || "Reactivated by admin"
          });
          toast.success(`${selectedDriver.full_name} has been reactivated`);
          setIsActionDialogOpen(false);
        }
      }
    );
  };

  const handleSendMessage = async () => {
    if (!selectedDriver || !messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // Create a driver notification
    const { error } = await supabase
      .from("driver_notifications")
      .insert({
        driver_id: selectedDriver.id,
        type: "admin_message",
        title: "Message from Admin",
        description: messageContent,
        icon: "message-square"
      });

    if (error) {
      toast.error("Failed to send message");
      return;
    }

    logActionMutation.mutate({
      driverId: selectedDriver.id,
      type: "message",
      reason: messageContent
    });

    toast.success(`Message sent to ${selectedDriver.full_name}`);
    setIsActionDialogOpen(false);
  };

  const getStatusBadge = (status: DriverStatus | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      case "suspended":
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // Stats
  const verifiedCount = drivers?.filter(d => d.status === "verified").length || 0;
  const suspendedCount = drivers?.filter(d => d.status === "suspended").length || 0;
  const onlineCount = drivers?.filter(d => d.is_online).length || 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Drivers</p>
                <p className="text-2xl font-bold text-green-500">{verifiedCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold text-blue-500">{onlineCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500/10 to-rose-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-red-500">{suspendedCount}</p>
              </div>
              <div className="p-2 rounded-xl bg-red-500/10">
                <Ban className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Actions</p>
                <p className="text-2xl font-bold text-violet-500">{actionHistory?.length || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-violet-500/10">
                <History className="h-5 w-5 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Header */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
                <Settings2 className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle>Driver Control Panel</CardTitle>
              <CardDescription>Manage and control drivers remotely</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={showHistory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              Action History
            </Button>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Action History Panel */}
          {showHistory && (
            <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Admin Actions
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {actionHistory?.map((action) => (
                  <div key={action.id} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(action.driver as any)?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {(action.driver as any)?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{(action.driver as any)?.full_name}</span>
                        <span className="text-muted-foreground"> - </span>
                        <span className={cn(
                          action.action_type === "suspend" && "text-red-500",
                          action.action_type === "activate" && "text-green-500",
                          action.action_type === "message" && "text-blue-500"
                        )}>
                          {action.action_type}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{action.reason}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(action.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))}
                {!actionHistory?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent actions</p>
                )}
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-32 mb-2" />
                      <div className="h-3 bg-muted rounded w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium">No drivers found</p>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage src={driver.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-500/20">
                          {driver.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {driver.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{driver.full_name}</p>
                        {getStatusBadge(driver.status)}
                        {driver.is_online && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {driver.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {driver.vehicle_type} • {driver.vehicle_plate}
                        </span>
                        {driver.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {Number(driver.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(driver, "message")}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      
                      {driver.status === "suspended" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-500 hover:text-green-600"
                          onClick={() => openActionDialog(driver, "activate")}
                        >
                          <Power className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      ) : driver.status === "verified" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openActionDialog(driver, "suspend")}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://zivodriver.lovable.app/driver`, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "suspend" && <Ban className="h-5 w-5 text-destructive" />}
              {actionType === "activate" && <Power className="h-5 w-5 text-green-500" />}
              {actionType === "message" && <MessageSquare className="h-5 w-5 text-primary" />}
              {actionType === "suspend" && "Suspend Driver"}
              {actionType === "activate" && "Reactivate Driver"}
              {actionType === "message" && "Send Message to Driver"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "suspend" && "This will immediately suspend the driver from accepting trips"}
              {actionType === "activate" && "This will reactivate the driver and allow them to accept trips"}
              {actionType === "message" && "Send a notification message directly to the driver"}
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedDriver.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedDriver.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDriver.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.email}</p>
                </div>
              </div>

              {actionType === "message" ? (
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Enter your message to the driver..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">
                    {actionType === "suspend" ? "Reason for Suspension *" : "Notes (optional)"}
                  </label>
                  <Textarea
                    placeholder={actionType === "suspend" ? "Explain why this driver is being suspended..." : "Add any notes..."}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              )}

              {actionType === "suspend" && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-500">Warning</p>
                      <p className="text-muted-foreground">
                        The driver will be immediately logged out and unable to accept any new trips
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            {actionType === "suspend" && (
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={updateStatus.isPending || !actionReason.trim()}
              >
                <Ban className="h-4 w-4 mr-1" />
                Suspend Driver
              </Button>
            )}
            {actionType === "activate" && (
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={handleActivate}
                disabled={updateStatus.isPending}
              >
                <Power className="h-4 w-4 mr-1" />
                Reactivate Driver
              </Button>
            )}
            {actionType === "message" && (
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                Send Message
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverControl;
