import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Plane,
  DollarSign,
  AlertCircle,
  Clock,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type Flight = {
  id: string;
  flight_number: string;
  departure_city: string;
  departure_airport: string;
  arrival_city: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  economy_price: number;
  economy_seats_available: number | null;
  is_active: boolean | null;
  airline_id: string;
};

type FlightBooking = {
  id: string;
  booking_reference: string;
  customer_id: string;
  total_passengers: number;
  total_amount: number;
  status: string | null;
  created_at: string | null;
};

const AdminFlightManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: flights, isLoading: flightsLoading, error: flightsError } = useQuery({
    queryKey: ["admin-flights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("*")
        .order("departure_time", { ascending: true });
      if (error) throw error;
      return data as Flight[];
    },
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-flight-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FlightBooking[];
    },
  });

  const filteredFlights = flights?.filter((flight) => {
    return (
      flight.flight_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.departure_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.arrival_city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-600">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const activeFlights = flights?.filter((f) => f.is_active).length || 0;
  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
  const totalPassengers = bookings?.reduce((sum, b) => sum + b.total_passengers, 0) || 0;

  if (flightsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Flight Management</h1>
          <p className="text-muted-foreground">Manage flights and bookings</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load flights</p>
            <p className="text-muted-foreground">{(flightsError as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Flight Management</h1>
        <p className="text-muted-foreground">Manage flights and bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                {flightsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeFlights}</p>}
                <p className="text-sm text-muted-foreground">Active Flights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                {bookingsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalBookings}</p>}
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                {bookingsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalPassengers}</p>}
                <p className="text-sm text-muted-foreground">Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                {bookingsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>}
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Flights</CardTitle>
              <CardDescription>View and manage flight schedules</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="hidden md:table-cell">Departure</TableHead>
                  <TableHead className="hidden lg:table-cell">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flightsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredFlights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No flights found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlights.map((flight) => (
                    <TableRow key={flight.id}>
                      <TableCell className="font-medium">{flight.flight_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{flight.departure_city}</span>
                          <Plane className="h-3 w-3 text-muted-foreground" />
                          <span>{flight.arrival_city}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(flight.departure_time), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">${Number(flight.economy_price).toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge className={flight.is_active ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                          {flight.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFlight(flight);
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
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest flight bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : !bookings?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No bookings yet
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.slice(0, 10).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono">{booking.booking_reference}</TableCell>
                      <TableCell>{booking.total_passengers}</TableCell>
                      <TableCell>${Number(booking.total_amount).toFixed(0)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {booking.created_at && format(new Date(booking.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Flight Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Flight Details</DialogTitle>
            <DialogDescription>Full flight information</DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plane className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedFlight.flight_number}</p>
                  <p className="text-muted-foreground">{selectedFlight.departure_city} → {selectedFlight.arrival_city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="font-medium">{format(new Date(selectedFlight.departure_time), "MMM d, h:mm a")}</p>
                  <p className="text-sm">{selectedFlight.departure_airport}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="font-medium">{format(new Date(selectedFlight.arrival_time), "MMM d, h:mm a")}</p>
                  <p className="text-sm">{selectedFlight.arrival_airport}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economy Price</p>
                  <p className="font-medium">${Number(selectedFlight.economy_price).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seats Available</p>
                  <p className="font-medium">{selectedFlight.economy_seats_available || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFlightManagement;
