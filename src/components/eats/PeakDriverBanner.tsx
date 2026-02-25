/**
 * PeakDriverBanner — Positive messaging when more drivers are scheduled
 * 
 * Shows during peak periods when driver supply is high due to schedules.
 * Builds customer confidence with "faster delivery" messaging.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeakDriverBannerProps {
  message: string | null;
  peakStartsIn?: number | null;
  orderId?: string;
  className?: string;
  variant?: "compact" | "full";
}

export function PeakDriverBanner({
  message,
  peakStartsIn,
  orderId,
  className,
  variant = "full",
}: PeakDriverBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed this session
  useEffect(() => {
    if (!orderId) return;
    const dismissed = sessionStorage.getItem(`peak-banner-${orderId}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [orderId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (orderId) {
      sessionStorage.setItem(`peak-banner-${orderId}`, "true");
    }
  };

  if (!message || isDismissed) {
    return null;
  }

  const isApproaching = peakStartsIn !== null && peakStartsIn > 0;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-2 text-xs text-emerald-400",
          className
        )}
      >
        <div className="relative">
          <Car className="w-3 h-3" />
          <Sparkles className="w-2 h-2 absolute -top-0.5 -right-0.5" />
        </div>
        <span>{message}</span>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className={cn(
          "rounded-2xl p-4 border backdrop-blur-sm relative overflow-hidden",
          "bg-emerald-500/10 border-emerald-500/30",
          className
        )}
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-200"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <motion.div
            className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              {isApproaching ? (
                <Clock className="w-5 h-5 text-emerald-500" />
              ) : (
                <Car className="w-5 h-5 text-emerald-500" />
              )}
              <Sparkles className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1" />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-emerald-400">
              {isApproaching ? "Faster delivery coming soon" : "Faster delivery times"}
            </p>
            <p className="text-xs mt-1 text-emerald-300/70">
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
