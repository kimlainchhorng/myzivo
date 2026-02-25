/**
 * SurgeBanner - ZIVO Brand Surge Pricing Banner
 * Coral/Rose gradient with premium styling
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SurgeLevel } from "@/lib/surge";

interface SurgeBannerProps {
  isActive: boolean;
  multiplier: number;
  level: SurgeLevel;
  zoneName?: string;
  className?: string;
}

export function SurgeBanner({
  isActive,
  multiplier,
  level,
  zoneName,
  className,
}: SurgeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if not active, dismissed, or Low demand
  if (!isActive || isDismissed || level === "Low") {
    return null;
  }

  const isHigh = level === "High";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "rounded-xl p-3 mb-3 relative overflow-hidden",
          // ZIVO brand: Coral to rose gradient
          isHigh
            ? "bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200"
            : "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200",
          className
        )}
      >
        {/* Animated background pulse */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-30",
            isHigh ? "bg-rose-100" : "bg-orange-100"
          )}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex items-start gap-3">
          {/* Trend icon with pulse (ZIVO style) */}
          <motion.div
            className={cn(
              "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
              isHigh 
                ? "bg-gradient-to-br from-rose-500 to-pink-600" 
                : "bg-gradient-to-br from-orange-400 to-amber-500"
            )}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isHigh ? "text-rose-800" : "text-orange-800"
                )}
              >
                High demand pricing ×{multiplier.toFixed(1)}
                {zoneName && ` near ${zoneName}`}
              </span>
            </div>
            <p
              className={cn(
                "text-[13px] mt-0.5",
                isHigh ? "text-rose-700" : "text-orange-700"
              )}
            >
              Prices are temporarily higher due to increased demand
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className={cn(
              "flex-shrink-0 p-1.5 rounded-full transition-all duration-150 active:scale-90 touch-manipulation",
              isHigh
                ? "hover:bg-rose-200/50 text-rose-600"
                : "hover:bg-orange-200/50 text-orange-600"
            )}
            aria-label="Dismiss surge notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multiplier badge */}
        <motion.div
          className={cn(
            "absolute top-2 right-10 px-2 py-0.5 rounded-full text-[10px] font-bold",
            isHigh
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
              : "bg-gradient-to-r from-orange-400 to-amber-500 text-white"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        >
          {multiplier.toFixed(1)}×
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
