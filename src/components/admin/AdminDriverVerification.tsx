import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Car,
  Star,
  MapPin,
  FileText,
  AlertCircle
} from "lucide-react";
import { useDrivers, useUpdateDriverStatus, Driver, DriverStatus } from "@/hooks/useDrivers";

const AdminDriverVerification = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: drivers, isLoading, error } = useDrivers();
  const updateStatus = useUpdateDriverStatus();

  const filteredDrivers = drivers?.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && driver.status === activeTab;
  }) || [];

  const getStatusBadge = (status: DriverStatus | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "suspended":
        return <Badge variant="secondary">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getVehicleTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      economy: "bg-blue-500/10 text-blue-600",
      comfort: "bg-purple-500/10 text-purple-600",
      premium: "bg-amber-500/10 text-amber-600",
      xl: "bg-emerald-500/10 text-emerald-600",
    };
    return (
      <Badge className={colors[type] || "bg-gray-500/10 text-gray-600"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const handleApprove = (driver: Driver) => {
    updateStatus.mutate({ id: driver.id, status: "verified", documents_verified: true });
  };

  const handleReject = (driver: Driver) => {
    updateStatus.mutate({ id: driver.id, status: "rejected", documents_verified: false });
  };

  const pendingCount = drivers?.filter((d) => d.status === "pending").length || 0;
  const verifiedCount = drivers?.filter((d) => d.status === "verified").length || 0;
  const onlineCount = drivers?.filter((d) => d.is_online).length || 0;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Driver Verification</h1>
          <p className="text-muted-foreground">Review and verify driver applications</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load drivers</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Driver Verification</h1>
        <p className="text-muted-foreground">Review and verify driver applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-yellow-600" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Drivers</CardTitle>
              <CardDescription>Manage driver accounts and verification status</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                            <Skeleton className="h-8 w-8 rounded-full" />
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No drivers match your search" : "No drivers found. Driver applications will appear here."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={driver.avatar_url || undefined} />
                                <AvatarFallback>
                                  {driver.full_name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              {driver.is_online && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
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
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
                                  className="text-green-600"
                                  onClick={() => handleApprove(driver)}
                                  disabled={updateStatus.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => handleReject(driver)}
                                  disabled={updateStatus.isPending}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Driver Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>Complete driver profile and verification status</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedDriver.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
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
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{selectedDriver.license_number}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <Car className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Vehicle Information</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Type</p>
                    {getVehicleTypeBadge(selectedDriver.vehicle_type)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{selectedDriver.vehicle_model || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Plate</p>
                    <p className="font-medium">{selectedDriver.vehicle_plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="font-medium">
                      {selectedDriver.documents_verified ? (
                        <span className="text-green-600">Verified ✓</span>
                      ) : (
                        <span className="text-yellow-600">Pending Review</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{selectedDriver.total_trips || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    {selectedDriver.rating && selectedDriver.rating > 0 ? Number(selectedDriver.rating).toFixed(1) : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    {selectedDriver.is_online ? "Online" : "Offline"}
                  </p>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedDriver?.status === "pending" && (
              <>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    handleReject(selectedDriver);
                    setIsViewDialogOpen(false);
                  }}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedDriver);
                    setIsViewDialogOpen(false);
                  }}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            {selectedDriver?.status !== "pending" && (
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverVerification;
