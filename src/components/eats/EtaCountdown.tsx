/**
 * ETA Countdown Component
 * Shows estimated arrival time with countdown and dynamic recalculation
 * Includes demand-awareness messaging when delivery times may be longer
 * Supports batch position display for grouped deliveries
 * Traffic-aware ETA adjustments based on time of day
 */
import { useState, useEffect, useMemo } from "react";
import { Clock, Zap, Flame, Layers, TrafficCone, Car, Sparkles, MapPin } from "lucide-react";
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
  /** Driver supply factor for ETA adjustment (1.0 = normal, 1.5 = low supply) */
  supplyMultiplier?: number;
  /** Number of nearby drivers */
  nearbyDriverCount?: number;
  /** Whether to show low supply note */
  showLowSupplyNote?: boolean;
  /** Incentive period multiplier for ETA adjustment (0.85 = 15% faster) */
  incentiveMultiplier?: number;
  /** Whether to show incentive boost note */
  showIncentiveNote?: boolean;
  /** Timestamp of last driver location update - triggers immediate recalc */
  lastLocationUpdate?: number;
  /** Whether ETA is based on live location (shows Live indicator more prominently) */
  isLocationBased?: boolean;
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

/**
 * Get traffic multiplier based on time of day
 * Rush hours: 1.4x slower, Late night: 0.8x faster
 */
function getTrafficMultiplier(): { multiplier: number; isRushHour: boolean; isLateNight: boolean } {
  const hour = new Date().getHours();
  
  // Rush hours: 7-9 AM and 4-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    return { multiplier: 1.4, isRushHour: true, isLateNight: false };
  }
  
  // Late night: 10 PM - 6 AM (faster)
  if (hour >= 22 || hour <= 6) {
    return { multiplier: 0.8, isRushHour: false, isLateNight: true };
  }
  
  return { multiplier: 1.0, isRushHour: false, isLateNight: false };
}

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
  supplyMultiplier = 1.0,
  nearbyDriverCount,
  showLowSupplyNote = false,
  incentiveMultiplier = 1.0,
  showIncentiveNote = false,
  lastLocationUpdate,
  isLocationBased = false,
}: EtaCountdownProps) {
  const [now, setNow] = useState(Date.now());

  // Update based on location changes or fallback to 30-second interval
  useEffect(() => {
    // If we have location data, recalculate immediately on location change
    if (lastLocationUpdate) {
      setNow(Date.now());
    }
  }, [lastLocationUpdate, driverLat, driverLng]);

  // Fallback: Update every 30 seconds for countdown when no live location
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get traffic conditions
  const traffic = useMemo(() => getTrafficMultiplier(), []);

  // Calculate dynamic ETA based on live driver distance with traffic, supply, and incentive adjustment
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
      const baseMinutes = distance / AVG_SPEED_MILES_PER_MIN;
      // Apply traffic, supply, and incentive multipliers, cap total at 2.0x
      const combinedMultiplier = Math.min(
        traffic.multiplier * supplyMultiplier * incentiveMultiplier, 
        2.0
      );
      const withFactors = baseMinutes * combinedMultiplier;
      return Math.max(1, Math.ceil(withFactors));
    }
    return null;
  }, [driverLat, driverLng, deliveryLat, deliveryLng, traffic.multiplier, supplyMultiplier, incentiveMultiplier]);

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
  const etaSingleMinutes = dynamicEtaMinutes ?? timestampEtaMinutes;

  // Calculate ETA range
  const etaRange = useMemo(() => {
    if (etaSingleMinutes == null) return null;
    
    const combinedFactor = Math.min(traffic.multiplier * supplyMultiplier, 2.0);
    const minEta = Math.max(1, Math.floor(etaSingleMinutes * 0.85));
    const maxEta = Math.max(minEta + 2, Math.ceil(etaSingleMinutes * combinedFactor * 1.15));
    
    // Cap range spread to be reasonable
    const cappedMax = maxEta - minEta > 20 ? minEta + 20 : maxEta;
    
    return { min: minEta, max: cappedMax };
  }, [etaSingleMinutes, traffic.multiplier, supplyMultiplier]);

  if (etaRange == null) {
    return null;
  }

  const isArrivingSoon = etaRange.max <= 2;
  const isNearby = etaRange.max <= 5;
  const hasDemandBuffer = showDemandNote && demandLevel && demandLevel !== "Low";
  const showTrafficNote = traffic.isRushHour && dynamicEtaMinutes != null && !isArrivingSoon;
  // Show supply note only if no traffic note and supply is low
  const showSupplyNote = showLowSupplyNote && !showTrafficNote && !isArrivingSoon;
  // Show incentive note only if no other notes are showing and incentive is active
  const displayIncentiveNote = showIncentiveNote && !showTrafficNote && !showSupplyNote && !hasDemandBuffer && !isArrivingSoon;

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
                key={`${etaRange.min}-${etaRange.max}`}
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
                    {etaRange.min}–{etaRange.max} <span className="text-lg font-normal">min</span>
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Live ETA badge and batch position */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {isLocationBased && (
              <MapPin className="w-3 h-3 text-emerald-400" />
            )}
            <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">
              Live ETA
            </span>
          </div>
          {batchPosition && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Layers className="w-3 h-3" />
              <span>Stop {batchPosition.current} of {batchPosition.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Traffic adjustment note */}
      {showTrafficNote && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <TrafficCone className="w-3 h-3 text-amber-500" />
          <span className="text-amber-400/80">
            Rush hour — adjusted for traffic
          </span>
        </div>
      )}

      {/* Low supply note */}
      {showSupplyNote && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Car className="w-3 h-3 text-orange-500" />
          <span className="text-orange-400/80">
            Few drivers nearby — ETA adjusted
          </span>
        </div>
      )}

      {/* Incentive boost note */}
      {displayIncentiveNote && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-400/80">
            Peak driver hours — faster delivery
          </span>
        </div>
      )}

      {/* Demand buffer note */}
      {hasDemandBuffer && !isArrivingSoon && !showTrafficNote && !showSupplyNote && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Flame className={`w-3 h-3 ${demandLevel === "High" ? "text-orange-500" : "text-amber-500"}`} />
          <span className={demandLevel === "High" ? "text-orange-400/80" : "text-amber-400/80"}>
            Busy time — ETA includes buffer
          </span>
        </div>
      )}

      {/* ETA explanation message */}
      <p className="text-xs text-zinc-500 mt-3">
        ETA updated based on traffic and demand.
      </p>

      {/* Progress bar for visual feedback */}
      {!isArrivingSoon && etaRange.max <= 30 && (
        <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, 100 - etaRange.max * 3)}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
}
