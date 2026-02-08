/**
 * MapLocationChip Component
 * 
 * ZIVO Brand floating location label chips for the map.
 * Shows pickup/dropoff addresses with ETA badge.
 */

import { ChevronRight } from "lucide-react";

interface MapLocationChipProps {
  type: "pickup" | "dropoff";
  address: string;
  subtitle?: string;
  eta?: string;
  onClick?: () => void;
}

export default function MapLocationChip({ 
  type, 
  address, 
  subtitle,
  eta,
  onClick 
}: MapLocationChipProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#FFFBF5] rounded-xl shadow-lg border border-emerald-100 px-3 py-2 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
    >
      {/* ETA Badge (only for pickup) - ZIVO emerald gradient */}
      {eta && type === "pickup" && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold leading-none">
          <div>{eta}</div>
          <div className="text-[8px] font-medium text-white/70">MIN</div>
        </div>
      )}
      
      {/* Pin icon for dropoff - ZIVO teal */}
      {type === "dropoff" && (
        <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      {/* Address */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-800 truncate">{address}</div>
        {subtitle && (
          <div className="text-xs text-zinc-500 truncate">{subtitle}</div>
        )}
      </div>

      {/* Arrow - emerald */}
      <ChevronRight className="w-4 h-4 text-emerald-500 flex-shrink-0" />
    </button>
  );
}
