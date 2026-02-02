/**
 * Vehicle Availability Page
 * Manage availability calendar for a vehicle
 */

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app/AppLayout";
import { VehicleAvailabilityCalendar } from "@/components/owner/VehicleAvailabilityCalendar";
import { useVehicle } from "@/hooks/useP2PVehicle";

export default function VehicleAvailability() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading } = useVehicle(id);

  if (isLoading) {
    return (
      <AppLayout title="Availability">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!vehicle) {
    return (
      <AppLayout title="Availability">
        <div className="container max-w-3xl py-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The vehicle you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/owner/cars")}>Back to My Vehicles</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Availability">
      <div className="container max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Availability</h1>
            <p className="text-muted-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>

        {/* Vehicle preview */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-20 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {vehicle.images && (vehicle.images as string[]).length > 0 ? (
                <img
                  src={(vehicle.images as string[])[0]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {vehicle.location_city}, {vehicle.location_state} • ${vehicle.daily_rate}/day
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <VehicleAvailabilityCalendar vehicleId={vehicle.id} />

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground mb-2">How it works</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Green dates are available for booking</li>
              <li>Red dates are blocked and cannot be booked</li>
              <li>Select dates and use "Block" or "Unblock" to update</li>
              <li>Past dates cannot be modified</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
