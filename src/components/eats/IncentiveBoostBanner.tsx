/**
 * IncentiveBoostBanner — Positive messaging when driver incentives are active
 * 
 * Shows when driver incentives are attracting more drivers to the platform,
 * indicating faster delivery times. Only displays when supply is good.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncentiveBoostBannerProps {
  orderId?: string;
  className?: string;
  variant?: "compact" | "full";
}

export function IncentiveBoostBanner({ 
  orderId, 
  className,
  variant = "full" 
}: IncentiveBoostBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if already dismissed this session
  useEffect(() => {
    if (!orderId) return;
    const dismissed = sessionStorage.getItem(`incentive-banner-${orderId}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, [orderId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (orderId) {
      sessionStorage.setItem(`incentive-banner-${orderId}`, "true");
    }
  };

  if (isDismissed) {
    return null;
  }

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
        <Sparkles className="w-3 h-3" />
        <span>More drivers online — faster delivery</span>
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
              <Car className="w-5 h-5 text-emerald-500" />
              <Sparkles className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1" />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-emerald-400">
              More drivers online in your area
            </p>
            <p className="text-xs mt-1 text-emerald-300/70">
              — faster delivery times.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
