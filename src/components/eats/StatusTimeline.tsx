/**
 * Order Status Timeline Component
 * Visual progress indicator for food order status with timestamps
 * Uses standardized EatsOrderStatus from orderStatus.ts
 * Includes enhanced driver assignment sub-steps for transparency
 * Shows near_pickup and at_pickup phases
 */
import { Check, Clock, ChefHat, Truck, Package, Search, UserCheck, MapPin, Navigation, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  EatsOrderStatus,
  EatsOrderStatusType,
  EATS_STATUS_ORDER,
  getStatusLabel,
  normalizeStatus,
  getStatusIndex,
} from "@/lib/orderStatus";
import { motion } from "framer-motion";
import type { DispatchPhase } from "@/hooks/useEatsDispatchStatus";

interface StatusStep {
  key: EatsOrderStatusType;
  label: string;
  icon: React.ElementType;
  timestampKey: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: EatsOrderStatus.PLACED, label: getStatusLabel(EatsOrderStatus.PLACED), icon: Clock, timestampKey: "placed_at" },
  { key: EatsOrderStatus.CONFIRMED, label: getStatusLabel(EatsOrderStatus.CONFIRMED), icon: Check, timestampKey: "accepted_at" },
  { key: EatsOrderStatus.PREPARING, label: getStatusLabel(EatsOrderStatus.PREPARING), icon: ChefHat, timestampKey: "prepared_at" },
  { key: EatsOrderStatus.OUT_FOR_DELIVERY, label: getStatusLabel(EatsOrderStatus.OUT_FOR_DELIVERY), icon: Truck, timestampKey: "picked_up_at" },
  { key: EatsOrderStatus.DELIVERED, label: getStatusLabel(EatsOrderStatus.DELIVERED), icon: Package, timestampKey: "delivered_at" },
];

export interface OrderTimestamps {
  placed_at?: string | null;
  created_at?: string | null;
  accepted_at?: string | null;
  prepared_at?: string | null;
  ready_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
}

interface StatusTimelineProps {
  currentStatus: string;
  timestamps?: OrderTimestamps;
  className?: string;
  /** Driver ID if assigned */
  driverId?: string | null;
  /** When the driver was assigned */
  assignedAt?: string | null;
  /** Current dispatch phase for enhanced substep display */
  dispatchPhase?: DispatchPhase;
  /** Prep progress percentage (0-100) for prep substeps */
  prepProgressPercent?: number;
}

function formatTimestamp(timestamp: string | null | undefined): string | null {
  if (!timestamp) return null;
  try {
    return format(new Date(timestamp), "h:mm a");
  } catch {
    return null;
  }
}

