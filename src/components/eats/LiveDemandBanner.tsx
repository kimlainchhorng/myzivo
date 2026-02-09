/**
 * LiveDemandBanner — Pre-order demand awareness for Cart and Checkout pages
 * Shows when surge is active or demand is forecasted, with incentive-aware messaging
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveDemandBannerProps {
  isActive: boolean;
  isForecastedDemand: boolean;
  isIncentivePeriod: boolean;
  className?: string;
}

export function LiveDemandBanner({
  isActive,
  isForecastedDemand,
  isIncentivePeriod,
  className,
}: LiveDemandBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check session dismissal
  const sessionKey = "live-demand-banner-dismissed";
  const wasDismissed = isDismissed || sessionStorage.getItem(sessionKey) === "true";

  if (wasDismissed || (!isActive && !isForecastedDemand)) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(sessionKey, "true");
  };

  const isActiveSurge = isActive;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          "rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden",
          isActiveSurge
            ? "bg-orange-500/10 border-orange-500/30"
            : "bg-amber-500/10 border-amber-500/30",
          className
        )}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <motion.div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              isActiveSurge ? "bg-orange-500/20" : "bg-amber-500/20"
            )}
            animate={isActiveSurge ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {isActiveSurge ? (
              <Flame className="w-5 h-5 text-orange-500" />
            ) : (
              <TrendingUp className="w-5 h-5 text-amber-500" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-bold text-sm",
                isActiveSurge ? "text-orange-400" : "text-amber-400"
              )}
            >
              {isActiveSurge
                ? "High demand right now — delivery times may vary."
                : "Demand is increasing — delivery times may change."}
            </p>
            {isIncentivePeriod && (
              <p
                className={cn(
                  "text-xs mt-1",
                  isActiveSurge ? "text-orange-300/70" : "text-amber-300/70"
                )}
              >
                {isActiveSurge
                  ? "We're bringing additional drivers online."
                  : "We're pre-positioning drivers in your area."}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
