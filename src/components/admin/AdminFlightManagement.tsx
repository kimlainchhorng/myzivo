import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Eye, Plane, DollarSign, AlertCircle, Clock, Users, TrendingUp,
  MoreHorizontal, CheckCircle, XCircle, Edit, Ban, RefreshCw, Calendar,
  ArrowUpRight, ArrowDownRight, Globe, MapPin, Briefcase, Timer, Filter,
  Ticket, CreditCard
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

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
  business_price: number | null;
  economy_seats_available: number | null;
  business_seats_available: number | null;
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
  flight_id: string;
  // MoR fields
  ticketing_status: string | null;
  pnr: string | null;
  ticket_numbers: string[] | null;
  payment_status: string | null;
  refund_status: string | null;
  origin: string | null;
  destination: string | null;
};

const AdminFlightManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flights");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

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

  const { data: airlines } = useQuery({
    queryKey: ["admin-airlines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("airlines")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const updateFlightStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("flights")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flights"] });
      toast.success("Flight status updated");
    },
    onError: (error) => toast.error("Failed to update: " + error.message),
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" | "in_progress" | "ready_for_pickup" | "refunded" }) => {
      const { error } = await supabase
        .from("flight_bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flight-bookings"] });
      toast.success("Booking status updated");
    },
    onError: (error) => toast.error("Failed to update: " + error.message),
  });

  // Retry ticketing mutation
  const retryTicketing = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase.functions.invoke('issue-flight-ticket', {
        body: { bookingId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ticketing retry initiated');
      queryClient.invalidateQueries({ queryKey: ['admin-flight-bookings'] });
    },
    onError: (error) => toast.error('Ticketing failed: ' + (error as Error).message),
  });

  // Process refund mutation
  const processRefund = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase.functions.invoke('process-flight-refund', {
        body: { bookingId, action: 'process', reason: 'Admin processed' },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-flight-bookings'] });
    },
    onError: (error) => toast.error('Refund failed: ' + (error as Error).message),
  });

  const filteredFlights = flights?.filter((flight) => {
    const matchesSearch = 
      flight.flight_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.departure_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.arrival_city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && flight.is_active;
    if (statusFilter === "inactive") return matchesSearch && !flight.is_active;
    return matchesSearch;
  }) || [];

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch = 
      booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.pnr && booking.pnr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.origin && booking.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.destination && booking.destination.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "issued") return matchesSearch && booking.ticketing_status === "issued";
    if (statusFilter === "pending") return matchesSearch && booking.ticketing_status === "pending";
    if (statusFilter === "processing") return matchesSearch && booking.ticketing_status === "processing";
    if (statusFilter === "failed") return matchesSearch && booking.ticketing_status === "failed";
    return matchesSearch && booking.status === statusFilter;
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

  const getTicketingBadge = (status: string | null) => {
    switch (status) {
      case 'issued':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Issued</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Cancelled</Badge>;
      case 'voided':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Voided</Badge>;
      default:
        return <Badge variant="outline">{status || '-'}</Badge>;
    }
  };

  // Stats calculations
  const activeFlights = flights?.filter((f) => f.is_active).length || 0;
  const totalBookings = bookings?.length || 0;
  const issuedTickets = bookings?.filter((b) => b.ticketing_status === "issued").length || 0;
  const failedTickets = bookings?.filter((b) => b.ticketing_status === "failed").length || 0;
  const totalRevenue = bookings?.filter(b => b.ticketing_status === 'issued').reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
  const totalPassengers = bookings?.reduce((sum, b) => sum + b.total_passengers, 0) || 0;
  const ticketingSuccessRate = totalBookings > 0 ? (issuedTickets / totalBookings) * 100 : 0;

  if (flightsError) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Flight Management</h1>
            <p className="text-muted-foreground">Error loading data</p>
          </div>
        </div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
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
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10">
              <Plane className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Flight Management</h1>
              <p className="text-muted-foreground">Manage flights, bookings, ticketing, and airlines</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-flights"] });
              queryClient.invalidateQueries({ queryKey: ["admin-flight-bookings"] });
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Flights", value: activeFlights, icon: Plane, color: "text-sky-500", gradient: "from-sky-500/20 to-sky-500/5", change: "+5", trend: "up" },
          { label: "Tickets Issued", value: issuedTickets, icon: Ticket, color: "text-emerald-500", gradient: "from-emerald-500/20 to-emerald-500/5", change: `${ticketingSuccessRate.toFixed(0)}%`, trend: "up" },
          { label: "Failed Tickets", value: failedTickets, icon: AlertCircle, color: "text-red-500", gradient: "from-red-500/20 to-red-500/5", change: failedTickets > 0 ? "Attention" : "None", trend: failedTickets > 0 ? "down" : "up" },
          { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-amber-500", gradient: "from-amber-500/20 to-amber-500/5", change: "+18%", trend: "up" },
        ].map((stat, i) => (
          <Card 
            key={stat.label} 
            className="border-0 bg-card/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="outline" className={stat.trend === "up" ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : "text-red-500 border-red-500/30 bg-red-500/10"}>
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{flightsLoading || bookingsLoading ? <Skeleton className="h-8 w-16" /> : stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "320ms" }}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ticketing Success Rate</span>
              <span className="text-sm font-medium">{ticketingSuccessRate.toFixed(1)}%</span>
            </div>
            <Progress value={ticketingSuccessRate} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Passengers</span>
              <span className="text-sm font-medium">{totalPassengers}</span>
            </div>
            <Progress value={Math.min((totalPassengers / 100) * 100, 100)} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Airlines</span>
              <span className="text-sm font-medium">{airlines?.filter((a: any) => a.is_active).length || 0}</span>
            </div>
            <Progress value={((airlines?.filter((a: any) => a.is_active).length || 0) / (airlines?.length || 1)) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "400ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="flights" className="gap-2">
              <Plane className="h-4 w-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="ticketing" className="gap-2">
              <Ticket className="h-4 w-4" />
              Ticketing
            </TabsTrigger>
            <TabsTrigger value="airlines" className="gap-2">
              <Globe className="h-4 w-4" />
              Airlines
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {activeTab === "flights" ? (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </>
                ) : activeTab === "ticketing" || activeTab === "bookings" ? (
                  <>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
              />
            </div>
          </div>
        </div>

        {/* Flights Tab */}
        <TabsContent value="flights" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                All Flights
              </CardTitle>
              <CardDescription>View and manage flight schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Flight</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="hidden md:table-cell">Departure</TableHead>
                      <TableHead className="hidden lg:table-cell">Economy</TableHead>
                      <TableHead className="hidden lg:table-cell">Business</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
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
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredFlights.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Plane className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No flights found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFlights.map((flight, index) => (
                        <TableRow
                          key={flight.id}
                          className="group hover:bg-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-medium font-mono">{flight.flight_number}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{flight.departure_city}</span>
                              <Plane className="h-3 w-3 text-muted-foreground rotate-90" />
                              <span className="font-medium">{flight.arrival_city}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{flight.departure_airport} → {flight.arrival_airport}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(flight.departure_time), "MMM d")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <Timer className="h-3 w-3" />
                              {format(new Date(flight.departure_time), "h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm font-medium">${Number(flight.economy_price).toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">{flight.economy_seats_available || 0} seats</div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm font-medium">${Number(flight.business_price || 0).toFixed(0)}</div>
                            <div className="text-xs text-muted-foreground">{flight.business_seats_available || 0} seats</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={flight.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
                              {flight.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { setSelectedFlight(flight); setIsViewDialogOpen(true); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Flight
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {flight.is_active ? (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => updateFlightStatus.mutate({ id: flight.id, is_active: false })}
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => updateFlightStatus.mutate({ id: flight.id, is_active: true })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recent Bookings
              </CardTitle>
              <CardDescription>Manage flight bookings and reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Reference</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Passengers</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Ticketing</TableHead>
                      <TableHead>PNR</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No bookings found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.slice(0, 15).map((booking, index) => (
                        <TableRow
                          key={booking.id}
                          className="group hover:bg-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium">{booking.booking_reference}</TableCell>
                          <TableCell>
                            {booking.origin && booking.destination ? (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="font-medium">{booking.origin}</span>
                                <Plane className="h-3 w-3 text-muted-foreground rotate-90" />
                                <span className="font-medium">{booking.destination}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              {booking.total_passengers}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${Number(booking.total_amount).toFixed(0)}</TableCell>
                          <TableCell>{getTicketingBadge(booking.ticketing_status)}</TableCell>
                          <TableCell className="font-mono text-sm">{booking.pnr || '-'}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {booking.created_at && format(new Date(booking.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {booking.ticketing_status === 'failed' && (
                                  <DropdownMenuItem 
                                    className="text-blue-600"
                                    onClick={() => retryTicketing.mutate(booking.id)}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry Ticketing
                                  </DropdownMenuItem>
                                )}
                                {booking.ticketing_status === 'issued' && (
                                  <DropdownMenuItem 
                                    className="text-amber-600"
                                    onClick={() => processRefund.mutate(booking.id)}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Process Refund
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {booking.status === "pending" && (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "confirmed" })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirm
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => updateBookingStatus.mutate({ id: booking.id, status: "cancelled" })}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ticketing Tab */}
        <TabsContent value="ticketing" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Ticketing Status
              </CardTitle>
              <CardDescription>Monitor ticket issuance and manage failed tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Quick stats for ticketing */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-500 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Issued</span>
                  </div>
                  <p className="text-2xl font-bold">{issuedTickets}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">{bookings?.filter(b => b.ticketing_status === 'pending').length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-500 mb-1">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">Processing</span>
                  </div>
                  <p className="text-2xl font-bold">{bookings?.filter(b => b.ticketing_status === 'processing').length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                  <p className="text-2xl font-bold">{failedTickets}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Ticketing Status</TableHead>
                      <TableHead>PNR</TableHead>
                      <TableHead>Ticket Numbers</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No tickets found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking, index) => (
                        <TableRow
                          key={booking.id}
                          className="group hover:bg-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium">{booking.booking_reference}</TableCell>
                          <TableCell>
                            {booking.origin && booking.destination ? (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="font-medium">{booking.origin}</span>
                                <Plane className="h-3 w-3 text-muted-foreground rotate-90" />
                                <span className="font-medium">{booking.destination}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getTicketingBadge(booking.ticketing_status)}</TableCell>
                          <TableCell className="font-mono text-sm">{booking.pnr || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {booking.ticket_numbers?.length ? booking.ticket_numbers.join(', ') : '-'}
                          </TableCell>
                          <TableCell className="font-medium">${Number(booking.total_amount).toFixed(0)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {booking.ticketing_status === 'failed' && (
                                  <DropdownMenuItem 
                                    className="text-blue-600"
                                    onClick={() => retryTicketing.mutate(booking.id)}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry Ticketing
                                  </DropdownMenuItem>
                                )}
                                {booking.ticketing_status === 'issued' && (
                                  <DropdownMenuItem 
                                    className="text-amber-600"
                                    onClick={() => processRefund.mutate(booking.id)}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Process Refund
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Airlines Tab */}
        <TabsContent value="airlines" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Partner Airlines
              </CardTitle>
              <CardDescription>Manage airline partnerships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {airlines?.map((airline: any, index: number) => (
                  <Card 
                    key={airline.id} 
                    className="border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 flex items-center justify-center">
                          <Plane className="h-6 w-6 text-sky-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{airline.name}</p>
                          <p className="text-sm text-muted-foreground">{airline.code} • {airline.country}</p>
                        </div>
                        <Badge className={airline.is_active ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                          {airline.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Flight Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Flight Details
            </DialogTitle>
            <DialogDescription>Complete flight information</DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/10 flex items-center justify-center">
                  <Plane className="h-7 w-7 text-sky-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg font-mono">{selectedFlight.flight_number}</p>
                  <p className="text-muted-foreground">{selectedFlight.departure_city} → {selectedFlight.arrival_city}</p>
                </div>
                <Badge className={selectedFlight.is_active ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                  {selectedFlight.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Departure</p>
                  <p className="font-medium">{format(new Date(selectedFlight.departure_time), "MMM d, h:mm a")}</p>
                  <p className="text-sm text-muted-foreground">{selectedFlight.departure_airport}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                  <p className="font-medium">{format(new Date(selectedFlight.arrival_time), "MMM d, h:mm a")}</p>
                  <p className="text-sm text-muted-foreground">{selectedFlight.arrival_airport}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Economy</p>
                  <p className="font-medium text-lg">${Number(selectedFlight.economy_price).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{selectedFlight.economy_seats_available || 0} seats left</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Business</p>
                  <p className="font-medium text-lg">${Number(selectedFlight.business_price || 0).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">{selectedFlight.business_seats_available || 0} seats left</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              if (selectedFlight) {
                updateFlightStatus.mutate({ id: selectedFlight.id, is_active: !selectedFlight.is_active });
                setIsViewDialogOpen(false);
              }
            }}>
              {selectedFlight?.is_active ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFlightManagement;
