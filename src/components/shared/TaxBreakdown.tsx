/**
 * TaxBreakdown - VAT/GST/Sales tax display component
 */

import { Info, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaxLineItem {
  label: string;
  amount: number;
  type?: "subtotal" | "tax" | "fee" | "discount" | "total";
  tooltip?: string;
}

interface TaxBreakdownProps {
  items: TaxLineItem[];
  currency?: string;
  locale?: string;
  showTaxInclusive?: boolean;
  taxType?: "VAT" | "GST" | "Sales Tax";
  className?: string;
}

export function TaxBreakdown({
  items,
  currency = "USD",
  locale = "en-US",
  showTaxInclusive = false,
  taxType,
  className,
}: TaxBreakdownProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getItemStyles = (type?: string) => {
    switch (type) {
      case "total":
        return "font-bold text-base pt-2 mt-2 border-t border-border";
      case "discount":
        return "text-emerald-600 dark:text-emerald-400";
      case "tax":
        return "text-muted-foreground";
      case "fee":
        return "text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Price Breakdown</span>
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center justify-between text-sm",
            getItemStyles(item.type)
          )}
        >
          <div className="flex items-center gap-1.5">
            <span>{item.label}</span>
            {item.tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className={item.type === "discount" ? "text-emerald-600" : ""}>
            {item.type === "discount" ? "-" : ""}
            {formatPrice(Math.abs(item.amount))}
          </span>
        </div>
      ))}

      {showTaxInclusive && taxType && (
        <div className="pt-2 mt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Price includes {taxType}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to build tax breakdown items
export function buildTaxBreakdown(params: {
  basePrice: number;
  taxRate: number;
  taxType: "VAT" | "GST" | "Sales Tax";
  isInclusive: boolean;
  fees?: { label: string; amount: number }[];
  discount?: number;
}): TaxLineItem[] {
  const { basePrice, taxRate, taxType, isInclusive, fees = [], discount } = params;
  const items: TaxLineItem[] = [];

  if (isInclusive) {
    // Price includes tax, show as breakdown
    const preTaxAmount = basePrice / (1 + taxRate);
    const taxAmount = basePrice - preTaxAmount;
    
    items.push({
      label: "Base fare",
      amount: preTaxAmount,
    });
    items.push({
      label: `${taxType} (${(taxRate * 100).toFixed(0)}%)`,
      amount: taxAmount,
      type: "tax",
      tooltip: `${taxType} is included in the displayed price`,
    });
  } else {
    // Price excludes tax
    const taxAmount = basePrice * taxRate;
    
    items.push({
      label: "Base fare",
      amount: basePrice,
    });
    if (taxRate > 0) {
      items.push({
        label: `${taxType} (${(taxRate * 100).toFixed(0)}%)`,
        amount: taxAmount,
        type: "tax",
      });
    }
  }

  // Add fees
  fees.forEach((fee) => {
    items.push({
      label: fee.label,
      amount: fee.amount,
      type: "fee",
    });
  });

  // Add discount
  if (discount && discount > 0) {
    items.push({
      label: "Discount",
      amount: discount,
      type: "discount",
    });
  }

  // Calculate total
  const subtotal = items
    .filter((i) => i.type !== "discount")
    .reduce((sum, i) => sum + i.amount, 0);
  const total = subtotal - (discount || 0);

  items.push({
    label: "Total",
    amount: total,
    type: "total",
  });

  return items;
}

export default TaxBreakdown;
