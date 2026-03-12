/**
 * GroceryDeliveryBar - "Deliver to" address picker for grocery pages
 * Shows saved Home/Work addresses with quick-add flow
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Home, Briefcase, Plus, ChevronDown, Check, X, Navigation, Loader2, LocateFixed } from "lucide-react";
import { useDeliveryAddress, type DeliveryAddress } from "@/hooks/useDeliveryAddress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LABEL_ICONS: Record<DeliveryAddress["label"], React.ElementType> = {
  Home,
  Work: Briefcase,
  Other: MapPin,
};

const LABEL_COLORS: Record<DeliveryAddress["label"], string> = {
  Home: "text-primary",
  Work: "text-amber-500",
  Other: "text-muted-foreground",
};

export default function GroceryDeliveryBar() {
  const { addresses, selectedAddress, addAddress, selectAddress, removeAddress } = useDeliveryAddress();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState<DeliveryAddress["label"]>("Home");
  const [newAddress, setNewAddress] = useState("");
  const [newApt, setNewApt] = useState("");

  const handleAdd = () => {
    if (!newAddress.trim()) return;
    addAddress({
      label: newLabel,
      address: newAddress.trim(),
      apt: newApt.trim() || undefined,
      isDefault: addresses.length === 0,
    });
    setNewAddress("");
    setNewApt("");
    setIsAdding(false);
  };

  return (
    <div className="relative">
      {/* Compact bar */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <div className="p-1 rounded-lg bg-primary/10">
          <Navigation className="h-3 w-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Deliver to</p>
          {selectedAddress ? (
            <div className="flex items-center gap-1.5">
              {(() => {
                const Icon = LABEL_ICONS[selectedAddress.label];
                return <Icon className={`h-3 w-3 ${LABEL_COLORS[selectedAddress.label]}`} />;
              })()}
              <p className="text-[12px] font-bold text-foreground truncate">
                {selectedAddress.label}
                <span className="font-normal text-muted-foreground ml-1.5">
                  {selectedAddress.address}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-[12px] font-semibold text-muted-foreground">Add delivery address</p>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/20 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Existing addresses */}
              {addresses.map((addr) => {
                const Icon = LABEL_ICONS[addr.label];
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/20 hover:border-border/40 hover:bg-muted/20"
                    }`}
                    onClick={() => { selectAddress(addr.id); setIsOpen(false); }}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-primary/15" : "bg-muted/30"}`}>
                      <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : LABEL_COLORS[addr.label]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground">{addr.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{addr.address}</p>
                      {addr.apt && <p className="text-[10px] text-muted-foreground/60">Apt {addr.apt}</p>}
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-all"
                    >
                      <X className="h-3 w-3 text-destructive/60" />
                    </button>
                  </motion.div>
                );
              })}

              {/* Quick-add presets if empty */}
              {addresses.length === 0 && !isAdding && (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground text-center py-1">No saved addresses yet</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Home", "Work"] as const).map((label) => {
                      const Icon = LABEL_ICONS[label];
                      return (
                        <motion.button
                          key={label}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setNewLabel(label); setIsAdding(true); }}
                          className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all"
                        >
                          <Icon className={`h-4 w-4 ${LABEL_COLORS[label]}`} />
                          <span className="text-[12px] font-semibold text-foreground">Add {label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add new address button */}
              {!isAdding && addresses.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border border-dashed border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-primary">Add new address</span>
                </motion.button>
              )}

              {/* Add form */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2.5 overflow-hidden"
                  >
                    {/* Label selector */}
                    <div className="flex gap-1.5">
                      {(["Home", "Work", "Other"] as const).map((label) => {
                        const Icon = LABEL_ICONS[label];
                        return (
                          <button
                            key={label}
                            onClick={() => setNewLabel(label)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                              newLabel === label
                                ? "bg-primary/15 text-primary border border-primary/20"
                                : "bg-muted/20 text-muted-foreground border border-border/20 hover:bg-muted/40"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Address input */}
                    <Input
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Street address"
                      className="h-10 rounded-xl text-[12px] bg-muted/10 border-border/20"
                      autoFocus
                    />
                    <Input
                      value={newApt}
                      onChange={(e) => setNewApt(e.target.value)}
                      placeholder="Apt, suite, unit (optional)"
                      className="h-9 rounded-xl text-[12px] bg-muted/10 border-border/20"
                    />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setIsAdding(false); setNewAddress(""); setNewApt(""); }}
                        className="flex-1 rounded-xl text-[11px] h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={!newAddress.trim()}
                        className="flex-1 rounded-xl text-[11px] h-9 font-bold shadow-md shadow-primary/20"
                      >
                        Save Address
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
