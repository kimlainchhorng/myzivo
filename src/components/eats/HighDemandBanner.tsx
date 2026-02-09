/**
 * HighDemandBanner — Contextual message when demand is high during order tracking
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SurgeLevel } from "@/lib/surge";

interface HighDemandBannerProps {
  level: SurgeLevel;
  orderId: string;
  isRespondingWithIncentives?: boolean;
  className?: string;
}

export function HighDemandBanner({ level, orderId, isRespondingWithIncentives, className }: HighDemandBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(`demand-banner-${orderId}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [orderId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`demand-banner-${orderId}`, "true");
  };

  // Don't show for Low demand or if dismissed
  if (level === "Low" || isDismissed) {
    return null;
  }

  const isHigh = level === "High";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          "rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden",
          isHigh
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
              isHigh ? "bg-orange-500/20" : "bg-amber-500/20"
            )}
            animate={isHigh ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {isHigh ? (
              <Flame className="w-5 h-5 text-orange-500" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500" />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-bold text-sm",
              isHigh ? "text-orange-400" : "text-amber-400"
            )}>
              {isHigh 
                ? "High demand in your area" 
                : "Busy area right now"}
            </p>
            <p className={cn(
              "text-xs mt-1",
              isHigh ? "text-orange-300/70" : "text-amber-300/70"
            )}>
              {isHigh 
                ? isRespondingWithIncentives
                  ? "Delivery time may be slightly longer. Additional drivers are being notified."
                  : "Delivery time may be slightly longer. We appreciate your patience!"
                : isRespondingWithIncentives
                  ? "We're bringing more drivers online to speed things up."
                  : "Delivery may take a bit longer than usual."}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
