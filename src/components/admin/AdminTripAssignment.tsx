import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  User,
  MapPin,
  Clock,
  Car,
  Zap,
  RefreshCw,
  Send,
  Star,
  CheckCircle2,
  Search,
  Filter,
  Bike,
  Truck,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, subHours } from "date-fns";

interface PendingTrip {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number;
  pickup_lng: number;
  fare_amount: number | null;
  created_at: string;
  status: string;
  rider_name?: string;
  vehicle_type?: string;
}

interface AvailableDriver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  vehicle_type: string;
  vehicle_plate: string;
  rating: number;
  current_lat: number | null;
  current_lng: number | null;
  distance_km?: number;
  total_trips?: number;
}

interface AssignmentHistory {
  id: string;
  trip_id: string;
  driver_name: string;
  pickup: string;
  assigned_at: string;
  fare: number;
}

const AdminTripAssignment = () => {
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<PendingTrip | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch pending trips (requested status)
  const { data: pendingTrips, isLoading: tripsLoading, refetch: refetchTrips } = useQuery({
    queryKey: ["pending-trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, pickup_address, dropoff_address, pickup_lat, pickup_lng, fare_amount, created_at, status")
        .eq("status", "requested")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as PendingTrip[];
    },
    refetchInterval: 10000,
  });

  // Fetch available drivers
  const { data: availableDrivers, isLoading: driversLoading } = useQuery({
    queryKey: ["available-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, avatar_url, vehicle_type, vehicle_plate, rating, current_lat, current_lng, total_trips")
        .eq("is_online", true)
        .eq("status", "verified");

      if (error) throw error;
      return data as AvailableDriver[];
    },
    refetchInterval: 5000,
  });

  // Fetch recent assignment history
  const { data: assignmentHistory } = useQuery({
    queryKey: ["assignment-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          id,
          pickup_address,
          fare_amount,
          started_at,
          drivers:driver_id (full_name)
        `)
        .eq("status", "accepted")
        .gte("started_at", subHours(new Date(), 2).toISOString())
        .order("started_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data?.map(t => ({
        id: t.id,
        trip_id: t.id,
        driver_name: (t.drivers as any)?.full_name || "Unknown",
        pickup: t.pickup_address,
        assigned_at: t.started_at || new Date().toISOString(),
        fare: t.fare_amount || 0
      })) as AssignmentHistory[];
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ tripId, driverId }: { tripId: string; driverId: string }) => {
      const { error } = await supabase
        .from("trips")
        .update({ 
          driver_id: driverId, 
          status: "accepted",
          updated_at: new Date().toISOString()
        })
        .eq("id", tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-trips"] });
      queryClient.invalidateQueries({ queryKey: ["assignment-history"] });
      toast.success("Trip assigned successfully");
      setIsAssignDialogOpen(false);
      setSelectedTrip(null);
      setSelectedDriver("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign trip");
    },
  });

  const filteredDrivers = useMemo(() => {
    if (!availableDrivers) return [];
    return availableDrivers.filter(driver => {
      const matchesSearch = driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVehicle = vehicleFilter === "all" || driver.vehicle_type === vehicleFilter;
      return matchesSearch && matchesVehicle;
    });
  }, [availableDrivers, searchTerm, vehicleFilter]);

  const openAssignDialog = (trip: PendingTrip) => {
    setSelectedTrip(trip);
    setIsAssignDialogOpen(true);
  };

  const handleAssign = () => {
    if (selectedTrip && selectedDriver) {
      assignMutation.mutate({ tripId: selectedTrip.id, driverId: selectedDriver });
    }
  };

  const getVehicleBadge = (type: string) => {
    const colors: Record<string, string> = {
      economy: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      comfort: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      premium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      xl: "bg-green-500/10 text-green-500 border-green-500/20",
      car: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      bike: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      suv: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      truck: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return colors[type] || colors.economy;
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "bike": return <Bike className="h-4 w-4" />;
      case "truck": return <Truck className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number | null, lng2: number | null) => {
    if (!lat2 || !lng2) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDriversForTrip = (trip: PendingTrip) => {
    if (!availableDrivers) return [];
    return availableDrivers
      .map(driver => ({
        ...driver,
        distance_km: calculateDistance(trip.pickup_lat, trip.pickup_lng, driver.current_lat, driver.current_lng)
      }))
      .sort((a, b) => a.distance_km - b.distance_km);
  };

  // Stats
  const avgWaitTime = pendingTrips?.length 
    ? Math.round(pendingTrips.reduce((acc, t) => acc + (Date.now() - new Date(t.created_at).getTime()) / 60000, 0) / pendingTrips.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-teal-400/10 shadow-lg"
          >
            <Navigation className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold">Trip Assignment</h1>
            <p className="text-muted-foreground">Manage and dispatch trips to drivers</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Avg Wait: <strong>{avgWaitTime}m</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-assign" 
              checked={autoAssign} 
              onCheckedChange={setAutoAssign}
            />
            <label htmlFor="auto-assign" className="text-sm font-medium flex items-center gap-1.5">
              <Zap className={cn("h-4 w-4", autoAssign && "text-amber-500")} />
              Auto-Assignment
            </label>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchTrips()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTrips?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Pending Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableDrivers?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Online Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignmentHistory?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Assigned (2h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Zap className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{autoAssign ? "ON" : "OFF"}</p>
                <p className="text-xs text-muted-foreground">Auto-Assign</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Trips */}
        <Card className="lg:col-span-1 border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Trip Queue
                </CardTitle>
                <CardDescription>Trips awaiting assignment</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                {pendingTrips?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-3">
                {tripsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/50 space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))
                ) : !pendingTrips?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
                    <p>All trips have been assigned!</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {pendingTrips.map((trip, index) => (
                      <motion.div 
                        key={trip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getVehicleBadge("economy")}>
                                <Car className="h-3 w-3 mr-1" />
                                Ride
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(trip.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold text-green-500">${(trip.fare_amount || 0).toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                            <p className="text-sm line-clamp-1">{trip.pickup_address}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                            <p className="text-sm line-clamp-1">{trip.dropoff_address}</p>
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full gap-2"
                          onClick={() => openAssignDialog(trip)}
                        >
                          <Send className="h-4 w-4" />
                          Assign Driver
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Available Drivers */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-green-500" />
                  Online Drivers
                </CardTitle>
                <CardDescription>Drivers available for dispatch</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-40 h-9"
                  />
                </div>
                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                  <SelectTrigger className="w-32 h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="hidden md:table-cell">Rating</TableHead>
                    <TableHead className="hidden lg:table-cell">Trips</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driversLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : !filteredDrivers?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Car className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No drivers match your filters</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={driver.avatar_url || undefined} />
                              <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{driver.full_name}</p>
                              <p className="text-xs text-muted-foreground">{driver.vehicle_plate}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", getVehicleBadge(driver.vehicle_type))}>
                            {getVehicleIcon(driver.vehicle_type)}
                            {driver.vehicle_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span className="text-sm">{driver.rating?.toFixed(1) || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm">{driver.total_trips || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <MapPin className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      {assignmentHistory && assignmentHistory.length > 0 && (
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {assignmentHistory.map((assignment) => (
                <div 
                  key={assignment.id}
                  className="flex-shrink-0 p-3 rounded-xl border border-border/50 bg-muted/20 min-w-[250px]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{assignment.driver_name}</p>
                    <span className="text-xs text-green-500">${assignment.fare.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{assignment.pickup}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Assign Driver to Trip
            </DialogTitle>
            <DialogDescription>
              Select a driver to dispatch for this trip
            </DialogDescription>
          </DialogHeader>

          {selectedTrip && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex justify-between items-center">
                  <Badge className={getVehicleBadge("economy")}>
                    <Car className="h-3 w-3 mr-1" />
                    Ride
                  </Badge>
                  <span className="font-semibold text-green-500">${(selectedTrip.fare_amount || 0).toFixed(2)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p className="line-clamp-2">{selectedTrip.pickup_address}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <p className="line-clamp-2">{selectedTrip.dropoff_address}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Driver (sorted by proximity)</label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getDriversForTrip(selectedTrip).map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center gap-2">
                          <span>{driver.full_name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground text-xs">{driver.vehicle_plate}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-primary">{driver.distance_km.toFixed(1)} km away</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedDriver || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTripAssignment;
