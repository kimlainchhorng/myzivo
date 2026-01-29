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
  Search, Package, Bike, Clock, DollarSign, AlertCircle, TrendingUp,
  MoreHorizontal, Eye, MapPin, Timer, RefreshCw, Filter, Truck,
  ArrowUpRight, ArrowDownRight, CheckCircle, Navigation, Users, Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDeliveryManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch food orders for delivery tracking
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-delivery-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch active drivers for delivery
  const { data: drivers } = useQuery({
    queryKey: ["admin-delivery-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("is_online", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch delivery batches
  const { data: batches } = useQuery({
    queryKey: ["admin-delivery-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_batches")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case "ready_for_pickup":
        return <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">Ready</Badge>;
      case "in_progress":
        return <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20">In Progress</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // Stats
  const activeDeliveries = orders?.filter(o => ["in_progress", "confirmed"].includes(o.status || "")).length || 0;
  const pendingPickups = orders?.filter(o => o.status === "ready_for_pickup").length || 0;
  const completedToday = orders?.filter(o => {
    if (!o.created_at) return false;
    const today = new Date();
    const orderDate = new Date(o.created_at);
    return o.status === "completed" && orderDate.toDateString() === today.toDateString();
  }).length || 0;
  const onlineDrivers = drivers?.length || 0;
  const avgDeliveryTime = 28; // Mock average
  const deliverySuccessRate = 96.5; // Mock rate

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && order.status === statusFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
              <Package className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Delivery Management</h1>
              <p className="text-muted-foreground">Track and manage all deliveries in real-time</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-delivery-orders"] })}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Deliveries", value: activeDeliveries, icon: Bike, color: "text-cyan-500", gradient: "from-cyan-500/20 to-cyan-500/5", change: "Live", trend: "up" },
          { label: "Pending Pickups", value: pendingPickups, icon: Package, color: "text-amber-500", gradient: "from-amber-500/20 to-amber-500/5", change: `${pendingPickups} waiting`, trend: "up" },
          { label: "Completed Today", value: completedToday, icon: CheckCircle, color: "text-green-500", gradient: "from-green-500/20 to-green-500/5", change: "+12%", trend: "up" },
          { label: "Online Drivers", value: onlineDrivers, icon: Users, color: "text-violet-500", gradient: "from-violet-500/20 to-violet-500/5", change: "Active", trend: "up" },
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
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                  <Zap className="h-3 w-3 mr-1" />
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}</p>
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
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Delivery Time</span>
              </div>
              <span className="text-sm font-medium">{avgDeliveryTime} min</span>
            </div>
            <Progress value={(30 - avgDeliveryTime) / 30 * 100 + 50} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Success Rate</span>
              </div>
              <span className="text-sm font-medium">{deliverySuccessRate}%</span>
            </div>
            <Progress value={deliverySuccessRate} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Fleet Utilization</span>
              </div>
              <span className="text-sm font-medium">{onlineDrivers > 0 ? Math.round((activeDeliveries / onlineDrivers) * 100) : 0}%</span>
            </div>
            <Progress value={onlineDrivers > 0 ? (activeDeliveries / onlineDrivers) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "400ms" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="active" className="gap-2">
              <Bike className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-2">
              <Users className="h-4 w-4" />
              Drivers
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
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready_for_pickup">Ready</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="on_the_way">En Route</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
              />
            </div>
          </div>
        </div>

        {/* Active Deliveries Tab */}
        <TabsContent value="active" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Active Deliveries
              </CardTitle>
              <CardDescription>Real-time tracking of ongoing deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Order ID</TableHead>
                      <TableHead className="hidden md:table-cell">Pickup</TableHead>
                      <TableHead className="hidden lg:table-cell">Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Time</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredOrders.filter(o => ["in_progress", "confirmed"].includes(o.status || "")).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Bike className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No active deliveries</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.filter(o => ["in_progress", "confirmed"].includes(o.status || "")).map((order, index) => (
                        <TableRow
                          key={order.id}
                          className="group hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium text-sm">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground max-w-[150px] truncate">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              {order.restaurant_id?.slice(0, 12)}...
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground max-w-[180px] truncate">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              {order.delivery_address || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), "h:mm a")}
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
                                  Track Delivery
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MapPin className="h-4 w-4 mr-2" />
                                  View on Map
                                </DropdownMenuItem>
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

        {/* Pending Tab */}
        <TabsContent value="pending" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Pending Pickups
              </CardTitle>
              <CardDescription>Orders ready for pickup assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Order ID</TableHead>
                      <TableHead className="hidden md:table-cell">Restaurant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Waiting</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredOrders.filter(o => ["pending", "ready_for_pickup"].includes(o.status || "")).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No pending orders</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.filter(o => ["pending", "ready_for_pickup"].includes(o.status || "")).map((order, index) => (
                        <TableRow
                          key={order.id}
                          className="group hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium text-sm">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{order.restaurant_id?.slice(0, 12)}...</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {order.created_at && `${Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000)} min`}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Completed Deliveries
              </CardTitle>
              <CardDescription>Successfully delivered orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Order ID</TableHead>
                      <TableHead className="hidden md:table-cell">Delivered To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Time</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredOrders.filter(o => o.status === "completed").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No completed deliveries</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.filter(o => o.status === "completed").slice(0, 10).map((order, index) => (
                        <TableRow
                          key={order.id}
                          className="group hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-mono font-medium text-sm">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground max-w-[180px] truncate">{order.delivery_address || "N/A"}</TableCell>
                          <TableCell className="font-medium">${Number(order.total_amount).toFixed(0)}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), "h:mm a")}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="mt-0">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Online Delivery Partners
              </CardTitle>
              <CardDescription>Active drivers available for delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers?.slice(0, 9).map((driver: any, index: number) => (
                  <Card 
                    key={driver.id} 
                    className="border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center">
                          <Bike className="h-6 w-6 text-cyan-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{driver.first_name} {driver.last_name}</p>
                          <p className="text-sm text-muted-foreground">{driver.vehicle_type}</p>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Online
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!drivers || drivers.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No drivers online</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDeliveryManagement;
