/**
 * RidesHubPage - Admin rides management with table, filters, and detail drawer
 */

import { useState } from "react";
import { format } from "date-fns";
import { Car, Filter, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRideManagement, Trip } from "@/hooks/useRideManagement";
import { RIDE_STATUSES } from "@/config/adminConfig";
import RideDetailDrawer from "./RideDetailDrawer";

const RidesHubPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRide, setSelectedRide] = useState<Trip | null>(null);

  const { rides, isLoading, refetch } = useRideManagement({
    status: statusFilter,
    dateFrom: null,
    dateTo: null,
    search,
  });

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: "outline",
      accepted: "secondary",
      en_route: "secondary",
      arrived: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status || ""] || "outline"}>
        {status || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Car className="w-6 h-6 text-primary" />
              Rides Management
            </h1>
            <p className="text-muted-foreground text-sm">
              View and manage all rides in real-time
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by pickup or dropoff address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {RIDE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rides Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : rides.length === 0 ? (
              <div className="p-12 text-center">
                <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No rides found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead className="hidden md:table-cell">Dropoff</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead className="hidden lg:table-cell">Driver</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rides.map((ride) => (
                      <TableRow
                        key={ride.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedRide(ride)}
                      >
                        <TableCell>{getStatusBadge(ride.status)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {ride.pickup_address || "N/A"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                          {ride.dropoff_address || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(ride.fare_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {ride.driver?.full_name || (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {format(new Date(ride.created_at), "MMM d, HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{rides.length}</div>
              <p className="text-xs text-muted-foreground">Total Rides</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-amber-500">
                {rides.filter((r) => ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(r.status || "")).length}
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">
                {rides.filter((r) => r.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                ${rides.reduce((sum, r) => sum + (r.fare_amount || 0), 0).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Drawer */}
      <RideDetailDrawer
        ride={selectedRide}
        open={!!selectedRide}
        onClose={() => setSelectedRide(null)}
      />
    </div>
  );
};

export default RidesHubPage;
