/**
 * Saved Address Selector for Checkout
 * Allows selecting a saved address or entering a new one
 */
import { useState } from "react";
import { MapPin, Home, Briefcase, Pin, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLocations, SavedLocation } from "@/hooks/useSavedLocations";

interface SavedAddressSelectorProps {
  selectedAddress: string;
  onSelect: (address: string) => void;
  onAddNew?: () => void;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "home":
      return Home;
    case "work":
      return Briefcase;
    default:
      return Pin;
  }
};

export function SavedAddressSelector({
  selectedAddress,
  onSelect,
  onAddNew,
}: SavedAddressSelectorProps) {
  const { user } = useAuth();
  const { data: locations, isLoading } = useSavedLocations(user?.id);
  const [showManual, setShowManual] = useState(false);

  // Don't render if not logged in
  if (!user) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  // No saved addresses
  if (!locations || locations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Select delivery address
      </p>

      <div className="space-y-2">
        {locations.map((location, index) => {
          const IconComponent = getIconComponent(location.icon);
          const isSelected = selectedAddress === location.address;

          return (
            <motion.button
              key={location.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                onSelect(location.address);
                setShowManual(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{location.label}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {location.address}
                </p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          );
        })}

        {/* Enter Different Address Option */}
        <button
          onClick={() => {
            setShowManual(true);
            onSelect("");
          }}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
            showManual && !selectedAddress
              ? "border-primary bg-primary/5"
              : "border-dashed border-border hover:border-primary/50"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Enter a different address</p>
            <p className="text-sm text-muted-foreground">
              Type your delivery address below
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
