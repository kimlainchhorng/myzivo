/**
 * Admin P2P Vehicles Module
 * Approve and manage P2P vehicle listings
 */

import { useState } from "react";
import { 
  Car, Search, Check, X, Eye, Loader2, 
  Calendar, MapPin, DollarSign, Users, ExternalLink, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdminVehicles, useUpdateVehicleStatus } from "@/hooks/useP2PVehicle";
import { useCreateTestVehicle } from "@/hooks/useAdminP2PTestData";
import type { P2PVehicle } from "@/types/p2p";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  suspended: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
};

interface VehicleWithOwner extends P2PVehicle {
  owner?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  };
}

export default function AdminP2PVehiclesModule() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithOwner | null>(null);

  const { data: vehicles, isLoading } = useAdminVehicles({
    status: statusFilter,
    search: search || undefined,
  });
  const updateStatus = useUpdateVehicleStatus();
  const createTestVehicle = useCreateTestVehicle();

  const stats = {
    total: vehicles?.length || 0,
    pending: vehicles?.filter((v) => v.approval_status === "pending").length || 0,
    approved: vehicles?.filter((v) => v.approval_status === "approved").length || 0,
    suspended: vehicles?.filter((v) => v.approval_status === "suspended").length || 0,
  };

  const handleStatusChange = async (
    vehicleId: string,
    status: "pending" | "approved" | "rejected" | "suspended"
  ) => {
    await updateStatus.mutateAsync({ vehicleId, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">P2P Vehicles</h1>
          <p className="text-muted-foreground">Review and manage vehicle listings</p>
        </div>
        <Button
          onClick={() => createTestVehicle.mutate()}
          disabled={createTestVehicle.isPending}
        >
          {createTestVehicle.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Test Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Suspended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.suspended}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, or VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {vehicle.images && (vehicle.images as string[]).length > 0 ? (
                            <img
                              src={(vehicle.images as string[])[0]}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.vin}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vehicle.owner?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.owner?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {vehicle.location_city}, {vehicle.location_state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">${vehicle.daily_rate}/day</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          statusStyles[vehicle.approval_status as keyof typeof statusStyles]
                        )}
                      >
                        {vehicle.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedVehicle(vehicle as VehicleWithOwner)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {vehicle.approval_status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleStatusChange(vehicle.id, "approved")}
                              disabled={updateStatus.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusChange(vehicle.id, "rejected")}
                              disabled={updateStatus.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vehicles found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Detail Modal */}
      <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
          </DialogHeader>
          
          {selectedVehicle && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                {/* Images */}
                {selectedVehicle.images && (selectedVehicle.images as string[]).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedVehicle.images as string[]).slice(0, 6).map((url, i) => (
                      <div
                        key={i}
                        className={cn(
                          "aspect-[4/3] rounded-lg overflow-hidden bg-muted",
                          i === 0 && "col-span-2 row-span-2"
                        )}
                      >
                        <img
                          src={url}
                          alt={`Vehicle photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Vehicle Info */}
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    {selectedVehicle.trim && ` ${selectedVehicle.trim}`}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="capitalize">{selectedVehicle.category}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedVehicle.transmission}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedVehicle.fuel_type}</span>
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">VIN</p>
                    <p className="font-mono">{selectedVehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License Plate</p>
                    <p className="font-mono">{selectedVehicle.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Color</p>
                    <p>{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mileage</p>
                    <p>{selectedVehicle.mileage?.toLocaleString()} miles</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Seats</p>
                    <p>{selectedVehicle.seats}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Doors</p>
                    <p>{selectedVehicle.doors}</p>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div>
                  <h4 className="font-medium mb-2">Pricing</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Daily</p>
                      <p className="text-lg font-bold">${selectedVehicle.daily_rate}</p>
                    </div>
                    {selectedVehicle.weekly_rate && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Weekly</p>
                        <p className="text-lg font-bold">${selectedVehicle.weekly_rate}</p>
                      </div>
                    )}
                    {selectedVehicle.monthly_rate && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="text-lg font-bold">${selectedVehicle.monthly_rate}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div>
                  <h4 className="font-medium mb-2">Pickup Location</h4>
                  <p className="text-muted-foreground">
                    {selectedVehicle.location_address}<br />
                    {selectedVehicle.location_city}, {selectedVehicle.location_state} {selectedVehicle.location_zip}
                  </p>
                </div>

                <Separator />

                {/* Owner Info */}
                {selectedVehicle.owner && (
                  <div>
                    <h4 className="font-medium mb-2">Owner</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedVehicle.owner.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedVehicle.owner.email} • {selectedVehicle.owner.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Features */}
                {selectedVehicle.features && (selectedVehicle.features as string[]).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedVehicle.features as string[]).map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedVehicle.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedVehicle.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Select
                    value={selectedVehicle.approval_status}
                    onValueChange={(value) =>
                      handleStatusChange(
                        selectedVehicle.id,
                        value as "pending" | "approved" | "rejected" | "suspended"
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
