/**
 * Smart ETA Display Component
 * Shows ETA range with "Live ETA" badge and explanation message
 */
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, MapPin, TrafficCone, Car, Sparkles, Layers } from "lucide-react";
import type { TrafficLevel } from "@/hooks/useSmartEta";
import { cn } from "@/lib/utils";

interface SmartEtaDisplayProps {
  etaMinRange: number;
  etaMaxRange: number;
  isLive: boolean;
  isArrivingSoon?: boolean;
  trafficLevel?: TrafficLevel;
  showExplanation?: boolean;
  isRushHour?: boolean;
  isLowSupply?: boolean;
  isIncentivePeriod?: boolean;
  batchPosition?: { current: number; total: number } | null;
  className?: string;
}

export function SmartEtaDisplay({
  etaMinRange,
  etaMaxRange,
  isLive,
  isArrivingSoon = false,
  trafficLevel = "moderate",
  showExplanation = true,
  isRushHour = false,
  isLowSupply = false,
  isIncentivePeriod = false,
  batchPosition,
  className,
}: SmartEtaDisplayProps) {
  const isNearby = etaMaxRange <= 5;
  const showArrivingSoon = isArrivingSoon || etaMaxRange <= 2;
  
  // Determine background gradient based on urgency
  const bgGradient = showArrivingSoon
    ? "from-emerald-500/10 to-emerald-500/5"
    : isNearby
    ? "from-amber-500/10 to-amber-500/5"
    : "from-orange-500/10 to-amber-500/5";
  
  const borderColor = showArrivingSoon
    ? "border-emerald-500/20"
    : isNearby
    ? "border-amber-500/20"
    : "border-orange-500/20";
  
  const iconBg = showArrivingSoon
    ? "bg-emerald-500/20"
    : isNearby
    ? "bg-amber-500/20"
    : "bg-orange-500/20";
  
  const iconColor = showArrivingSoon
    ? "text-emerald-400"
    : isNearby
    ? "text-amber-400"
    : "text-orange-400";
  
  const textColor = showArrivingSoon
    ? "text-emerald-400"
    : isNearby
    ? "text-amber-400"
    : "text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-r border rounded-2xl p-4",
        bgGradient,
        borderColor,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", iconBg)}>
            {showArrivingSoon ? (
              <Zap className={cn("w-6 h-6 animate-pulse", iconColor)} />
            ) : (
              <Clock className={cn("w-6 h-6", iconColor)} />
            )}
          </div>
          <div>
            <p className="text-sm text-zinc-400">
              {showArrivingSoon ? "Almost there!" : "Arriving in"}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${etaMinRange}-${etaMaxRange}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={cn("text-2xl font-bold", textColor)}
              >
                {showArrivingSoon ? (
                  "Arriving soon!"
                ) : (
                  <>
                    {etaMinRange}–{etaMaxRange}{" "}
                    <span className="text-lg font-normal">min</span>
                  </>
                )}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Live ETA badge and batch position */}
        <div className="flex flex-col items-end gap-1">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">
                Live ETA
              </span>
            </div>
          )}
          {!isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-xs text-zinc-500">Estimated</span>
            </div>
          )}
          {batchPosition && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Layers className="w-3 h-3" />
              <span>Stop {batchPosition.current} of {batchPosition.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contextual notes */}
      {!showArrivingSoon && (
        <>
          {isRushHour && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <TrafficCone className="w-3 h-3 text-amber-500" />
              <span className="text-amber-400/80">
                Rush hour — adjusted for traffic
              </span>
            </div>
          )}

          {isLowSupply && !isRushHour && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Car className="w-3 h-3 text-orange-500" />
              <span className="text-orange-400/80">
                Few drivers nearby — ETA adjusted
              </span>
            </div>
          )}

          {isIncentivePeriod && !isRushHour && !isLowSupply && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-400/80">
                Peak driver hours — faster delivery
              </span>
            </div>
          )}
        </>
      )}

      {/* Explanation message */}
      {showExplanation && !showArrivingSoon && (
        <p className="text-xs text-zinc-500 mt-3">
          ETA updated based on traffic and demand.
        </p>
      )}

      {/* Progress bar for visual feedback */}
      {!showArrivingSoon && etaMaxRange <= 30 && (
        <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, 100 - etaMaxRange * 3)}%` }}
            transition={{ duration: 0.5 }}
            className={cn(
              "h-full rounded-full",
              isNearby
                ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                : "bg-gradient-to-r from-orange-500 to-amber-500"
            )}
          />
        </div>
      )}
    </motion.div>
  );
}
