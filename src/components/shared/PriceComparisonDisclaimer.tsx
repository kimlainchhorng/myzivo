/**
 * PriceComparisonDisclaimer Component
 * Transparency notice about price comparison
 */

import { Search, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PriceComparisonDisclaimerProps {
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export function PriceComparisonDisclaimer({
  variant = "default",
  className,
}: PriceComparisonDisclaimerProps) {
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
        We compare prices across hundreds of providers
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-3 h-3" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              Prices may differ by provider due to fees, baggage allowance, 
              or ticket rules. Final price confirmed at checkout.
            </p>
          </TooltipContent>
        </Tooltip>
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <Search className="w-3.5 h-3.5" />
        <span>Comparing prices from 500+ providers</span>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-3 h-3" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              Prices may differ by provider due to fees, baggage, or ticket rules.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200",
      className
    )}>
      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
        <Search className="w-5 h-5 text-sky-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          We compare prices across hundreds of airlines and travel sites
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Prices may differ by provider due to fees, baggage allowance, or ticket rules. 
          Final price and terms confirmed on the booking page.
        </p>
      </div>
    </div>
  );
}
