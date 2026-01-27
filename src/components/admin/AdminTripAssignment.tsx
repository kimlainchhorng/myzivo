import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
  CheckCircle2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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
}

const AdminTripAssignment = () => {
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<PendingTrip | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending trips (requested status)
  const { data: pendingTrips, isLoading: tripsLoading } = useQuery({
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
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch available drivers
  const { data: availableDrivers, isLoading: driversLoading } = useQuery({
    queryKey: ["available-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, avatar_url, vehicle_type, vehicle_plate, rating, current_lat, current_lng")
        .eq("is_online", true)
        .eq("status", "verified");

      if (error) throw error;
      return data as AvailableDriver[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
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
      toast.success("Trip assigned successfully");
      setIsAssignDialogOpen(false);
      setSelectedTrip(null);
      setSelectedDriver("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign trip");
    },
  });

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
    };
    return colors[type] || colors.economy;
  };

  // Calculate distance between two points (simplified)
  const calculateDistance = (lat1: number, lng1: number, lat2: number | null, lng2: number | null) => {
    if (!lat2 || !lng2) return 999;
    const R = 6371; // km
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

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Trip Assignment</h3>
                  <p className="text-sm text-muted-foreground">Manage and dispatch trips to drivers</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Trips */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Trips
                </CardTitle>
                <CardDescription>Trips awaiting driver assignment</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                {pendingTrips?.length || 0} waiting
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tripsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))
            ) : !pendingTrips?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
                <p>All trips have been assigned!</p>
              </div>
            ) : (
              pendingTrips.map((trip) => (
                <div 
                  key={trip.id} 
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
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Available Drivers */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-500" />
                  Online Drivers
                </CardTitle>
                <CardDescription>Drivers available for trips</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                {availableDrivers?.length || 0} online
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {driversLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : !availableDrivers?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No drivers currently online</p>
              </div>
            ) : (
              availableDrivers.map((driver) => (
                <div 
                  key={driver.id} 
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={driver.avatar_url || undefined} />
                    <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{driver.full_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className={cn("text-[10px] py-0", getVehicleBadge(driver.vehicle_type))}>
                        {driver.vehicle_type}
                      </Badge>
                      <span>{driver.vehicle_plate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span className="text-sm font-medium">{driver.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    {driver.current_lat && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        Active
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

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
              {/* Trip Info */}
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

              {/* Driver Selection */}
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
