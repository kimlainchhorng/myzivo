/**
 * Payment Type Badge Component
 * Displays prepaid vs pay-at-hotel status
 */

import { CreditCard, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PaymentType } from "@/types/hotels";

interface PaymentTypeBadgeProps {
  paymentType: PaymentType;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function PaymentTypeBadge({ 
  paymentType, 
  className,
  showIcon = true,
  size = "default",
}: PaymentTypeBadgeProps) {
  const isPrepaid = paymentType === "prepaid";
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1",
        isPrepaid
          ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        className
      )}
    >
      {showIcon && (
        isPrepaid 
          ? <CreditCard className={cn("mr-1", size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")} />
          : <Building2 className={cn("mr-1", size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")} />
      )}
      {isPrepaid ? "Pay Now" : "Pay at Hotel"}
    </Badge>
  );
}

interface PaymentOptionsProps {
  hasPayAtHotel: boolean;
  hasPrepaidOnly: boolean;
  className?: string;
}

export function PaymentOptionsIndicator({ 
  hasPayAtHotel, 
  hasPrepaidOnly,
  className,
}: PaymentOptionsProps) {
  if (hasPrepaidOnly) {
    return (
      <span className={cn("text-[10px] text-muted-foreground", className)}>
        Prepaid only
      </span>
    );
  }
  
  if (hasPayAtHotel) {
    return (
      <span className={cn("text-[10px] text-emerald-600 dark:text-emerald-400 font-medium", className)}>
        Pay at hotel available
      </span>
    );
  }
  
  return null;
}
