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
  Search, Eye, CheckCircle, XCircle, Car, Star, DollarSign, AlertCircle,
  Clock, Key, MoreHorizontal, Edit, Ban, RefreshCw, Calendar, Filter,
  ArrowUpRight, ArrowDownRight, Fuel, Gauge, MapPin, Users, Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type RentalCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  color: string;
  license_plate: string;
  daily_rate: number;
  is_available: boolean | null;
  status: string | null;
  rating: number | null;
  total_rentals: number | null;
  location_address: string;
  owner_id: string;
  created_at: string | null;
  fuel_type: string | null;
  transmission: string | null;
  seats: number | null;
};

type CarRental = {
  id: string;
  customer_id: string;
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_amount: number;
  status: string | null;
  created_at: string | null;
  total_days: number;
};

const AdminCarRentalManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState<RentalCar | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cars");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: cars, isLoading, error } = useQuery({
    queryKey: ["admin-rental-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RentalCar[];
    },
  });

  const { data: rentals, isLoading: rentalsLoading } = useQuery({
    queryKey: ["admin-car-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_rentals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CarRental[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "active" | "suspended" | "inactive" }) => {
      const { error } = await supabase
        .from("rental_cars")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rental-cars"] });
      toast.success("Car status updated");
    },
    onError: (error) => toast.error("Failed to update status: " + error.message),
  });

  const updateRentalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "confirmed" | "cancelled" | "completed" | "in_progress" | "ready_for_pickup" | "refunded" }) => {
      const { error } = await supabase
        .from("car_rentals")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-car-rentals"] });
      toast.success("Rental status updated");
    },
    onError: (error) => toast.error("Failed to update: " + error.message),
  });

  const filteredCars = cars?.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && car.status === statusFilter;
  }) || [];

  const filteredRentals = rentals?.filter((rental) => {
    if (statusFilter === "all") return true;
    return rental.status === statusFilter;
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
      case "in_progress":
        return <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      economy: "bg-green-500/10 text-green-500 border-green-500/20",
      compact: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      suv: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      luxury: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      electric: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      minivan: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return <Badge className={colors[category] || "bg-gray-500/10 text-gray-500"}>{category}</Badge>;
  };

  // Stats
  const pendingCount = cars?.filter((c) => c.status === "pending").length || 0;
  const activeCount = cars?.filter((c) => c.status === "active").length || 0;
  const availableCars = cars?.filter((c) => c.is_available).length || 0;
  const totalRentals = rentals?.length || 0;
  const activeRentals = rentals?.filter((r) => r.status === "in_progress" || r.status === "confirmed").length || 0;
  const totalRevenue = rentals?.reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;
  const avgDailyRate = cars?.reduce((sum, c) => sum + Number(c.daily_rate), 0) / (cars?.length || 1) || 0;
  const fleetUtilization = cars?.length ? ((cars.length - availableCars) / cars.length) * 100 : 0;

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Car Rental Management</h1>
            <p className="text-muted-foreground">Error loading data</p>
          </div>
        </div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load cars</p>
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
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10">
              <Key className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Car Rental Management</h1>
              <p className="text-muted-foreground">Manage fleet, rentals, and bookings</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-rental-cars"] });
              queryClient.invalidateQueries({ queryKey: ["admin-car-rentals"] });
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
          { label: "Active Fleet", value: activeCount, icon: Car, color: "text-green-500", gradient: "from-green-500/20 to-green-500/5", change: "+4", trend: "up" },
          { label: "Available Now", value: availableCars, icon: Key, color: "text-purple-500", gradient: "from-purple-500/20 to-purple-500/5", change: `${availableCars}/${cars?.length || 0}`, trend: "up" },
          { label: "Active Rentals", value: activeRentals, icon: Clock, color: "text-cyan-500", gradient: "from-cyan-500/20 to-cyan-500/5", change: "+8%", trend: "up" },
          { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-emerald-500", gradient: "from-emerald-500/20 to-emerald-500/5", change: "+25%", trend: "up" },
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
              <p className="text-2xl font-bold mt-3">{isLoading || rentalsLoading ? <Skeleton className="h-8 w-16" /> : stat.value}</p>
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
              <span className="text-sm text-muted-foreground">Fleet Utilization</span>
              <span className="text-sm font-medium">{fleetUtilization.toFixed(0)}%</span>
            </div>
            <Progress value={fleetUtilization} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Daily Rate</span>
              <span className="text-sm font-medium">${avgDailyRate.toFixed(0)}</span>
            </div>
            <Progress value={Math.min((avgDailyRate / 150) * 100, 100)} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pending Approval</span>
              <span className="text-sm font-medium">{pendingCount}</span>
            </div>
            <Progress value={(pendingCount / (cars?.length || 1)) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "400ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="cars" className="gap-2">
              <Car className="h-4 w-4" />
              Fleet
            </TabsTrigger>
            <TabsTrigger value="rentals" className="gap-2">
              <Key className="h-4 w-4" />
              Rentals
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Settings className="h-4 w-4" />
              Categories
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

        {/* Fleet Tab */}
        <TabsContent value="cars" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                All Vehicles
              </CardTitle>
              <CardDescription>Manage rental car fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Daily Rate</TableHead>
                      <TableHead className="hidden lg:table-cell">Rating</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredCars.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No cars found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCars.map((car, index) => (
                        <TableRow
                          key={car.id}
                          className="group hover:bg-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{car.year} {car.make} {car.model}</p>
                              <p className="text-sm text-muted-foreground">{car.license_plate} • {car.color}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{getCategoryBadge(car.category)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(car.status)}
                              {car.is_available && (
                                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">Available</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell font-medium">${Number(car.daily_rate).toFixed(0)}/day</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {car.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>{Number(car.rating).toFixed(1)}</span>
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
                                <DropdownMenuItem onClick={() => { setSelectedCar(car); setIsViewDialogOpen(true); }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Vehicle
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {car.status === "pending" && (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => updateStatus.mutate({ id: car.id, status: "active" })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => updateStatus.mutate({ id: car.id, status: "suspended" })}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {car.status === "active" && (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => updateStatus.mutate({ id: car.id, status: "suspended" })}
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                {car.status === "suspended" && (
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => updateStatus.mutate({ id: car.id, status: "active" })}
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

        {/* Rentals Tab */}
        <TabsContent value="rentals" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Active Rentals
              </CardTitle>
              <CardDescription>Manage car rental bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Rental ID</TableHead>
                      <TableHead className="hidden md:table-cell">Pickup</TableHead>
                      <TableHead className="hidden lg:table-cell">Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentalsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredRentals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No rentals found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRentals.slice(0, 15).map((rental, index) => (
                        <TableRow
                          key={rental.id}
                          className="group hover:bg-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium text-sm">{rental.id.slice(0, 8)}...</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {rental.pickup_date && format(new Date(rental.pickup_date), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{rental.total_days} days</TableCell>
                          <TableCell className="font-medium">${Number(rental.total_amount).toFixed(0)}</TableCell>
                          <TableCell>{getStatusBadge(rental.status)}</TableCell>
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
                                {rental.status === "pending" && (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => updateRentalStatus.mutate({ id: rental.id, status: "confirmed" })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirm
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => updateRentalStatus.mutate({ id: rental.id, status: "cancelled" })}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {rental.status === "confirmed" && (
                                  <DropdownMenuItem 
                                    className="text-cyan-600"
                                    onClick={() => updateRentalStatus.mutate({ id: rental.id, status: "in_progress" })}
                                  >
                                    <Car className="h-4 w-4 mr-2" />
                                    Start Rental
                                  </DropdownMenuItem>
                                )}
                                {rental.status === "in_progress" && (
                                  <DropdownMenuItem 
                                    className="text-blue-600"
                                    onClick={() => updateRentalStatus.mutate({ id: rental.id, status: "completed" })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete
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

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Vehicle Categories
              </CardTitle>
              <CardDescription>Fleet breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Economy", icon: Fuel, count: cars?.filter(c => c.category === "economy").length || 0, avgRate: 45 },
                  { name: "Compact", icon: Car, count: cars?.filter(c => c.category === "compact").length || 0, avgRate: 55 },
                  { name: "SUV", icon: Car, count: cars?.filter(c => c.category === "suv").length || 0, avgRate: 85 },
                  { name: "Luxury", icon: Star, count: cars?.filter(c => c.category === "luxury").length || 0, avgRate: 150 },
                  { name: "Electric", icon: Gauge, count: cars?.filter(c => c.category === "electric").length || 0, avgRate: 95 },
                  { name: "Minivan", icon: Users, count: cars?.filter(c => c.category === "minivan").length || 0, avgRate: 75 },
                ].map((cat, index) => (
                  <Card 
                    key={cat.name} 
                    className="border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                          <cat.icon className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{cat.name}</p>
                          <p className="text-sm text-muted-foreground">{cat.count} vehicles</p>
                        </div>
                        <Badge variant="outline" className="text-muted-foreground">
                          ${cat.avgRate}/day
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

      {/* View Car Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Vehicle Details
            </DialogTitle>
            <DialogDescription>Complete vehicle information</DialogDescription>
          </DialogHeader>
          {selectedCar && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                  <Car className="h-7 w-7 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedCar.year} {selectedCar.make} {selectedCar.model}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryBadge(selectedCar.category)}
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{selectedCar.color}</span>
                  </div>
                </div>
                {getStatusBadge(selectedCar.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">License Plate</p>
                  <p className="font-medium font-mono">{selectedCar.license_plate}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                  <p className="font-medium text-lg">${Number(selectedCar.daily_rate).toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{selectedCar.rating ? Number(selectedCar.rating).toFixed(1) : "N/A"}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Total Rentals</p>
                  <p className="font-medium text-lg">{selectedCar.total_rentals || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Location</p>
                  </div>
                  <p className="font-medium text-sm">{selectedCar.location_address}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            {selectedCar?.status === "pending" && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  updateStatus.mutate({ id: selectedCar.id, status: "active" });
                  setIsViewDialogOpen(false);
                }}
              >
                Approve Vehicle
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCarRentalManagement;
