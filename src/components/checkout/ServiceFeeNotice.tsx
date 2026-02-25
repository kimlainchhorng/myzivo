/**
 * Service Fee Notice Component
 * Displays service fee disclosure per OTA compliance
 */

import { Info, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEE_DISCLOSURE, getBookingServiceFee, formatPrice, type ProductType } from "@/config/pricing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServiceFeeNoticeProps {
  productType: ProductType;
  variant?: "inline" | "card" | "tooltip";
  className?: string;
}

export function ServiceFeeNotice({
  productType,
  variant = "inline",
  className,
}: ServiceFeeNoticeProps) {
  const serviceFee = getBookingServiceFee(productType);
  const hasServiceFee = serviceFee && serviceFee.amount > 0;

  if (variant === "tooltip") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground", className)}>
              <Info className="w-3 h-3" />
              <span>Service fee info</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px]">
            <p className="text-xs">{FEE_DISCLOSURE.main}</p>
            {hasServiceFee && (
              <p className="text-xs mt-1 font-medium">
                Service fee: {formatPrice(serviceFee.amount, serviceFee.currency)}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/20 hover:shadow-sm transition-all duration-200",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Service Fees</p>
            <p className="text-xs text-muted-foreground">{FEE_DISCLOSURE.main}</p>
            {hasServiceFee && (
              <p className="text-xs font-medium mt-2">
                Booking service fee: {formatPrice(serviceFee.amount, serviceFee.currency)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <Info className="w-3 h-3 shrink-0" />
      <span>{FEE_DISCLOSURE.main}</span>
    </div>
  );
}

// Currency conversion notice
interface CurrencyNoticeProps {
  className?: string;
}

export function CurrencyNotice({ className }: CurrencyNoticeProps) {
  return (
    <p className={cn("text-[10px] text-muted-foreground/70", className)}>
      {FEE_DISCLOSURE.currency}
    </p>
  );
}

// Refund policy notice
interface RefundPolicyNoticeProps {
  productType: ProductType;
  className?: string;
}

export function RefundPolicyNotice({ productType, className }: RefundPolicyNoticeProps) {
  const getRefundText = () => {
    switch (productType) {
      case "flights":
        return "Flight refunds follow airline fare rules. Some fares are non-refundable. ZIVO service fees are non-refundable.";
      case "hotels":
        return "Hotel refunds follow the property's cancellation policy. Service fees may be non-refundable.";
      case "cars":
        return "Car rental refunds are subject to the rental company's terms.";
      default:
        return "Refunds are processed according to supplier policies.";
    }
  };

  return (
    <div className={cn("text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl", className)}>
      <p className="font-medium mb-1">Refund Policy</p>
      <p>{getRefundText()}</p>
    </div>
  );
}

export default ServiceFeeNotice;
