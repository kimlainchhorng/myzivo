/**
 * LowDriverSupplyBanner — Contextual message when few drivers are available
 * 
 * Shows when driver supply is low to set proper customer expectations.
 * Mutually exclusive with HighDemandBanner (only one shows at a time).
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriverSupplyLevel } from "@/hooks/useEatsDeliveryFactors";

interface LowDriverSupplyBannerProps {
  supplyLevel: DriverSupplyLevel;
  driverCount: number;
  orderId: string;
  isIncentiveActive?: boolean;
  className?: string;
}

export function LowDriverSupplyBanner({ 
  supplyLevel, 
  driverCount, 
  orderId, 
  isIncentiveActive,
  className 
}: LowDriverSupplyBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(`supply-banner-${orderId}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [orderId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`supply-banner-${orderId}`, "true");
  };

  // Don't show for high supply or if dismissed
  if (supplyLevel === "high" || isDismissed) {
    return null;
  }

  const isLow = supplyLevel === "low";
  const isCritical = driverCount === 0;

  // Message based on severity
  const getMessage = () => {
    if (isCritical) {
      return {
        title: "No drivers nearby",
        subtitle: isIncentiveActive
          ? "We're actively notifying additional drivers. Hang tight!"
          : "Delivery times are extended. We're actively finding drivers.",
      };
    }
    if (isLow) {
      return {
        title: "High demand — delivery may take longer",
        subtitle: isIncentiveActive
          ? "Additional drivers are being notified to your area."
          : `Only ${driverCount} driver${driverCount === 1 ? "" : "s"} available nearby.`,
      };
    }
    return {
      title: "Busy area",
      subtitle: isIncentiveActive
        ? "We're bringing more drivers online."
        : "Delivery may take a bit longer than usual.",
    };
  };

  const { title, subtitle } = getMessage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          "rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden",
          isCritical
            ? "bg-red-500/10 border-red-500/30"
            : isLow
            ? "bg-orange-500/10 border-orange-500/30"
            : "bg-amber-500/10 border-amber-500/30",
          className
        )}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-200 active:scale-[0.90] touch-manipulation"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <motion.div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              isCritical
                ? "bg-red-500/20"
                : isLow
                ? "bg-orange-500/20"
                : "bg-amber-500/20"
            )}
            animate={isLow ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Car className={cn(
              "w-5 h-5",
              isCritical
                ? "text-red-500"
                : isLow
                ? "text-orange-500"
                : "text-amber-500"
            )} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-bold text-sm",
              isCritical
                ? "text-red-400"
                : isLow
                ? "text-orange-400"
                : "text-amber-400"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-xs mt-1",
              isCritical
                ? "text-red-300/70"
                : isLow
                ? "text-orange-300/70"
                : "text-amber-300/70"
            )}>
              {subtitle}
            </p>
            
            {/* Driver count indicator for non-critical */}
            {!isCritical && (
              <div className="mt-2 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-zinc-500" />
                <span className="text-xs text-zinc-500">
                  {driverCount} driver{driverCount === 1 ? "" : "s"} available
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
