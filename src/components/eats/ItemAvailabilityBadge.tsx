/**
 * Item Availability Badge Component
 * Visual indicator for menu item availability status
 */
import { Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemAvailabilityBadgeProps {
  isAvailable: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function ItemAvailabilityBadge({ 
  isAvailable, 
  className,
  size = "md" 
}: ItemAvailabilityBadgeProps) {
  if (isAvailable) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 bg-red-500/90 text-white font-semibold rounded-lg",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      <Ban className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>Out of Stock</span>
    </div>
  );
}
