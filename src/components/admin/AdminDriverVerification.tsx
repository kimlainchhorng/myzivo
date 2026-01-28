import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Car,
  Star,
  MapPin,
  FileText,
  AlertCircle,
  Shield,
  Users,
  Filter,
  Clock,
  UserCheck,
  Bike,
  Truck,
  BadgeCheck,
  TrendingUp
} from "lucide-react";
import { useDrivers, useUpdateDriverStatus, Driver, DriverStatus } from "@/hooks/useDrivers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AdminDriverVerification = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  const { data: drivers, isLoading, error } = useDrivers();
  const updateStatus = useUpdateDriverStatus();

  // Fetch verification stats
  const { data: verificationStats } = useQuery({
    queryKey: ["verification-stats"],
    queryFn: async () => {
      const today = new Date();
      const weekStart = subDays(today, 7);
      
      const { data: recentVerifications } = await supabase
        .from("drivers")
        .select("id, status, created_at")
        .gte("created_at", weekStart.toISOString());
      
      const todayApprovals = recentVerifications?.filter(d => 
        d.status === "verified" && 
        new Date(d.created_at) >= startOfDay(today)
      ).length || 0;
      
      const weekApprovals = recentVerifications?.filter(d => 
        d.status === "verified"
      ).length || 0;
      
      return { todayApprovals, weekApprovals };
    },
  });

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    return drivers.filter((driver) => {
      const matchesSearch =
        driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = activeTab === "all" || driver.status === activeTab;
      const matchesVehicle = vehicleFilter === "all" || driver.vehicle_type === vehicleFilter;
      
      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [drivers, searchQuery, activeTab, vehicleFilter]);

  const getStatusBadge = (status: DriverStatus | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><BadgeCheck className="h-3 w-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "suspended":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "bike": return <Bike className="h-3 w-3" />;
      case "truck": return <Truck className="h-3 w-3" />;
      default: return <Car className="h-3 w-3" />;
    }
  };

  const getVehicleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      economy: "bg-green-500/10 text-green-500 border-green-500/20",
      comfort: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      premium: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      xl: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      car: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      bike: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      suv: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      truck: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return (
      <Badge className={cn("gap-1", colors[type] || "bg-gray-500/10 text-gray-500")}>
        {getVehicleIcon(type)}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const handleApprove = (driver: Driver) => {
    updateStatus.mutate({ id: driver.id, status: "verified", documents_verified: true });
  };

  const handleRejectClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedDriver) {
      updateStatus.mutate({ id: selectedDriver.id, status: "rejected", documents_verified: false });
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setSelectedDriver(null);
    }
  };

  const pendingCount = drivers?.filter((d) => d.status === "pending").length || 0;
  const verifiedCount = drivers?.filter((d) => d.status === "verified").length || 0;
  const rejectedCount = drivers?.filter((d) => d.status === "rejected").length || 0;
  const onlineCount = drivers?.filter((d) => d.is_online).length || 0;

  if (error) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Driver Verification</h1>
              <p className="text-muted-foreground">Review and verify driver applications</p>
            </div>
          </div>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load drivers</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Driver Verification</h1>
            <p className="text-muted-foreground">Review and verify driver applications</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{pendingCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{verifiedCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Verified Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{onlineCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Driver Table */}
      <motion.div variants={item}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  All Drivers
                </CardTitle>
                <CardDescription>Manage driver accounts and verification status</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drivers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-muted/30">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Driver</TableHead>
                      <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead className="hidden lg:table-cell">Trips</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredDrivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">
                            {searchQuery ? "No drivers match your search" : "No drivers found"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDrivers.map((driver, index) => (
                        <motion.tr
                          key={driver.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-background">
                                  <AvatarImage src={driver.avatar_url || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20">
                                    {driver.full_name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                {driver.is_online && (
                                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{driver.full_name}</p>
                                <p className="text-sm text-muted-foreground">{driver.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <p className="font-medium">{driver.vehicle_model || "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{driver.vehicle_plate}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getVehicleTypeBadge(driver.vehicle_type)}</TableCell>
                          <TableCell>{getStatusBadge(driver.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {driver.rating && driver.rating > 0 ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>{Number(driver.rating).toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{driver.total_trips || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setSelectedDriver(driver);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {driver.status === "pending" && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleApprove(driver)}
                                    disabled={updateStatus.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRejectClick(driver)}
                                    disabled={updateStatus.isPending}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* View Driver Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Driver Details
            </DialogTitle>
            <DialogDescription>Complete driver profile and verification status</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={selectedDriver.avatar_url || undefined} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-blue-500/20">
                    {selectedDriver.full_name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedDriver.full_name}</p>
                  <p className="text-muted-foreground">{selectedDriver.email}</p>
                  <div className="mt-1">{getStatusBadge(selectedDriver.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">License Number</p>
                  <p className="font-medium">{selectedDriver.license_number}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Vehicle Information</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Vehicle Type</p>
                    {getVehicleTypeBadge(selectedDriver.vehicle_type)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <p className="font-medium">{selectedDriver.vehicle_model || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">License Plate</p>
                    <p className="font-medium">{selectedDriver.vehicle_plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Documents</p>
                    <p className="font-medium">
                      {selectedDriver.documents_verified ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-500">Pending Review</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold">{selectedDriver.total_trips || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-2xl font-bold">
                    {selectedDriver.rating && selectedDriver.rating > 0 ? Number(selectedDriver.rating).toFixed(1) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <div className={`text-2xl font-bold ${selectedDriver.is_online ? "text-green-500" : "text-muted-foreground"}`}>
                    {selectedDriver.is_online ? "Online" : "Offline"}
                  </div>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedDriver?.status === "pending" && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleRejectClick(selectedDriver);
                    setIsViewDialogOpen(false);
                  }}
                  disabled={updateStatus.isPending}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedDriver);
                    setIsViewDialogOpen(false);
                  }}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Driver Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this driver? They will need to reapply.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDriver && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedDriver.avatar_url || undefined} />
                  <AvatarFallback>{selectedDriver.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDriver.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.email}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Rejection Reason (optional)</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminDriverVerification;
