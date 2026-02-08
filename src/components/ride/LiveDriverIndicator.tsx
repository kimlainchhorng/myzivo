/**
 * LiveDriverIndicator - Shows real-time driver availability and ETA
 * 
 * Displays:
 * - Number of nearby drivers
 * - Closest driver ETA
 * - Pulsing indicator when drivers are available
 */

import { motion } from "framer-motion";
import { Car, Clock, Loader2 } from "lucide-react";
import { useDriverAvailability } from "@/hooks/useLiveDriverTracking";

interface LiveDriverIndicatorProps {
  pickupLocation?: { lat: number; lng: number } | null;
  className?: string;
  variant?: "compact" | "full";
}

export function LiveDriverIndicator({
  pickupLocation,
  className = "",
  variant = "compact",
}: LiveDriverIndicatorProps) {
  const { count, hasDrivers, isLoading, closestETAMinutes } = useDriverAvailability(
    pickupLocation,
    5 // 5 mile radius
  );

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-zinc-500 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Finding drivers...</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {hasDrivers ? (
          <>
            <div className="relative">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <span className="text-xs text-green-600 font-medium">
              {count} driver{count !== 1 ? "s" : ""} nearby
            </span>
            {closestETAMinutes && (
              <span className="text-xs text-zinc-500">
                • {closestETAMinutes} min
              </span>
            )}
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-xs text-amber-600 font-medium">
              No drivers nearby
            </span>
          </>
        )}
      </div>
    );
  }

  // Full variant with more detail
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-zinc-50 ${className}`}>
      <div className="relative">
        {hasDrivers ? (
          <>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </>
        ) : (
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-amber-600" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        {hasDrivers ? (
          <>
            <div className="text-sm font-semibold text-zinc-900">
              {count} driver{count !== 1 ? "s" : ""} available
            </div>
            {closestETAMinutes && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                <span>Closest in {closestETAMinutes} min</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-amber-700">
              No drivers nearby
            </div>
            <div className="text-xs text-zinc-500">
              Try again in a few minutes
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LiveDriverIndicator;
