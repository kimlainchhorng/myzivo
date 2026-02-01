import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, Navigation, Clock, DollarSign, Users, Car, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  Search, Filter, RefreshCw, Eye, Phone, MessageSquare,
  Loader2, Mail, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrips, useTripStats, type Trip } from "@/hooks/useTrips";
import { useRideRequests, useUpdateRideRequest, type RideRequest, type RideRequestStatus } from "@/hooks/useRideRequests";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminRidesManagement() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RideRequestStatus | "all">("all");

  const { data: trips, isLoading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { data: tripStats, isLoading: statsLoading, refetch: refetchStats } = useTripStats();
  const { data: rideRequests, isLoading: requestsLoading, refetch: refetchRequests } = useRideRequests(statusFilter);
  const updateRideRequest = useUpdateRideRequest();

  const isLoading = tripsLoading || statsLoading || requestsLoading;

  const handleRefresh = () => {
    refetchTrips();
    refetchStats();
    refetchRequests();
  };

  const activeRides = trips?.filter(t => 
    ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(t.status || "")
  ) || [];

  const pendingRequests = trips?.filter(t => t.status === "requested") || [];

  // Filter ride requests by search
  const filteredRideRequests = rideRequests?.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.id.toLowerCase().includes(query) ||
      request.customer_name.toLowerCase().includes(query) ||
      request.customer_phone.includes(query) ||
      request.pickup_address.toLowerCase().includes(query) ||
      request.dropoff_address.toLowerCase().includes(query)
    );
  }) || [];

  // Filter active rides by search
  const filteredActiveRides = activeRides.filter(ride => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ride.id.toLowerCase().includes(query) ||
      ride.pickup_address.toLowerCase().includes(query) ||
      ride.dropoff_address.toLowerCase().includes(query) ||
      ride.driver?.full_name?.toLowerCase().includes(query) ||
      ride.rider?.full_name?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string | null) => {
    const styles = {
      new: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      contacted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      assigned: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      requested: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      en_route: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      arrived: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      in_progress: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status as keyof typeof styles] || styles.new;
  };

  const handleStatusUpdate = (id: string, newStatus: RideRequestStatus) => {
    updateRideRequest.mutate({ id, updates: { status: newStatus } });
  };

  const formatAddress = (address: string) => {
    // Shorten long addresses for display
    if (address.length > 25) {
      return address.substring(0, 22) + "...";
    }
    return address;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10">
            <Navigation className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Rides Management</h1>
            <p className="text-muted-foreground">Monitor and manage all ride operations</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { 
            label: "Active Rides", 
            value: statsLoading ? "..." : (tripStats?.activeTrips ?? 0), 
            icon: Car, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/10" 
          },
          { 
            label: "Completed Today", 
            value: statsLoading ? "..." : (tripStats?.completedToday ?? 0), 
            icon: CheckCircle, 
            color: "text-green-500", 
            bg: "bg-green-500/10" 
          },
          { 
            label: "Cancelled", 
            value: statsLoading ? "..." : (tripStats?.cancelledToday ?? 0), 
            icon: XCircle, 
            color: "text-red-500", 
            bg: "bg-red-500/10" 
          },
          { 
            label: "Avg Wait Time", 
            value: "-- min", 
            icon: Clock, 
            color: "text-amber-500", 
            bg: "bg-amber-500/10" 
          },
          { 
            label: "Avg Fare", 
            value: statsLoading ? "..." : `$${((tripStats?.revenueToday ?? 0) / Math.max(tripStats?.completedToday ?? 1, 1)).toFixed(2)}`, 
            icon: DollarSign, 
            color: "text-blue-500", 
            bg: "bg-blue-500/10" 
          },
          { 
            label: "Total Revenue", 
            value: statsLoading ? "..." : `$${(tripStats?.revenueToday ?? 0).toLocaleString()}`, 
            icon: TrendingUp, 
            color: "text-violet-500", 
            bg: "bg-violet-500/10" 
          },
        ].map((stat, i) => (
          <Card key={i} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4" />
            Ride Requests
            {(rideRequests?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {rideRequests?.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Navigation className="h-4 w-4" />
            Live Rides
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="dispatch" className="gap-2">
            <Users className="h-4 w-4" />
            Manual Dispatch
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues
          </TabsTrigger>
        </TabsList>

        {/* Ride Requests Tab (MVP) */}
        <TabsContent value="requests" className="mt-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, phone, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RideRequestStatus | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="en_route">En Route</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ride Requests List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Ride Requests (MVP)
                <Badge variant="outline" className="ml-2 text-primary border-primary/30">
                  {filteredRideRequests.length} Requests
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRideRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ride requests found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRideRequests.map((request, i) => (
                    <RideRequestCard 
                      key={request.id} 
                      request={request} 
                      index={i} 
                      getStatusBadge={getStatusBadge}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rides, riders, drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Active Rides Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-sky-500" />
                Live Rides
                <Badge variant="outline" className="ml-2 text-emerald-500 border-emerald-500/30">
                  {filteredActiveRides.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tripsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredActiveRides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active rides at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredActiveRides.map((ride, i) => (
                    <RideCard 
                      key={ride.id} 
                      ride={ride} 
                      index={i} 
                      getStatusBadge={getStatusBadge}
                      formatAddress={formatAddress}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pending Requests (Legacy Trips)
                <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500/30">
                  {pendingRequests.length} Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tripsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending ride requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((ride, i) => (
                    <RideCard 
                      key={ride.id} 
                      ride={ride} 
                      index={i} 
                      getStatusBadge={getStatusBadge}
                      formatAddress={formatAddress}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatch" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Manual dispatch controls for assigning drivers</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ride issues and incidents will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Ride Request Card for MVP
function RideRequestCard({ 
  request, 
  index, 
  getStatusBadge,
  onStatusUpdate
}: { 
  request: RideRequest; 
  index: number; 
  getStatusBadge: (status: string | null) => string;
  onStatusUpdate: (id: string, status: RideRequestStatus) => void;
}) {
  const formatAddress = (address: string) => address.length > 30 ? address.substring(0, 27) + "..." : address;

  return (
    <div 
      className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start lg:items-center gap-4 flex-wrap">
          <div className="text-center min-w-[90px]">
            <p className="font-mono text-xs font-bold text-muted-foreground">{request.id.slice(0, 8)}</p>
            <Badge variant="outline" className={cn("text-[10px] mt-1", getStatusBadge(request.status))}>
              {request.status}
            </Badge>
            <p className="text-[10px] text-muted-foreground mt-1">
              {format(new Date(request.created_at), "MMM d, h:mm a")}
            </p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block" />
          <div className="min-w-[120px]">
            <p className="font-medium">{request.customer_name}</p>
            <p className="text-xs text-muted-foreground">{request.customer_phone}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{request.customer_email}</p>
          </div>
          <div className="h-12 w-px bg-border hidden lg:block" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-sm" title={request.pickup_address}>{formatAddress(request.pickup_address)}</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-sm" title={request.dropoff_address}>{formatAddress(request.dropoff_address)}</span>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">{request.ride_type}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={request.status} 
            onValueChange={(v) => onStatusUpdate(request.id, v as RideRequestStatus)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="en_route">En Route</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
              <a href={`tel:${request.customer_phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
              <a href={`mailto:${request.customer_email}`}>
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
      {request.notes && (
        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
          <strong>Notes:</strong> {request.notes}
        </div>
      )}
    </div>
  );
}

// Separate component for ride cards (legacy trips)
function RideCard({ 
  ride, 
  index, 
  getStatusBadge, 
  formatAddress 
}: { 
  ride: Trip; 
  index: number; 
  getStatusBadge: (status: string | null) => string;
  formatAddress: (address: string) => string;
}) {
  return (
    <div 
      className="p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-center min-w-[70px]">
            <p className="font-mono text-sm font-bold">{ride.id.slice(0, 8)}</p>
            <Badge variant="outline" className={cn("text-[10px] mt-1", getStatusBadge(ride.status))}>
              {(ride.status || "unknown").replace("_", " ")}
            </Badge>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block" />
          <div className="min-w-[80px]">
            <p className="font-medium">{ride.rider?.full_name || "Unknown Rider"}</p>
            <p className="text-xs text-muted-foreground">Rider</p>
          </div>
          <div className="min-w-[80px]">
            <p className="font-medium">{ride.driver?.full_name || "Unassigned"}</p>
            <p className="text-xs text-muted-foreground">Driver</p>
          </div>
          <div className="h-12 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-sm" title={ride.pickup_address}>{formatAddress(ride.pickup_address)}</span>
            <span className="text-muted-foreground">→</span>
            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm" title={ride.dropoff_address}>{formatAddress(ride.dropoff_address)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-lg">${(ride.fare_amount ?? 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {ride.distance_km ? `${ride.distance_km.toFixed(1)} km` : "-- km"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
