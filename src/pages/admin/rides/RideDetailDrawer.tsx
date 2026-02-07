/**
 * RideDetailDrawer - Slide-over drawer for ride details and actions
 */

import { useState } from "react";
import { format } from "date-fns";
import { MapPin, User, Phone, Car, Clock, DollarSign, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trip, useOnlineDrivers } from "@/hooks/useRideManagement";
import { useRideManagement } from "@/hooks/useRideManagement";
import { cn } from "@/lib/utils";

interface RideDetailDrawerProps {
  ride: Trip | null;
  open: boolean;
  onClose: () => void;
}

const RideDetailDrawer = ({ ride, open, onClose }: RideDetailDrawerProps) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const { data: onlineDrivers } = useOnlineDrivers();
  const { assignDriver, cancelRide, completeRide, isUpdating } = useRideManagement({
    status: "all",
    dateFrom: null,
    dateTo: null,
    search: "",
  });

  if (!ride) return null;

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    await assignDriver(ride.id, selectedDriverId);
    setSelectedDriverId("");
    onClose();
  };

  const handleCancel = async () => {
    await cancelRide(ride.id);
    onClose();
  };

  const handleComplete = async () => {
    await completeRide(ride.id);
    onClose();
  };

  const getStatusColor = (status: string | null) => {
    const colors: Record<string, string> = {
      requested: "text-amber-500 bg-amber-500/10",
      accepted: "text-blue-500 bg-blue-500/10",
      en_route: "text-blue-500 bg-blue-500/10",
      arrived: "text-purple-500 bg-purple-500/10",
      in_progress: "text-green-500 bg-green-500/10",
      completed: "text-emerald-500 bg-emerald-500/10",
      cancelled: "text-red-500 bg-red-500/10",
    };
    return colors[status || ""] || "text-muted-foreground bg-muted";
  };

  const timelineSteps = [
    { key: "created", label: "Created", time: ride.created_at },
    { key: "accepted", label: "Accepted", time: ride.accepted_at },
    { key: "started", label: "Started", time: ride.started_at },
    { key: "completed", label: "Completed", time: ride.completed_at },
  ];

  const isActive = ["requested", "accepted", "en_route", "arrived", "in_progress"].includes(ride.status || "");
  const canAssign = ride.status === "requested" && !ride.driver_id;
  const canComplete = isActive && ride.driver_id;
  const canCancel = isActive;

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Ride Details
          </SheetTitle>
          <SheetDescription>
            ID: {ride.id.slice(0, 8)}...
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-sm px-3 py-1", getStatusColor(ride.status))}>
              {ride.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
            {ride.payment_status && (
              <Badge variant="outline" className="text-xs">
                Payment: {ride.payment_status}
              </Badge>
            )}
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{ride.pickup_address || "N/A"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="text-sm font-medium">{ride.dropoff_address || "N/A"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          {ride.customer_name && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{ride.customer_name}</span>
              </div>
              {ride.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ride.customer_phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Driver Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Driver</h4>
            {ride.driver ? (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="font-medium">{ride.driver.full_name}</p>
                <p className="text-sm text-muted-foreground">{ride.driver.phone}</p>
                {ride.driver.vehicle_model && (
                  <p className="text-xs text-muted-foreground">
                    {ride.driver.vehicle_model} • {ride.driver.vehicle_plate}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 text-amber-600 rounded-lg p-3 text-sm">
                No driver assigned
              </div>
            )}
          </div>

          {/* Assign Driver Section */}
          {canAssign && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Assign Driver
              </h4>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an online driver" />
                </SelectTrigger>
                <SelectContent>
                  {onlineDrivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.full_name} - {driver.vehicle_model || "No vehicle"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDriverId && (
                <Button onClick={handleAssignDriver} disabled={isUpdating} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Driver
                </Button>
              )}
            </div>
          )}

          <Separator />

          {/* Fare & Trip Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Fare</span>
              </div>
              <p className="text-lg font-bold">${(ride.fare_amount || 0).toFixed(2)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Distance</span>
              </div>
              <p className="text-lg font-bold">{(ride.distance_km || 0).toFixed(1)} km</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
            <div className="space-y-2">
              {timelineSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      step.time ? "bg-green-500" : "bg-muted"
                    )}
                  />
                  <span className={cn("text-sm", step.time ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                  {step.time && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(step.time), "MMM d, HH:mm")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            {canComplete && (
              <Button
                onClick={handleComplete}
                disabled={isUpdating}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Completed
              </Button>
            )}
            {canCancel && (
              <Button
                onClick={handleCancel}
                disabled={isUpdating}
                variant="destructive"
                className={canComplete ? "" : "flex-1"}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RideDetailDrawer;
