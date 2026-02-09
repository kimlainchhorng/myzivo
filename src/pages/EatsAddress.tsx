/**
 * ZIVO Eats — Address Management Page
 * CRUD for delivery addresses using saved_locations table
 */
import { useState } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Star, Trash2, Edit2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useSavedLocations, 
  useAddSavedLocation, 
  useUpdateSavedLocation,
  useDeleteSavedLocation,
  type SavedLocation,
  type SavedLocationInput 
} from "@/hooks/useSavedLocations";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import { useEffect, useState as useReactState } from "react";

const addressIcons = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "other", label: "Other", icon: MapPin },
];

interface AddressFormData {
  label: string;
  address: string;
  notes: string;
  icon: string;
  lat: number;
  lng: number;
}

function EatsAddressContent() {
  const navigate = useNavigate();
  const [userId, setUserId] = useReactState<string | undefined>(undefined);
  const { data: addresses, isLoading } = useSavedLocations(userId);
  const addMutation = useAddSavedLocation();
  const updateMutation = useUpdateSavedLocation();
  const deleteMutation = useDeleteSavedLocation();
  const { setDeliveryAddress, deliveryAddress } = useCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedLocation | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    address: "",
    notes: "",
    icon: "home",
    lat: 0,
    lng: 0,
  });

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const handleOpenModal = (address?: SavedLocation) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        address: address.address,
        notes: "",
        icon: address.icon || "home",
        lat: address.lat || 0,
        lng: address.lng || 0,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: "",
        address: "",
        notes: "",
        icon: "home",
        lat: 0,
        lng: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label.trim() || !formData.address.trim()) return;

    const locationData: SavedLocationInput = {
      label: formData.label.trim(),
      address: formData.address.trim(),
      lat: formData.lat,
      lng: formData.lng,
      icon: formData.icon,
    };

    if (editingAddress) {
      await updateMutation.mutateAsync({
        id: editingAddress.id,
        ...locationData,
      });
    } else {
      await addMutation.mutateAsync(locationData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSelect = (address: SavedLocation) => {
    setDeliveryAddress(address.address);
    navigate(-1);
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead title="Delivery Address — ZIVO Eats" description="Manage your delivery addresses" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Delivery Address</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Add New Address Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleOpenModal()}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-orange-500/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-orange-500" />
          </div>
          <span className="font-medium text-sm">Add new address</span>
        </motion.button>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-zinc-800" />
            ))}
          </div>
        )}

        {/* Addresses List */}
        {!isLoading && addresses && addresses.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {addresses.map((address, index) => {
                const IconComponent = addressIcons.find(a => a.id === address.icon)?.icon || MapPin;
                const isSelected = deliveryAddress === address.address;

                return (
                  <motion.div
                    key={address.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "bg-zinc-900/80 backdrop-blur border rounded-2xl p-4 transition-all",
                      isSelected ? "border-orange-500/50" : "border-white/5"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        isSelected ? "bg-orange-500" : "bg-zinc-800"
                      )}>
                        <IconComponent className={cn("w-5 h-5", isSelected ? "text-white" : "text-zinc-400")} />
                      </div>

                      <button
                        onClick={() => handleSelect(address)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{address.label}</p>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                          {address.address}
                        </p>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(address)}
                          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          disabled={deleteMutation.isPending}
                          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!addresses || addresses.length === 0) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">No saved addresses</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Add your first delivery address to get started
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingAddress ? "Edit Address" : "Add Address"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Icon Selection */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Address Type</Label>
              <div className="flex gap-3">
                {addressIcons.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, icon: item.id })}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      formData.icon === item.id
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-zinc-800/50 border-white/5 hover:border-white/10"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5",
                      formData.icon === item.id ? "text-orange-500" : "text-zinc-400"
                    )} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Label</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. Home, Office, Mom's house"
                className="bg-zinc-800 border-white/10 text-white placeholder-zinc-500 h-12 rounded-xl"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Full Address</Label>
              <AddressAutocomplete
                value={formData.address}
                onSelect={(place) => setFormData({ ...formData, address: place.address, lat: place.lat, lng: place.lng })}
                placeholder="Start typing an address..."
                className="[&_input]:bg-zinc-800 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-zinc-500 [&_input]:h-12 [&_input]:rounded-xl [&_.absolute.z-50]:bg-zinc-900 [&_.absolute.z-50]:border-white/10 [&_.absolute.z-50_button]:text-white [&_.absolute.z-50_button:hover]:bg-zinc-800"
              />
            </div>

            {/* Delivery Notes */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Delivery Notes (optional)</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Gate code, building instructions..."
                className="bg-zinc-800 border-white/10 text-white placeholder-zinc-500 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-12 rounded-xl border-zinc-700 bg-transparent text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.label.trim() || !formData.address.trim() || isSaving}
              className="flex-1 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EatsAddress() {
  return (
    <CartProvider>
      <EatsAddressContent />
    </CartProvider>
  );
}
