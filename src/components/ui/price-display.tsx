import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ZIVO PRICE DISPLAY
 * Consistent price formatting across all products
 * Always shows "From" prefix for affiliate compliance
 */

export type ServiceType = "flights" | "hotels" | "cars";

const serviceColors = {
  flights: "text-sky-500",
  hotels: "text-amber-500",
  cars: "text-violet-500",
};

interface PriceDisplayProps {
  price: number;
  service?: ServiceType;
  suffix?: string; // e.g., "/night", "/day", "/person"
  showFrom?: boolean;
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: {
    price: "text-lg font-bold",
    label: "text-[10px]",
    suffix: "text-xs",
  },
  default: {
    price: "text-xl sm:text-2xl font-bold",
    label: "text-xs",
    suffix: "text-sm",
  },
  lg: {
    price: "text-2xl sm:text-3xl font-bold",
    label: "text-sm",
    suffix: "text-base",
  },
  xl: {
    price: "text-3xl sm:text-4xl font-bold",
    label: "text-base",
    suffix: "text-lg",
  },
};

export function PriceDisplay({
  price,
  service,
  suffix,
  showFrom = true,
  size = "default",
  className,
}: PriceDisplayProps) {
  const sizes = sizeClasses[size];
  const colorClass = service ? serviceColors[service] : "";

  return (
    <div className={cn("flex flex-col", className)}>
      {showFrom && (
        <span className={cn("text-muted-foreground", sizes.label)}>From</span>
      )}
      <div className="flex items-baseline gap-1">
        <span className={cn(sizes.price, colorClass)}>
          ${price.toLocaleString()}
        </span>
        {suffix && (
          <span className={cn("text-muted-foreground font-normal", sizes.suffix)}>
            {suffix}
          </span>
        )}
        <span className={cn("text-muted-foreground font-normal", sizes.suffix)}>*</span>
      </div>
    </div>
  );
}

// Compact inline version
interface InlinePriceProps {
  price: number;
  service?: ServiceType;
  suffix?: string;
  className?: string;
}

export function InlinePrice({ price, service, suffix, className }: InlinePriceProps) {
  const colorClass = service ? serviceColors[service] : "text-foreground";
  
  return (
    <span className={cn("font-bold", colorClass, className)}>
      From ${price.toLocaleString()}{suffix}*
    </span>
  );
}
