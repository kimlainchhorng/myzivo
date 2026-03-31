/**
 * Account Addresses Page
 * Manage saved delivery addresses
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Briefcase, Pin, Plus, Pencil, Trash2, Star, Loader2, Navigation } from "lucide-react";
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
import { useI18n } from "@/hooks/useI18n";
import { useCountry } from "@/hooks/useCountry";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { toast } from "sonner";
import {
  useSavedLocations,
  useAddSavedLocation,
  useUpdateSavedLocation,
  useDeleteSavedLocation,
  SavedLocation,
  SavedLocationInput,
} from "@/hooks/useSavedLocations";

export default function AddressesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const { country } = useCountry();
  const { data: locations, isLoading } = useSavedLocations(user?.id);
  const addLocation = useAddSavedLocation();
  const updateLocation = useUpdateSavedLocation();
  const deleteLocation = useDeleteSavedLocation();
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();

  const ICON_OPTIONS = [
    { value: "home", label: t("address.home"), icon: Home },
    { value: "work", label: t("address.work"), icon: Briefcase },
    { value: "pin", label: t("address.other"), icon: Pin },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

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

  const detectCurrentLocation = useCallback(async () => {
    setIsDetectingGPS(true);
    try {
      const loc = await getCurrentLocation();
      const addr = await reverseGeocode(loc.lat, loc.lng);
      setFormData((prev) => ({
        ...prev,
        address: addr,
        lat: loc.lat,
        lng: loc.lng,
      }));
      toast.success(t("address.gps_detected") || "Location detected");
    } catch {
      toast.error("Could not detect your location");
    } finally {
      setIsDetectingGPS(false);
    }
  }, [getCurrentLocation, reverseGeocode, t]);

  const handleOpenDialog = async (location?: SavedLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        label: location.label,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        icon: location.icon,
      });
      setDialogOpen(true);
    } else {
      setEditingLocation(null);
      setFormData({
        label: "",
        address: "",
        lat: 0,
        lng: 0,
        icon: "home",
      });
      setDialogOpen(true);
      // Auto-detect GPS for new addresses
      setIsDetectingGPS(true);
      try {
        const loc = await getCurrentLocation();
        const addr = await reverseGeocode(loc.lat, loc.lng);
        setFormData((prev) => ({
          ...prev,
          address: addr,
          lat: loc.lat,
          lng: loc.lng,
        }));
      } catch {
        // Silent fail — user can type manually
      } finally {
        setIsDetectingGPS(false);
      }
    }
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

  const countryCode = country === "KH" ? "kh" : "us";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${t("address.title")} — ZIVO`}
        description={t("address.no_saved_desc")}
      />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">{t("address.title")}</h1>
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
          {t("address.add_new")}
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
            <h2 className="text-lg font-bold mb-2">{t("address.no_saved")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("address.no_saved_desc")}
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
                            {t("address.default")}
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
                      {t("address.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(location.id)}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t("address.delete")}
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
              {editingLocation ? t("address.edit_title") : t("address.add_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="label">{t("address.label")} *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder={t("address.label_placeholder")}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>{t("address.address")} *</Label>
              <div className="mt-1.5 space-y-2">
                <AddressAutocomplete
                  value={formData.address}
                  placeholder={isDetectingGPS ? (t("address.detecting_gps") || "Detecting your location...") : t("address.address_placeholder")}
                  country={countryCode}
                  onSelect={(place) => {
                    setFormData((prev) => ({
                      ...prev,
                      address: place.address,
                      lat: place.lat,
                      lng: place.lng,
                    }));
                  }}
                  onClear={() => {
                    setFormData((prev) => ({
                      ...prev,
                      address: "",
                      lat: 0,
                      lng: 0,
                    }));
                  }}
                  disabled={isDetectingGPS}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectCurrentLocation}
                  disabled={isDetectingGPS || isGettingLocation}
                  className="gap-1.5 text-xs"
                >
                  {isDetectingGPS ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  {t("address.use_current") || "Use current location"}
                </Button>
              </div>
            </div>
            <div>
              <Label className="mb-3 block">{t("address.icon")}</Label>
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
              {t("address.cancel")}
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
              {editingLocation ? t("address.save_changes") : t("address.add_address")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("address.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("address.delete_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("address.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLocation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t("address.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
