/**
 * EatsSurgeBadge — Surge pricing indicator for Eats
 * Shows orange (Medium) or red (High) badge when surge is active
 */

import { motion } from "framer-motion";
import { Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SurgeLevel } from "@/lib/surge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EatsSurgeBadgeProps {
  level: SurgeLevel;
  multiplier: number;
  variant?: "compact" | "banner";
  className?: string;
}

export function EatsSurgeBadge({
  level,
  multiplier,
  variant = "compact",
  className,
}: EatsSurgeBadgeProps) {
  // Don't show for Low demand
  if (level === "Low") {
    return null;
  }

  const isHigh = level === "High";

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold",
          isHigh
            ? "bg-red-500/90 text-white"
            : "bg-orange-500/90 text-white",
          className
        )}
      >
        <Flame className="w-3 h-3" />
        <span>×{multiplier.toFixed(1)}</span>
      </motion.div>
    );
  }

  // Banner variant
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-4 border backdrop-blur-sm",
        isHigh
          ? "bg-red-500/10 border-red-500/30"
          : "bg-orange-500/10 border-orange-500/30",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            isHigh ? "bg-red-500/20" : "bg-orange-500/20"
          )}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flame className={cn("w-5 h-5", isHigh ? "text-red-500" : "text-orange-500")} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-bold",
              isHigh ? "text-red-400" : "text-orange-400"
            )}>
              {isHigh ? "High demand" : "Busy time"} – delivery fees may be higher
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold",
              isHigh ? "bg-red-500 text-white" : "bg-orange-500 text-white"
            )}>
              ×{multiplier.toFixed(1)}
            </span>
          </div>
          <p className={cn(
            "text-xs mt-1 flex items-center gap-1",
            isHigh ? "text-red-300/70" : "text-orange-300/70"
          )}>
            Prices are higher due to busy conditions
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  Prices may be higher due to high demand in your area. This helps ensure faster delivery times.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
