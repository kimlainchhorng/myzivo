import { useState } from "react";
import { motion } from "framer-motion";
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
  Users,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Completed</Badge>;
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
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Flight Management</h1>
              <p className="text-muted-foreground">Manage flights and bookings</p>
            </div>
          </div>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load flights</p>
            <p className="text-muted-foreground">{(flightsError as Error).message}</p>
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
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10">
            <Plane className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Flight Management</h1>
            <p className="text-muted-foreground">Manage flights and bookings</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                {flightsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeFlights}</p>}
                <p className="text-sm text-muted-foreground">Active Flights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                {bookingsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalBookings}</p>}
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                {bookingsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{totalPassengers}</p>}
                <p className="text-sm text-muted-foreground">Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                {bookingsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>}
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Flights Table */}
      <motion.div variants={item}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  All Flights
                </CardTitle>
                <CardDescription>View and manage flight schedules</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search flights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                      <TableCell colSpan={6} className="text-center py-12">
                        <Plane className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No flights found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFlights.map((flight, index) => (
                      <motion.tr
                        key={flight.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium font-mono">{flight.flight_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{flight.departure_city}</span>
                            <Plane className="h-3 w-3 text-muted-foreground" />
                            <span>{flight.arrival_city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {format(new Date(flight.departure_time), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-medium">${Number(flight.economy_price).toFixed(0)}</TableCell>
                        <TableCell>
                          <Badge className={flight.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
                            {flight.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedFlight(flight);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div variants={item}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest flight bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                      <TableCell colSpan={5} className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No bookings yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.slice(0, 10).map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-mono">{booking.booking_reference}</TableCell>
                        <TableCell>{booking.total_passengers}</TableCell>
                        <TableCell className="font-medium">${Number(booking.total_amount).toFixed(0)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {booking.created_at && format(new Date(booking.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* View Flight Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Flight Details
            </DialogTitle>
            <DialogDescription>Full flight information</DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/10 flex items-center justify-center">
                  <Plane className="h-7 w-7 text-sky-500" />
                </div>
                <div>
                  <p className="font-semibold text-lg font-mono">{selectedFlight.flight_number}</p>
                  <p className="text-muted-foreground">{selectedFlight.departure_city} → {selectedFlight.arrival_city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Departure</p>
                  <p className="font-medium">{format(new Date(selectedFlight.departure_time), "MMM d, h:mm a")}</p>
                  <p className="text-sm text-muted-foreground">{selectedFlight.departure_airport}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                  <p className="font-medium">{format(new Date(selectedFlight.arrival_time), "MMM d, h:mm a")}</p>
                  <p className="text-sm text-muted-foreground">{selectedFlight.arrival_airport}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Economy Price</p>
                  <p className="font-medium text-lg">${Number(selectedFlight.economy_price).toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Seats Available</p>
                  <p className="font-medium text-lg">{selectedFlight.economy_seats_available || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminFlightManagement;
