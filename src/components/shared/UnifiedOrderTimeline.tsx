/**
 * UnifiedOrderTimeline
 * Shared vertical timeline for rides and food orders.
 * Renders role-aware labels, ETA, delay indicators, and framer-motion transitions.
 */
import { Check, Clock, Car, MapPin, Navigation, ChefHat, Package, Truck, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { ServiceType, ViewerRole, TimelineStep, StepState } from "@/hooks/useUnifiedTimeline";
import { useUnifiedTimeline } from "@/hooks/useUnifiedTimeline";

// Icon mapping per step key
const STEP_ICONS: Record<string, React.ElementType> = {
  // Rides
  requested: Search,
  accepted: Car,
  en_route: Navigation,
  arrived: MapPin,
  in_progress: Car,
  completed: Check,
  // Eats
  placed: Clock,
  confirmed: Check,
  preparing: ChefHat,
  picked_up: Package,
  out_for_delivery: Truck,
  delivered: Package,
};

// State-based styling
const stateStyles: Record<StepState, { dot: string; line: string; text: string }> = {
  completed: {
    dot: "bg-emerald-500 border-emerald-500 text-white",
    line: "bg-emerald-500",
    text: "text-foreground",
  },
  current: {
    dot: "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
    line: "bg-muted",
    text: "text-foreground font-semibold",
  },
  pending: {
    dot: "bg-muted border-border text-muted-foreground",
    line: "bg-muted",
    text: "text-muted-foreground",
  },
  delayed: {
    dot: "bg-amber-500 border-amber-500 text-white ring-4 ring-amber-500/20",
    line: "bg-muted",
    text: "text-amber-500 font-semibold",
  },
};

function formatTs(ts: string | null): string | null {
  if (!ts) return null;
  try {
    return format(new Date(ts), "h:mm a");
  } catch {
    return null;
  }
}

interface UnifiedOrderTimelineProps {
  serviceType: ServiceType;
  viewerRole: ViewerRole;
  tripId?: string;
  orderId?: string;
  currentStatus?: string;
  timestamps?: Record<string, string | null | undefined>;
  etaPickup?: string | null;
  etaDropoff?: string | null;
  className?: string;
}

export function UnifiedOrderTimeline({
  serviceType,
  viewerRole,
  tripId,
  orderId,
  currentStatus,
  timestamps,
  etaPickup,
  etaDropoff,
  className,
}: UnifiedOrderTimelineProps) {
  const { steps, isCancelled, loading } = useUnifiedTimeline({
    serviceType,
    viewerRole,
    tripId,
    orderId,
    currentStatus,
    timestamps,
    etaPickup,
    etaDropoff,
  });

  if (loading) {
    return (
      <div className={cn("space-y-3 animate-pulse", className)}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className={cn("p-4 rounded-2xl bg-destructive/10 border border-destructive/20", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-destructive text-lg">✕</span>
          </div>
          <div>
            <p className="font-bold text-destructive">
              {serviceType === "ride" ? "Trip Cancelled" : "Order Cancelled"}
            </p>
            <p className="text-sm text-muted-foreground">
              {serviceType === "ride" ? "This trip has been cancelled" : "This order has been cancelled"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.key] || Clock;
        const styles = stateStyles[step.state];
        const isLast = index === steps.length - 1;
        const formattedTime = formatTs(step.timestamp);

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className="flex items-start gap-3 relative"
          >
            {/* Vertical connector line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 shrink-0",
                  styles.dot
                )}
              >
                {step.state === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : step.state === "delayed" ? (
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                ) : step.state === "current" ? (
                  <Icon className="w-4 h-4 animate-pulse" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-8 transition-colors duration-300",
                    step.state === "completed" ? styles.line : "bg-muted"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm", styles.text)}>{step.label}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {step.state === "current" && step.etaMinutes && (
                    <span className="text-xs text-primary font-medium">
                      ~{step.etaMinutes} min
                    </span>
                  )}
                  {step.state === "delayed" && (
                    <span className="text-xs text-amber-500 font-medium">Delayed</span>
                  )}
                  {formattedTime && step.state === "completed" && (
                    <span className="text-xs text-muted-foreground">{formattedTime}</span>
                  )}
                </div>
              </div>
              {step.state === "current" && (
                <p className="text-xs text-primary/70 mt-0.5">In progress...</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default UnifiedOrderTimeline;
