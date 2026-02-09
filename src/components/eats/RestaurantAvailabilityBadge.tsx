/**
 * Restaurant Availability Badge
 * Unified badge showing Open, Busy, or Unavailable status
 */
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRestaurantAvailability, type AvailabilityStatus } from "@/hooks/useRestaurantAvailability";
import type { Restaurant } from "@/hooks/useEatsOrders";

interface RestaurantAvailabilityBadgeProps {
  restaurant: Restaurant;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<AvailabilityStatus, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  open: {
    icon: Check,
    label: "Open",
    bgClass: "bg-emerald-500/20",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
  },
  busy: {
    icon: Clock,
    label: "Busy",
    bgClass: "bg-amber-500/20",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/30",
  },
  unavailable: {
    icon: AlertCircle,
    label: "Unavailable",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
  },
};

export function RestaurantAvailabilityBadge({ 
  restaurant, 
  size = "md",
  className 
}: RestaurantAvailabilityBadgeProps) {
  const availability = getRestaurantAvailability(restaurant);
  const config = statusConfig[availability.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold",
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      <span>{config.label}</span>
    </div>
  );
}
