/**
 * MapLocationChip Component
 * 
 * Floating location label chips for the map (Uber-style).
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
      className="flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
    >
      {/* ETA Badge (only for pickup) */}
      {eta && type === "pickup" && (
        <div className="bg-zinc-900 text-white px-2 py-1 rounded text-[10px] font-bold leading-none">
          <div>{eta}</div>
          <div className="text-[8px] font-medium text-zinc-400">MIN</div>
        </div>
      )}
      
      {/* Pin icon for dropoff */}
      {type === "dropoff" && (
        <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 bg-white rounded-sm" />
        </div>
      )}

      {/* Address */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-900 truncate">{address}</div>
        {subtitle && (
          <div className="text-xs text-zinc-500 truncate">{subtitle}</div>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
    </button>
  );
}
