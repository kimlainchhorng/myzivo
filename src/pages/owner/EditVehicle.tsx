/**
 * Edit Vehicle Page
 * Form for owners to edit an existing vehicle
 */

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app/AppLayout";
import { VehicleForm, VehicleFormData } from "@/components/owner/VehicleForm";
import { useVehicle, useUpdateVehicle } from "@/hooks/useP2PVehicle";

export default function EditVehicle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading } = useVehicle(id);
  const updateVehicle = useUpdateVehicle();

  if (isLoading) {
    return (
      <AppLayout title="Edit Vehicle">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!vehicle) {
    return (
      <AppLayout title="Edit Vehicle">
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

  const handleSubmit = async (data: VehicleFormData) => {
    await updateVehicle.mutateAsync({
      id: vehicle.id,
      make: data.make,
      model: data.model,
      year: data.year,
      trim: data.trim || null,
      color: data.color,
      vin: data.vin,
      license_plate: data.license_plate,
      category: data.category,
      transmission: data.transmission,
      fuel_type: data.fuel_type,
      seats: data.seats,
      doors: data.doors,
      mileage: data.mileage,
      description: data.description,
      daily_rate: data.daily_rate,
      weekly_rate: data.weekly_rate || null,
      monthly_rate: data.monthly_rate || null,
      min_trip_days: data.min_trip_days,
      max_trip_days: data.max_trip_days,
      location_address: data.location_address,
      location_city: data.location_city,
      location_state: data.location_state,
      location_zip: data.location_zip,
      instant_book: data.instant_book,
      images: data.images,
      features: data.features,
    });

    navigate("/owner/cars");
  };

  // Convert vehicle data to form defaults
  const defaultValues: Partial<VehicleFormData> = {
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    trim: vehicle.trim || "",
    color: vehicle.color || "",
    vin: vehicle.vin || "",
    license_plate: vehicle.license_plate || "",
    category: vehicle.category as VehicleFormData["category"],
    transmission: vehicle.transmission as VehicleFormData["transmission"],
    fuel_type: vehicle.fuel_type as VehicleFormData["fuel_type"],
    seats: vehicle.seats || 5,
    doors: vehicle.doors || 4,
    mileage: vehicle.mileage || 0,
    description: vehicle.description || "",
    daily_rate: vehicle.daily_rate,
    weekly_rate: vehicle.weekly_rate || undefined,
    monthly_rate: vehicle.monthly_rate || undefined,
    min_trip_days: vehicle.min_trip_days || 1,
    max_trip_days: vehicle.max_trip_days || 30,
    location_address: vehicle.location_address || "",
    location_city: vehicle.location_city || "",
    location_state: vehicle.location_state || "",
    location_zip: vehicle.location_zip || "",
    instant_book: vehicle.instant_book || false,
    images: (vehicle.images as string[]) || [],
    features: (vehicle.features as string[]) || [],
  };

  return (
    <AppLayout title="Edit Vehicle">
      <div className="container max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Edit {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">
              Update your vehicle details
            </p>
          </div>
        </div>

        {/* Form */}
        <VehicleForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={updateVehicle.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </AppLayout>
  );
}
