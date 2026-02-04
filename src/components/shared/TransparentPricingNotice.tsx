/**
 * TransparentPricingNotice - "No hidden fees" messaging component
 */

import { Eye, CheckCircle2, Shield, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransparentPricingNoticeProps {
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function TransparentPricingNotice({
  variant = "inline",
  className,
}: TransparentPricingNoticeProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="text-muted-foreground">
          No hidden fees. What you see is what you pay.
        </span>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-3 py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/30 border-y border-emerald-100 dark:border-emerald-900",
          className
        )}
      >
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          No hidden fees. What you see is what you pay.
        </p>
      </div>
    );
  }

  // Card variant
  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
          <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">Transparent Pricing</h4>
          <p className="text-sm text-muted-foreground mb-3">
            No hidden fees. What you see is what you pay.
          </p>
          <ul className="space-y-1.5">
            {[
              "All taxes and fees included in displayed price",
              "No surprise charges at checkout",
              "Clear breakdown of all costs",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Price breakdown component
interface PriceBreakdownItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
}

interface PriceBreakdownProps {
  items: PriceBreakdownItem[];
  total: number;
  currency?: string;
  className?: string;
}

export function PriceBreakdown({
  items,
  total,
  currency = "USD",
  className,
}: PriceBreakdownProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className={cn(item.isDiscount && "text-emerald-600 dark:text-emerald-400")}>
            {item.isDiscount && "-"}
            {formatPrice(Math.abs(item.amount))}
          </span>
        </div>
      ))}
      <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-lg">{formatPrice(total)}</span>
      </div>
      <TransparentPricingNotice variant="inline" className="mt-3 justify-center" />
    </div>
  );
}

export default TransparentPricingNotice;
