/**
 * GroupedDeliveryBadge — Small badge indicator for batched orders
 */
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupedDeliveryBadgeProps {
  className?: string;
}

export function GroupedDeliveryBadge({ className }: GroupedDeliveryBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-blue-500/10 border border-blue-500/30 text-blue-400",
        "text-[10px] font-medium",
        className
      )}
    >
      <Layers className="w-2.5 h-2.5" />
      <span>Grouped route</span>
    </div>
  );
}