export function StatusTimeline({ 
  currentStatus, 
  timestamps, 
  className,
  driverId,
  assignedAt,
  dispatchPhase,
  prepProgressPercent = 0,
}: StatusTimelineProps) {
  // Normalize legacy status values to standard ones
  const normalizedStatus = normalizeStatus(currentStatus);
  const currentIndex = getStatusIndex(normalizedStatus);
  const isCancelled = currentStatus === EatsOrderStatus.CANCELLED || currentStatus === "cancelled";

  // Determine driver substep states based on dispatch phase
  const isSearching = !driverId;
  const isDriverAssigned = !!driverId;
  const isDriverNearPickup = dispatchPhase === "near_pickup";
  const isDriverAtPickup = dispatchPhase === "at_pickup";
  const isEnRoute = normalizedStatus === "out_for_delivery";

  if (isCancelled) {
    return (
      <div className={cn("p-4 rounded-2xl bg-red-500/10 border border-red-500/20", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-lg">✕</span>
          </div>
          <div>
            <p className="font-bold text-red-400">Order Cancelled</p>
            <p className="text-sm text-zinc-400">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  // Get timestamp for a step
  const getTimestamp = (step: StatusStep): string | null => {
    if (!timestamps) return null;
    
    // Special case: "placed" uses placed_at or created_at
    if (step.key === EatsOrderStatus.PLACED) {
      return formatTimestamp(timestamps.placed_at || timestamps.created_at);
    }
    
    return formatTimestamp(timestamps[step.timestampKey as keyof OrderTimestamps]);
  };

  // Determine if we should show the map or demand banner
  const isPreparingOrReady = ["preparing", "ready", "ready_for_pickup", "confirmed"].includes(normalizedStatus);
  const isOutForDelivery = normalizedStatus === "out_for_delivery";
  const showDriverSubsteps = isPreparingOrReady || isOutForDelivery;

  return (
    <div className={cn("space-y-1", className)}>
      {STATUS_STEPS.map((step, index) => {
        const stepIndex = EATS_STATUS_ORDER.indexOf(step.key);
        const isCompleted = currentIndex >= stepIndex;
        const isCurrent = normalizedStatus === step.key || 
          (normalizedStatus === EatsOrderStatus.READY && step.key === EatsOrderStatus.PREPARING);
        const Icon = step.icon;
        const timestamp = getTimestamp(step);

        // Show driver substeps under "Preparing" when appropriate
        const showSubstepsHere = step.key === EatsOrderStatus.PREPARING && showDriverSubsteps;

        return (
          <div key={step.key}>
            <div className="flex items-start gap-4">
              {/* Icon & Line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isCompleted
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-500"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
                  )}
                </div>
                {(index < STATUS_STEPS.length - 1 || showSubstepsHere) && (
                  <div
                    className={cn(
                      "w-0.5 my-1",
                      showSubstepsHere ? "h-auto" : "h-8",
                      isCompleted ? "bg-orange-500" : "bg-zinc-700"
                    )}
                    style={showSubstepsHere ? { height: "auto", minHeight: "8px" } : undefined}
                  />
                )}
              </div>

              {/* Text & Timestamp */}
              <div className="pt-2 flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      isCompleted ? "text-white" : "text-zinc-500"
                    )}
                  >
                    {step.label}
                  </p>
                  {/* Show timestamp for completed steps */}
                  {isCompleted && timestamp && (
                    <span className="text-xs text-zinc-500">{timestamp}</span>
                  )}
                </div>
                {isCurrent && (
                  <p className="text-xs text-orange-400 mt-0.5">In progress...</p>
                )}
              </div>
            </div>

            {/* Driver Assignment Substeps + Prep Progress - shown under Preparing */}
            {showSubstepsHere && (
              <div className="ml-5 pl-4 border-l-2 border-dashed border-zinc-700 space-y-2 py-2">
                {/* Prep Progress Substeps */}
                {normalizedStatus === "preparing" && (
                  <>
                    {/* Starting prep */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        prepProgressPercent >= 30 ? "bg-emerald-500/30" : "bg-orange-500/30"
                      )}>
                        {prepProgressPercent >= 30 ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ChefHat className="w-3 h-3 text-orange-400 animate-pulse" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs",
                        prepProgressPercent >= 30 ? "text-zinc-400" : "text-orange-300"
                      )}>
                        Starting preparation
                      </span>
                    </motion.div>

                    {/* Cooking */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        prepProgressPercent >= 75 ? "bg-emerald-500/30" : 
                          prepProgressPercent >= 30 ? "bg-orange-500/30" : "bg-zinc-700/50"
                      )}>
                        {prepProgressPercent >= 75 ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : prepProgressPercent >= 30 ? (
                          <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                        ) : (
                          <Flame className="w-3 h-3 text-zinc-500" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs",
                        prepProgressPercent >= 75 ? "text-zinc-400" : 
                          prepProgressPercent >= 30 ? "text-orange-300" : "text-zinc-500"
                      )}>
                        Cooking your order
                      </span>
                    </motion.div>

                    {/* Almost ready */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        prepProgressPercent >= 100 ? "bg-emerald-500/30" : 
                          prepProgressPercent >= 75 ? "bg-amber-500/30" : "bg-zinc-700/50"
                      )}>
                        {prepProgressPercent >= 100 ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : prepProgressPercent >= 75 ? (
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-zinc-500" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs",
                        prepProgressPercent >= 100 ? "text-zinc-400" : 
                          prepProgressPercent >= 75 ? "text-amber-300" : "text-zinc-500"
                      )}>
                        Almost ready!
                      </span>
                    </motion.div>
                  </>
                )}

                {/* Searching for driver */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: normalizedStatus === "preparing" ? 0.15 : 0 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      isSearching
                        ? "bg-indigo-500/30"
                        : isDriverAssigned
                        ? "bg-emerald-500/30"
                        : "bg-zinc-700/50"
                    )}
                  >
                    {isDriverAssigned ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Search className={cn("w-3 h-3", isSearching ? "text-indigo-400 animate-pulse" : "text-zinc-500")} />
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={cn(
                      "text-xs",
                      isSearching ? "text-indigo-300" : isDriverAssigned ? "text-zinc-400" : "text-zinc-500"
                    )}>
                      {isSearching ? "Searching for driver..." : "Driver found"}
                    </span>
                  </div>
                </motion.div>

                {/* Driver heading to restaurant */}
                {isDriverAssigned && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        isDriverNearPickup || isDriverAtPickup || isEnRoute
                          ? "bg-emerald-500/30"
                          : "bg-orange-500/30"
                      )}
                    >
                      {isDriverNearPickup || isDriverAtPickup || isEnRoute ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Navigation className="w-3 h-3 text-orange-400 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={cn(
                        "text-xs",
                        isDriverNearPickup || isDriverAtPickup || isEnRoute ? "text-zinc-400" : "text-orange-300"
                      )}>
                        Driver heading to restaurant
                      </span>
                      {assignedAt && (
                        <span className="text-xs text-zinc-500">{formatTimestamp(assignedAt)}</span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Driver arriving at restaurant */}
                {isDriverAssigned && (isDriverNearPickup || isDriverAtPickup || isEnRoute) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        isDriverAtPickup || isEnRoute
                          ? "bg-emerald-500/30"
                          : "bg-blue-500/30"
                      )}
                    >
                      {isDriverAtPickup || isEnRoute ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <MapPin className="w-3 h-3 text-blue-400 animate-pulse" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs",
                      isDriverAtPickup || isEnRoute ? "text-zinc-400" : "text-blue-300"
                    )}>
                      Driver arriving at restaurant
                    </span>
                  </motion.div>
                )}

                {/* Driver at restaurant / waiting */}
                {isDriverAssigned && (isDriverAtPickup || isEnRoute) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        isEnRoute ? "bg-emerald-500/30" : "bg-cyan-500/30"
                      )}
                    >
                      {isEnRoute ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs",
                      isEnRoute ? "text-zinc-400" : "text-cyan-300"
                    )}>
                      {isEnRoute ? "Order picked up" : "Waiting for order"}
                    </span>
                  </motion.div>
                )}

                {/* En route to customer */}
                {isEnRoute && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-orange-500/30">
                      <Truck className="w-3 h-3 text-orange-400 animate-pulse" />
                    </div>
                    <span className="text-xs text-orange-300">Driver en route to you</span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Normal connector line after substeps */}
            {showSubstepsHere && index < STATUS_STEPS.length - 1 && (
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-0.5 h-8 my-1",
                      currentIndex > stepIndex ? "bg-orange-500" : "bg-zinc-700"
                    )}
                  />
                </div>
                <div className="flex-1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
