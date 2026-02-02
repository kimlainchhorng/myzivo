/**
 * Owner Cars Page
 * List of owner's vehicles with management options
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Car, MoreVertical, Pencil, Trash2, Calendar, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AppLayout from "@/components/app/AppLayout";
import { useCarOwnerProfile } from "@/hooks/useCarOwner";
import { useOwnerVehicles, useDeleteVehicle, useUpdateVehicle } from "@/hooks/useP2PVehicle";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  suspended: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
};

export default function OwnerCars() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useCarOwnerProfile();
  const { data: vehicles, isLoading: vehiclesLoading } = useOwnerVehicles();
  const deleteVehicle = useDeleteVehicle();
  const updateVehicle = useUpdateVehicle();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isLoading = profileLoading || vehiclesLoading;

  // Redirect if not a verified owner
  if (!profileLoading && (!profile || profile.status !== "verified")) {
    return (
      <AppLayout title="My Vehicles">
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

  const handleToggleAvailability = async (vehicleId: string, currentlyAvailable: boolean) => {
    await updateVehicle.mutateAsync({
      id: vehicleId,
      is_available: !currentlyAvailable,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteVehicle.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <AppLayout title="My Vehicles">
      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Vehicles</h1>
            <p className="text-muted-foreground">Manage your listed cars</p>
          </div>
          <Button onClick={() => navigate("/owner/cars/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
                {/* Image */}
                <div className="aspect-[4/3] relative bg-muted">
                  {vehicle.images && (vehicle.images as string[]).length > 0 ? (
                    <img
                      src={(vehicle.images as string[])[0]}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <Badge
                    className={cn(
                      "absolute top-2 left-2",
                      statusStyles[vehicle.approval_status as keyof typeof statusStyles]
                    )}
                  >
                    {vehicle.approval_status}
                  </Badge>
                  
                  {/* Available indicator */}
                  {vehicle.approval_status === "approved" && (
                    <Badge
                      variant={vehicle.is_available ? "default" : "secondary"}
                      className="absolute top-2 right-2"
                    >
                      {vehicle.is_available ? "Listed" : "Unlisted"}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.location_city}, {vehicle.location_state}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/owner/cars/${vehicle.id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/owner/cars/${vehicle.id}/availability`)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Availability
                        </DropdownMenuItem>
                        {vehicle.approval_status === "approved" && (
                          <DropdownMenuItem
                            onClick={() => handleToggleAvailability(vehicle.id, vehicle.is_available ?? true)}
                          >
                            {vehicle.is_available ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unlist
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                List
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">${vehicle.daily_rate}</p>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{vehicle.total_trips || 0} trips</p>
                      {vehicle.rating && <p>★ {vehicle.rating.toFixed(1)}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No vehicles yet</h2>
            <p className="text-muted-foreground mb-6">
              Start earning by listing your first car
            </p>
            <Button onClick={() => navigate("/owner/cars/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </Card>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this vehicle and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVehicle.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
