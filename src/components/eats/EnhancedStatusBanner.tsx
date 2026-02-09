/**
 * Enhanced Status Banner Component
 * Phase-aware messaging with real-time ETA display
 * Provides clearer status updates throughout the order lifecycle
 */
import { motion } from "framer-motion";
import { Clock, Search, Navigation, MapPin, Truck, Package, ChefHat, Ban, Zap } from "lucide-react";
import type { DispatchPhase } from "@/hooks/useEatsDispatchStatus";
import { cn } from "@/lib/utils";
// MapPin already imported above

interface EnhancedStatusBannerProps {
  phase: DispatchPhase;
  message: string;
  subMessage: string;
  /** @deprecated Use etaMinRange/etaMaxRange instead */
  etaMinutes?: number | null;
  etaMinRange?: number | null;
  etaMaxRange?: number | null;
  etaLabel?: "to pickup" | "to you";
  isLocationBased?: boolean;
  showEtaExplanation?: boolean;
  isPrepLearned?: boolean;
  className?: string;
}

// Phase-specific styling
const PHASE_STYLES: Record<DispatchPhase, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  animate?: boolean;
}> = {
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    animate: true,
  },
  preparing: {
    icon: ChefHat,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    animate: true,
  },
  searching: {
    icon: Search,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    animate: true,
  },
  assigned: {
    icon: Navigation,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  near_pickup: {
    icon: MapPin,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    animate: true,
  },
  at_pickup: {
    icon: MapPin,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  en_route: {
    icon: Truck,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    animate: true,
  },
  arrived: {
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    animate: true,
  },
  delivered: {
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  cancelled: {
    icon: Ban,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

export function EnhancedStatusBanner({
  phase,
  message,
  subMessage,
  etaMinutes,
  etaMinRange,
  etaMaxRange,
  etaLabel,
  isLocationBased = false,
  showEtaExplanation = false,
  isPrepLearned = false,
  className,
}: EnhancedStatusBannerProps) {
  const style = PHASE_STYLES[phase] || PHASE_STYLES.pending;
  const Icon = style.icon;
  
  // Use range values if provided, otherwise fall back to single value
  const hasRange = etaMinRange != null && etaMaxRange != null;
  const displayMin = hasRange ? etaMinRange : etaMinutes;
  const displayMax = hasRange ? etaMaxRange : etaMinutes;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-2xl border",
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Animated indicator dot */}
        <div className={cn(
          "w-3 h-3 rounded-full",
          style.color.replace("text-", "bg-"),
          style.animate && "animate-pulse"
        )} />
        
        {/* Status content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4 shrink-0", style.color)} />
            <p className={cn("font-bold text-sm truncate", style.color)}>
              {message}
            </p>
          </div>
          {subMessage && (
            <p className="text-xs text-zinc-400 mt-0.5">
              {subMessage}
            </p>
          )}
        </div>
        
        {/* ETA display - Range or Single */}
        {displayMin != null && phase !== "delivered" && phase !== "cancelled" && (
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              {isLocationBased && (
                <MapPin className="w-3 h-3 text-emerald-400" />
              )}
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wide">
                Live ETA
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              {hasRange ? (
                <>
                  {displayMin}–{displayMax}{" "}
                  <span className="text-sm font-normal text-zinc-400">min</span>
                </>
              ) : (
                <>
                  {displayMin}{" "}
                  <span className="text-sm font-normal text-zinc-400">min</span>
                </>
              )}
            </p>
            {etaLabel && (
              <p className="text-xs text-zinc-500">{etaLabel}</p>
            )}
          </div>
        )}
      </div>
      
      {/* ETA explanation message */}
      {showEtaExplanation && displayMin != null && phase !== "delivered" && phase !== "cancelled" && (
        <p className="text-xs text-zinc-500 mt-2">
          {isPrepLearned 
            ? "ETA based on real preparation times."
            : "ETA updated based on traffic and demand."}
        </p>
      )}
      
      {/* Live indicator for location-based updates */}
      {isLocationBased && phase !== "delivered" && phase !== "cancelled" && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-500">Live tracking active</span>
        </div>
      )}
    </motion.div>
  );
}
