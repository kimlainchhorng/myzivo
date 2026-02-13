/**
 * Express Badge — Reusable lightning bolt indicator for express/priority orders.
 * Used across customer tracking, driver views, restaurant dashboard, and dispatch.
 */
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpressBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
  md: "text-xs px-2 py-1 gap-1",
  lg: "text-sm px-2.5 py-1 gap-1",
};

const iconSizes = {
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
};

export function ExpressBadge({ size = "md", className }: ExpressBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
        sizeClasses[size],
        className
      )}
    >
      <Zap className={cn(iconSizes[size], "fill-current")} />
      Express
    </span>
  );
}
