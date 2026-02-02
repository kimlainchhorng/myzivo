/**
 * Add Vehicle Page
 * Form for owners to add a new vehicle
 */

import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AppLayout from "@/components/app/AppLayout";
import { VehicleForm, VehicleFormData } from "@/components/owner/VehicleForm";
import { useCarOwnerProfile } from "@/hooks/useCarOwner";
import { useCreateVehicle } from "@/hooks/useP2PVehicle";

export default function AddVehicle() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCarOwnerProfile();
  const createVehicle = useCreateVehicle();

  // Redirect if not a verified owner
  if (!profileLoading && (!profile || profile.status !== "verified")) {
    return (
      <AppLayout title="Add Vehicle">
        <div className="container max-w-4xl py-8">
          <Card className="p-8 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Owner Verification Required</h2>
            <p className="text-muted-foreground mb-4">
              You need to be a verified owner to list vehicles.
            </p>
            <Button asChild>
              <Link to="/owner/apply">Apply to Become an Owner</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async (data: VehicleFormData) => {
    const vehicle = await createVehicle.mutateAsync({
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

    if (vehicle) {
      navigate("/owner/cars");
    }
  };

  return (
    <AppLayout title="Add Vehicle">
      <div className="container max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Vehicle</h1>
            <p className="text-muted-foreground">
              List your car for rent. Vehicles require admin approval.
            </p>
          </div>
        </div>

        {/* Form */}
        <VehicleForm
          onSubmit={handleSubmit}
          isLoading={createVehicle.isPending}
          submitLabel="Submit for Approval"
        />
      </div>
    </AppLayout>
  );
}
