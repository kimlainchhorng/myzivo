/**
 * PricingHelper Component
 * Smart pricing suggestions for vehicle owners
 */

import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCategoryPricing, usePriceSuggestionsEnabled, calculateOwnerEarnings } from "@/hooks/useCategoryPricing";
import { useP2PCommissionSettings } from "@/hooks/useP2PCommission";

interface PricingHelperProps {
  category: string;
  currentPrice: number;
  city?: string;
  onSuggestedClick?: (price: number) => void;
}

export function PricingHelper({ category, currentPrice, city, onSuggestedClick }: PricingHelperProps) {
  const { data: pricing, isLoading: pricingLoading } = useCategoryPricing(category, city);
  const { data: commission } = useP2PCommissionSettings();
  const { data: suggestionsEnabled } = usePriceSuggestionsEnabled();

  // Don't show if suggestions are disabled or no category selected
  if (!suggestionsEnabled || !category || pricingLoading) return null;
  if (!pricing) return null;

  // Calculate position on range (0-100%)
  const range = pricing.max_daily_price - pricing.min_daily_price;
  const rawPosition = range > 0 ? ((currentPrice - pricing.min_daily_price) / range) * 100 : 50;
  const position = Math.max(0, Math.min(100, rawPosition));

  // Calculate estimated earnings (3-day trip example)
  const tripDays = 3;
  const commissionPct = commission?.owner_commission_pct || 20;
  const { earnings: ownerEarnings } = calculateOwnerEarnings(currentPrice, tripDays, commissionPct);

  // Determine if price is in range
  const isInRange = currentPrice >= pricing.min_daily_price && currentPrice <= pricing.max_daily_price;
  const isBelowMin = currentPrice < pricing.min_daily_price;
  const isAboveMax = currentPrice > pricing.max_daily_price;

  // Get category display name
  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <span className="font-medium">Pricing Recommendation</span>
        </div>

        {/* Price Range Bar */}
        <div className="space-y-2">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            {/* Gradient bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 rounded-full" />
            {/* Position indicator */}
            <div
              className="absolute w-3 h-3 bg-foreground border-2 border-background rounded-full -top-0.5 transform -translate-x-1/2 shadow-md transition-all duration-200"
              style={{ left: `${position}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${pricing.min_daily_price}/day</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-primary font-medium"
              onClick={() => onSuggestedClick?.(pricing.suggested_daily_price)}
              type="button"
            >
              ${pricing.suggested_daily_price} (suggested)
            </Button>
            <span>${pricing.max_daily_price}/day</span>
          </div>
        </div>

        {/* Warning if out of range */}
        {!isInRange && (
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              {isBelowMin
                ? `Minimum recommended price for ${categoryDisplayName} vehicles is $${pricing.min_daily_price}/day`
                : `Maximum recommended price for ${categoryDisplayName} vehicles is $${pricing.max_daily_price}/day`}
            </AlertDescription>
          </Alert>
        )}

        {/* Earnings Preview */}
        <div className="p-3 rounded-xl bg-background border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Estimated earnings per {tripDays}-day trip:
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              ${ownerEarnings.toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground">
              after {commissionPct}% platform fee
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
