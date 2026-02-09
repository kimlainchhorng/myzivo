/**
 * ETA Countdown Component
 * Shows estimated arrival time with countdown and dynamic recalculation
 * Includes demand-awareness messaging when delivery times may be longer
 * Supports batch position display for grouped deliveries
 */
import { useState, useEffect, useMemo } from "react";
import { Clock, Zap, Flame, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SurgeLevel } from "@/lib/surge";

interface EtaCountdownProps {
  etaDropoff: string | null;
  driverLat?: number | null;
  driverLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  className?: string;
  demandLevel?: SurgeLevel;
  showDemandNote?: boolean;
  /** ETA for this specific stop in a batch (more accurate when batched) */
  batchStopEta?: string | null;
  /** Stop position when order is part of a batch */
  batchPosition?: { current: number; total: number } | null;
}

// Haversine formula for distance calculation
function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.7613; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Average speed in city traffic (miles per minute)
const AVG_SPEED_MILES_PER_MIN = 0.5; // ~30 mph

export function EtaCountdown({
  etaDropoff,
  driverLat,
  driverLng,
  deliveryLat,
  deliveryLng,
  className = "",
  demandLevel,
  showDemandNote = false,
  batchStopEta,
  batchPosition,
}: EtaCountdownProps) {
  const [now, setNow] = useState(Date.now());

  // Update every 30 seconds for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic ETA based on live driver distance
  const dynamicEtaMinutes = useMemo(() => {
    if (
      driverLat != null &&
      driverLng != null &&
      deliveryLat != null &&
      deliveryLng != null
    ) {
      const distance = calculateDistanceMiles(
        driverLat,
        driverLng,
        deliveryLat,
        deliveryLng
      );
      return Math.max(1, Math.ceil(distance / AVG_SPEED_MILES_PER_MIN));
    }
    return null;
  }, [driverLat, driverLng, deliveryLat, deliveryLng]);

  // Calculate time-based ETA from eta_dropoff timestamp
  // Prefer batchStopEta when available (more accurate for grouped orders)
  const timestampEtaMinutes = useMemo(() => {
    const etaSource = batchStopEta || etaDropoff;
    if (!etaSource) return null;
    const dropoffTime = new Date(etaSource).getTime();
    const remaining = Math.max(0, dropoffTime - now);
    return Math.ceil(remaining / 60000);
  }, [etaDropoff, batchStopEta, now]);

  // Use dynamic ETA if available, otherwise fall back to timestamp-based
  const etaMinutes = dynamicEtaMinutes ?? timestampEtaMinutes;

  if (etaMinutes == null) {
    return null;
  }

  const isArrivingSoon = etaMinutes <= 2;
  const isNearby = etaMinutes <= 5;
  const hasDemandBuffer = showDemandNote && demandLevel && demandLevel !== "Low";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isArrivingSoon
                ? "bg-emerald-500/20"
                : isNearby
                ? "bg-amber-500/20"
                : "bg-orange-500/20"
            }`}
          >
            {isArrivingSoon ? (
              <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
            ) : (
              <Clock className="w-6 h-6 text-orange-400" />
            )}
          </div>
          <div>
            <p className="text-sm text-zinc-400">
              {isArrivingSoon ? "Almost there!" : "Arriving in"}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={etaMinutes}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`text-2xl font-bold ${
                  isArrivingSoon
                    ? "text-emerald-400"
                    : isNearby
                    ? "text-amber-400"
                    : "text-white"
                }`}
              >
                {isArrivingSoon ? (
                  "Arriving soon!"
                ) : (
                  <>
                    {etaMinutes} <span className="text-lg font-normal">min</span>
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Live indicator and batch position */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-500">Live</span>
          </div>
          {batchPosition && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Layers className="w-3 h-3" />
              <span>Stop {batchPosition.current} of {batchPosition.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Demand buffer note */}
      {hasDemandBuffer && !isArrivingSoon && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Flame className={`w-3 h-3 ${demandLevel === "High" ? "text-orange-500" : "text-amber-500"}`} />
          <span className={demandLevel === "High" ? "text-orange-400/80" : "text-amber-400/80"}>
            Busy time — ETA includes buffer
          </span>
        </div>
      )}

      {/* Progress bar for visual feedback */}
      {!isArrivingSoon && etaMinutes <= 30 && (
        <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, 100 - etaMinutes * 3)}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
}
