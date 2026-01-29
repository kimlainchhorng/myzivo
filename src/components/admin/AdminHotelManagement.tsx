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
  Search, Eye, CheckCircle, XCircle, Building2, Star, DollarSign, AlertCircle,
  Clock, MapPin, Hotel, MoreHorizontal, Edit, Ban, RefreshCw, Calendar,
  ArrowUpRight, ArrowDownRight, Bed, Users, Filter, Phone, Mail, Globe
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type HotelType = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  star_rating: number | null;
  rating: number | null;
  total_bookings: number | null;
  status: string | null;
  created_at: string | null;
  owner_id: string;
};

type HotelBooking = {
  id: string;
  booking_reference: string;
  guest_name: string;
  nights: number;
  total_amount: number;
  status: string | null;
  created_at: string | null;
  check_in_date: string;
  check_out_date: string;
};

const AdminHotelManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hotels");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HotelType[];
    },
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-hotel-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HotelBooking[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "active" | "suspended" | "inactive" }) => {
      const { error } = await supabase
        .from("hotels")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      toast.success("Hotel status updated");
    },
    onError: (error) => toast.error("Failed to update status: " + error.message),
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" | "in_progress" | "ready_for_pickup" | "refunded" }) => {
      const { error } = await supabase
        .from("hotel_bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotel-bookings"] });
      toast.success("Booking status updated");
    },
    onError: (error) => toast.error("Failed to update: " + error.message),
  });

  const filteredHotels = hotels?.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && hotel.status === statusFilter;
  }) || [];

  const filteredBookings = bookings?.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  }) || [];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Confirmed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Completed</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // Stats
  const pendingCount = hotels?.filter((h) => h.status === "pending").length || 0;
  const activeCount = hotels?.filter((h) => h.status === "active").length || 0;
  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;
  const totalNights = bookings?.reduce((sum, b) => sum + b.nights, 0) || 0;
  const avgRating = hotels?.reduce((sum, h) => sum + (h.rating || 0), 0) / (hotels?.length || 1) || 0;

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hotel Management</h1>
            <p className="text-muted-foreground">Error loading data</p>
          </div>
        </div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load hotels</p>
            <p className="text-muted-foreground">{(error as Error).message}</p>
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
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10">
              <Hotel className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hotel Management</h1>
              <p className="text-muted-foreground">Manage hotels, rooms, and bookings</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
              queryClient.invalidateQueries({ queryKey: ["admin-hotel-bookings"] });
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
          { label: "Active Hotels", value: activeCount, icon: Building2, color: "text-green-500", gradient: "from-green-500/20 to-green-500/5", change: "+3", trend: "up" },
          { label: "Pending Approval", value: pendingCount, icon: Clock, color: "text-amber-500", gradient: "from-amber-500/20 to-amber-500/5", change: "2 new", trend: "up" },
          { label: "Total Bookings", value: totalBookings, icon: Bed, color: "text-violet-500", gradient: "from-violet-500/20 to-violet-500/5", change: "+15%", trend: "up" },
          { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-emerald-500", gradient: "from-emerald-500/20 to-emerald-500/5", change: "+22%", trend: "up" },
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
              <p className="text-2xl font-bold mt-3">{isLoading || bookingsLoading ? <Skeleton className="h-8 w-16" /> : stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "320ms" }}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              </div>
            </div>
            <Progress value={avgRating * 20} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Nights Booked</span>
              <span className="text-sm font-medium">{totalNights}</span>
            </div>
            <Progress value={Math.min((totalNights / 100) * 100, 100)} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Confirmation Rate</span>
              <span className="text-sm font-medium">{totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(0) : 0}%</span>
            </div>
            <Progress value={totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "400ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="hotels" className="gap-2">
              <Building2 className="h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Bed className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-2">
              <MapPin className="h-4 w-4" />
              Room Types
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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

        {/* Hotels Tab */}
        <TabsContent value="hotels" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                All Hotels
              </CardTitle>
              <CardDescription>Manage hotel partners and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Hotel</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Stars</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredHotels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No hotels found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHotels.map((hotel, index) => (
                        <TableRow
                          key={hotel.id}
                          className="group hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{hotel.name}</p>
                              <p className="text-sm text-muted-foreground">{hotel.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {hotel.city}, {hotel.country}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(hotel.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex">
                              {[...Array(hotel.star_rating || 0)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {hotel.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span>{Number(hotel.rating).toFixed(1)}</span>
                              </div>
                            ) : <span className="text-muted-foreground">N/A</span>}
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
                                <DropdownMenuItem onClick={() => { setSelectedHotel(hotel); setIsViewDialogOpen(true); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Hotel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {hotel.status === "pending" && (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => updateStatus.mutate({ id: hotel.id, status: "active" })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => updateStatus.mutate({ id: hotel.id, status: "suspended" })}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {hotel.status === "active" && (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => updateStatus.mutate({ id: hotel.id, status: "suspended" })}
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                {hotel.status === "suspended" && (
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => updateStatus.mutate({ id: hotel.id, status: "active" })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Reactivate
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
                <Clock className="h-5 w-5 text-primary" />
                Recent Bookings
              </CardTitle>
              <CardDescription>Manage hotel reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Reference</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead className="hidden md:table-cell">Dates</TableHead>
                      <TableHead>Nights</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Bed className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No bookings found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.slice(0, 15).map((booking, index) => (
                        <TableRow
                          key={booking.id}
                          className="group hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium">{booking.booking_reference}</TableCell>
                          <TableCell>{booking.guest_name}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {booking.check_in_date && format(new Date(booking.check_in_date), "MMM d")} - {booking.check_out_date && format(new Date(booking.check_out_date), "MMM d")}
                            </div>
                          </TableCell>
                          <TableCell>{booking.nights}</TableCell>
                          <TableCell className="font-medium">${Number(booking.total_amount).toFixed(0)}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
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

        {/* Room Types Tab */}
        <TabsContent value="rooms" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Room Type Overview
              </CardTitle>
              <CardDescription>Room categories across all hotels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Standard", "Deluxe", "Suite", "Executive", "Family", "Penthouse"].map((type, index) => (
                  <Card 
                    key={type} 
                    className="border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center">
                          <Bed className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{type} Room</p>
                          <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50) + 10} available</p>
                        </div>
                        <Badge variant="outline" className="text-muted-foreground">
                          ${(100 + index * 50)}/night
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

      {/* View Hotel Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Hotel Details
            </DialogTitle>
            <DialogDescription>Complete hotel information</DialogDescription>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedHotel.name}</p>
                  <div className="flex mt-1">
                    {[...Array(selectedHotel.star_rating || 0)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                {getStatusBadge(selectedHotel.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                  <p className="font-medium text-sm truncate">{selectedHotel.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Phone</p>
                  </div>
                  <p className="font-medium text-sm">{selectedHotel.phone}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Address</p>
                  </div>
                  <p className="font-medium text-sm">{selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{selectedHotel.rating ? Number(selectedHotel.rating).toFixed(1) : "N/A"}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Total Bookings</p>
                  <p className="font-medium text-lg">{selectedHotel.total_bookings || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            {selectedHotel?.status === "pending" && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  updateStatus.mutate({ id: selectedHotel.id, status: "active" });
                  setIsViewDialogOpen(false);
                }}
              >
                Approve Hotel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotelManagement;
