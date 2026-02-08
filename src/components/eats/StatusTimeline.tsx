/**
 * Order Status Timeline Component
 * Visual progress indicator for food order status with timestamps
 */
import { Check, Clock, ChefHat, Truck, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
  timestampKey: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "pending", label: "Order Placed", icon: Clock, timestampKey: "placed_at" },
  { key: "confirmed", label: "Confirmed", icon: Check, timestampKey: "accepted_at" },
  { key: "preparing", label: "Preparing", icon: ChefHat, timestampKey: "prepared_at" },
  { key: "out_for_delivery", label: "On the Way", icon: Truck, timestampKey: "picked_up_at" },
  { key: "delivered", label: "Delivered", icon: Package, timestampKey: "delivered_at" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered"];

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
}

function formatTimestamp(timestamp: string | null | undefined): string | null {
  if (!timestamp) return null;
  try {
    return format(new Date(timestamp), "h:mm a");
  } catch {
    return null;
  }
}

export function StatusTimeline({ currentStatus, timestamps, className }: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus as OrderStatus);
  const isCancelled = currentStatus === "cancelled";

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
    
    // Special case: "pending" uses placed_at or created_at
    if (step.key === "pending") {
      return formatTimestamp(timestamps.placed_at || timestamps.created_at);
    }
    
    return formatTimestamp(timestamps[step.timestampKey as keyof OrderTimestamps]);
  };

  return (
    <div className={cn("space-y-1", className)}>
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = currentIndex >= STATUS_ORDER.indexOf(step.key);
        const isCurrent = currentStatus === step.key || 
          (currentStatus === "ready_for_pickup" && step.key === "preparing"); // ready_for_pickup shows preparing as current
        const Icon = step.icon;
        const timestamp = getTimestamp(step);

        return (
          <div key={step.key} className="flex items-start gap-4">
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
              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 my-1",
                    isCompleted ? "bg-orange-500" : "bg-zinc-700"
                  )}
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
        );
      })}
    </div>
  );
}
