/**
 * Address Selector Component
 * Displays selected delivery address with change option
 */
import { MapPin, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { SavedLocation } from "@/hooks/useSavedLocations";

interface AddressSelectorProps {
  selectedAddress: SavedLocation | null;
  onSelect?: () => void;
}

export function AddressSelector({ selectedAddress, onSelect }: AddressSelectorProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      navigate("/eats/address");
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className="w-full bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
    >
      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
        <MapPin className="w-5 h-5 text-orange-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">Deliver to</p>
        {selectedAddress ? (
          <>
            <p className="font-bold text-sm text-white truncate">
              {selectedAddress.label}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {selectedAddress.address}
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-500 font-medium">
              Add delivery address
            </span>
          </div>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
    </motion.button>
  );
}
