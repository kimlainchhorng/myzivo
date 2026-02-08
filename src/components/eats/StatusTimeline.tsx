/**
 * Order Status Timeline Component
 * Visual progress indicator for food order status
 */
import { Check, Clock, ChefHat, Truck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}

const STATUS_STEPS: StatusStep[] = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered"];

interface StatusTimelineProps {
  currentStatus: string;
  className?: string;
}

export function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
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

  return (
    <div className={cn("space-y-1", className)}>
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = currentIndex >= STATUS_ORDER.indexOf(step.key);
        const isCurrent = currentStatus === step.key;
        const Icon = step.icon;

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

            {/* Text */}
            <div className="pt-2">
              <p
                className={cn(
                  "font-semibold text-sm",
                  isCompleted ? "text-white" : "text-zinc-500"
                )}
              >
                {step.label}
              </p>
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
