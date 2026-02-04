/**
 * Admin Jobs Page
 * Unified view of rides and food deliveries
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Utensils, Search, MapPin, Loader2, RefreshCw, User, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  type: "ride" | "delivery";
  customer_name: string;
  driver_name: string | null;
  status: string;
  payout: number;
  pickup_address: string;
  dropoff_address: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-200",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

const AdminJobsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "rides" | "deliveries">("all");

  const { data: rides = [], isLoading: ridesLoading, refetch: refetchRides } = useQuery({
    queryKey: ["admin-jobs-rides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          id,
          status,
          fare,
          pickup_address,
          dropoff_address,
          created_at,
          rider_id,
          driver_id
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((trip: any) => ({
        id: trip.id,
        type: "ride" as const,
        customer_name: "Customer",
        driver_name: trip.driver_id ? "Assigned" : null,
        status: trip.status,
        payout: trip.fare || 0,
        pickup_address: trip.pickup_address || "—",
        dropoff_address: trip.dropoff_address || "—",
        created_at: trip.created_at,
      }));
    },
  });

  const { data: deliveries = [], isLoading: deliveriesLoading, refetch: refetchDeliveries } = useQuery({
    queryKey: ["admin-jobs-deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          delivery_fee,
          delivery_address,
          created_at,
          user_id,
          driver_id,
          restaurant_id
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((order: any) => ({
        id: order.id,
        type: "delivery" as const,
        customer_name: "Customer",
        driver_name: order.driver_id ? "Assigned" : null,
        status: order.status,
        payout: order.delivery_fee || 0,
        pickup_address: "Restaurant",
        dropoff_address: order.delivery_address || "—",
        created_at: order.created_at,
      }));
    },
  });

  const handleRefresh = () => {
    refetchRides();
    refetchDeliveries();
  };

  const isLoading = ridesLoading || deliveriesLoading;

  // Combine and filter jobs
  let allJobs: Job[] = [];
  if (activeTab === "all" || activeTab === "rides") {
    allJobs = [...allJobs, ...rides];
  }
  if (activeTab === "all" || activeTab === "deliveries") {
    allJobs = [...allJobs, ...deliveries];
  }

  // Sort by date
  allJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Apply filters
  const filteredJobs = allJobs.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      job.id.toLowerCase().includes(searchLower) ||
      job.customer_name.toLowerCase().includes(searchLower) ||
      job.pickup_address.toLowerCase().includes(searchLower) ||
      job.dropoff_address.toLowerCase().includes(searchLower)
    );
  });

  // Stats
  const stats = {
    total: allJobs.length,
    active: allJobs.filter((j) => j.status === "in_progress" || j.status === "accepted").length,
    pending: allJobs.filter((j) => j.status === "pending").length,
    completed: allJobs.filter((j) => j.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage rides and deliveries</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <User className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="rides">
            <Car className="mr-2 h-4 w-4" />
            Rides ({rides.length})
          </TabsTrigger>
          <TabsTrigger value="deliveries">
            <Utensils className="mr-2 h-4 w-4" />
            Deliveries ({deliveries.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Queue</CardTitle>
          <CardDescription>{filteredJobs.length} job(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No jobs found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Dropoff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-sm">{job.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {job.type === "ride" ? (
                          <Car className="h-4 w-4 text-green-600" />
                        ) : (
                          <Utensils className="h-4 w-4 text-red-500" />
                        )}
                        <span className="capitalize">{job.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{job.customer_name}</TableCell>
                    <TableCell>
                      {job.driver_name || <span className="text-muted-foreground">Unassigned</span>}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm">
                      {job.pickup_address}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm">
                      {job.dropoff_address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[job.status] || ""}>
                        {job.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${job.payout.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(job.created_at), "MMM d, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobsPage;
