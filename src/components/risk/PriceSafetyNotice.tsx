/**
 * Price Safety Notice Component
 * Displays price change disclaimers and staleness warnings
 */

import { AlertCircle, Clock, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRICE_SAFETY_RULES } from "@/config/riskManagement";
import { cn } from "@/lib/utils";

interface PriceSafetyNoticeProps {
  variant?: "disclaimer" | "stale" | "changed" | "inline";
  lastUpdated?: Date;
  priceChanged?: boolean;
  oldPrice?: number;
  newPrice?: number;
  currency?: string;
  className?: string;
}

export function PriceSafetyNotice({
  variant = "disclaimer",
  lastUpdated,
  priceChanged = false,
  oldPrice,
  newPrice,
  currency = "USD",
  className,
}: PriceSafetyNoticeProps) {
  const getMinutesSinceUpdate = () => {
    if (!lastUpdated) return 0;
    return Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
  };

  const minutesSinceUpdate = getMinutesSinceUpdate();
  const isStale = minutesSinceUpdate >= (PRICE_SAFETY_RULES.stalePriceWarning.threshold / 60);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help",
              className
            )}>
              <Info className="w-3 h-3" />
              <span>Price may change</span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            {PRICE_SAFETY_RULES.priceChangeDisclaimer}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "stale" && isStale) {
    const message = PRICE_SAFETY_RULES.stalePriceWarning.message.replace(
      "{minutes}",
      minutesSinceUpdate.toString()
    );

    return (
      <Alert className={cn("border-amber-500/20 bg-amber-500/5", className)}>
        <Clock className="w-4 h-4 text-amber-500" />
        <AlertDescription className="text-sm text-amber-600 ml-2">
          {message}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === "changed" && priceChanged && oldPrice && newPrice) {
    const increased = newPrice > oldPrice;
    const difference = Math.abs(newPrice - oldPrice);
    const percentChange = Math.round((difference / oldPrice) * 100);

    return (
      <Alert
        className={cn(
          increased
            ? "border-red-500/20 bg-red-500/5"
            : "border-emerald-500/20 bg-emerald-500/5",
          className
        )}
      >
        <AlertCircle className={cn(
          "w-4 h-4",
          increased ? "text-red-500" : "text-emerald-500"
        )} />
        <AlertDescription className="ml-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium",
              increased ? "text-red-600" : "text-emerald-600"
            )}>
              Price {increased ? "increased" : "decreased"} by {formatPrice(difference)} ({percentChange}%)
            </span>
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Updated just now
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {increased 
              ? "The price has changed since you started. Review the new total before booking."
              : "Good news! The price dropped since you started searching."}
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Default disclaimer variant
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg",
      "bg-muted/30 border border-border/50",
      className
    )}>
      <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="text-xs text-muted-foreground">
        <p>{PRICE_SAFETY_RULES.priceChangeDisclaimer}</p>
        {lastUpdated && (
          <p className="mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated: {minutesSinceUpdate === 0 ? "just now" : `${minutesSinceUpdate} min ago`}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Price Source Badge
 * Shows where the price comes from
 */
export function PriceSourceBadge({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("text-[10px] gap-1", className)}>
            <span className="opacity-60">via</span>
            {provider}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          Price provided by {provider}. Final price confirmed at checkout.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Live Price Indicator
 * Shows that price is live vs cached
 */
export function LivePriceIndicator({
  isLive,
  className,
}: {
  isLive: boolean;
  className?: string;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs",
      isLive ? "text-emerald-500" : "text-amber-500",
      className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
      )} />
      {isLive ? "Live price" : "Cached price"}
    </span>
  );
}

export default PriceSafetyNotice;
