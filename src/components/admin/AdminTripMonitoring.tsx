import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Star,
  AlertCircle,
  XCircle
} from "lucide-react";
import { useTrips, useTripStats, useCancelTrip, Trip, TripStatus } from "@/hooks/useTrips";
import TripMap from "./TripMap";

const AdminTripMonitoring = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: trips, isLoading, error } = useTrips();
  const { data: stats, isLoading: statsLoading } = useTripStats();
  const cancelTrip = useCancelTrip();

  const filteredTrips = trips?.filter((trip) => {
    const matchesSearch =
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") {
      return matchesSearch && ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(trip.status || "");
    }
    return matchesSearch && trip.status === activeTab;
  }) || [];

  const getStatusBadge = (status: TripStatus | null) => {
    const statusConfig: Record<string, { class: string; label: string }> = {
      requested: { class: "bg-blue-500/10 text-blue-600", label: "Requested" },
      accepted: { class: "bg-indigo-500/10 text-indigo-600", label: "Accepted" },
      en_route: { class: "bg-purple-500/10 text-purple-600", label: "En Route" },
      arrived: { class: "bg-cyan-500/10 text-cyan-600", label: "Arrived" },
      in_progress: { class: "bg-yellow-500/10 text-yellow-600", label: "In Progress" },
      completed: { class: "bg-green-500/10 text-green-600", label: "Completed" },
      cancelled: { class: "bg-red-500/10 text-red-600", label: "Cancelled" },
    };
    const config = statusConfig[status || ""] || { class: "bg-gray-500/10 text-gray-600", label: status || "Unknown" };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-gray-500/10 text-gray-600">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCancelTrip = (tripId: string, refund: boolean) => {
    cancelTrip.mutate({ id: tripId, refund });
    setIsViewDialogOpen(false);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Trip Monitoring</h1>
          <p className="text-muted-foreground">Monitor and manage all trips in real-time</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load trips</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trip Monitoring</h1>
        <p className="text-muted-foreground">Monitor and manage all trips in real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.activeTrips || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Active Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.completedToday || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.cancelledToday || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">${stats?.revenueToday?.toFixed(0) || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Revenue Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Map */}
      <TripMap />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Trips</CardTitle>
              <CardDescription>Track and monitor trip details and status</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
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
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead className="hidden md:table-cell">Pickup</TableHead>
                    <TableHead className="hidden lg:table-cell">Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Fare</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No trips match your search" : "No trips found. Trips will appear here when riders book rides."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-mono text-sm">{trip.id.slice(0, 8)}...</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                          {trip.pickup_address}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {trip.driver?.full_name || <span className="text-muted-foreground">Unassigned</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          ${trip.fare_amount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{getPaymentBadge(trip.payment_status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatTime(trip.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTrip(trip);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* View Trip Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Trip Details</DialogTitle>
            <DialogDescription>Complete trip information</DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-lg font-semibold">{selectedTrip.id.slice(0, 8)}...</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedTrip.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(selectedTrip.status)}
                  {getPaymentBadge(selectedTrip.payment_status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rider ID</p>
                  <p className="font-medium truncate">{selectedTrip.rider_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-medium">
                    {selectedTrip.driver?.full_name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Navigation className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium">{selectedTrip.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dropoff</p>
                    <p className="font-medium">{selectedTrip.dropoff_address}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">{selectedTrip.distance_km || 0} km</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {selectedTrip.duration_minutes ? `${selectedTrip.duration_minutes} min` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold">${selectedTrip.fare_amount?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">Fare</p>
                </div>
              </div>

              {selectedTrip.rating && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Rating:</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedTrip.rating!
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedTrip && !["completed", "cancelled"].includes(selectedTrip.status || "") && (
              <Button 
                variant="destructive"
                onClick={() => handleCancelTrip(selectedTrip.id, true)}
                disabled={cancelTrip.isPending}
              >
                Cancel & Refund
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTripMonitoring;
