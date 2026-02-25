/**
 * Account Addresses Page
 * Manage saved delivery addresses
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Briefcase, Pin, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSavedLocations,
  useAddSavedLocation,
  useUpdateSavedLocation,
  useDeleteSavedLocation,
  SavedLocation,
  SavedLocationInput,
} from "@/hooks/useSavedLocations";

const ICON_OPTIONS = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "pin", label: "Other", icon: Pin },
];

export default function AddressesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: locations, isLoading } = useSavedLocations(user?.id);
  const addLocation = useAddSavedLocation();
  const updateLocation = useUpdateSavedLocation();
  const deleteLocation = useDeleteSavedLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  const [formData, setFormData] = useState<SavedLocationInput>({
    label: "",
    address: "",
    lat: 0,
    lng: 0,
    icon: "home",
  });

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find((o) => o.value === iconName);
    return option?.icon || Pin;
  };

  const handleOpenDialog = (location?: SavedLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        label: location.label,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        icon: location.icon,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        label: "",
        address: "",
        lat: 0,
        lng: 0,
        icon: "home",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.address) return;

    if (editingLocation) {
      await updateLocation.mutateAsync({
        id: editingLocation.id,
        ...formData,
      });
    } else {
      await addLocation.mutateAsync(formData);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingLocationId) return;
    await deleteLocation.mutateAsync(deletingLocationId);
    setDeleteDialogOpen(false);
    setDeletingLocationId(null);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingLocationId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Saved Addresses — ZIVO"
        description="Manage your saved delivery addresses"
      />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Saved Addresses</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {/* Add New Button */}
        <Button
          onClick={() => handleOpenDialog()}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </Button>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl border bg-card">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!locations || locations.length === 0) && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold mb-2">No saved addresses</h2>
            <p className="text-sm text-muted-foreground">
              Add addresses for faster checkout
            </p>
          </div>
        )}

        {/* Addresses List */}
        {locations && locations.length > 0 && (
          <div className="space-y-3">
            {locations.map((location, index) => {
              const IconComponent = getIconComponent(location.icon);
              const isDefault = index === 0;

              return (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{location.label}</h3>
                        {isDefault && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-500" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {location.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(location)}
                      className="gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(location.id)}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="e.g., Home, Work, Mom's House"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main St, City, State ZIP"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="mb-3 block">Icon</Label>
              <RadioGroup
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData({ ...formData, icon: value })
                }
                className="flex gap-4"
              >
                {ICON_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center">
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.icon === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{option.label}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.label ||
                !formData.address ||
                addLocation.isPending ||
                updateLocation.isPending
              }
            >
              {addLocation.isPending || updateLocation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingLocation ? "Save Changes" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The address will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLocation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
