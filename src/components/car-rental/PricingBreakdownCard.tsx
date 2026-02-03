/**
 * Pricing Breakdown Card
 * Shows itemized price calculation for rentals
 */

import { Tag, Percent, Sparkles, Shield, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PricingBreakdown } from "@/hooks/useVehiclePricing";

interface PricingBreakdownCardProps {
  breakdown: PricingBreakdown;
  totalDays: number;
  className?: string;
}

export default function PricingBreakdownCard({
  breakdown,
  totalDays,
  className,
}: PricingBreakdownCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Price Breakdown</span>
          {breakdown.isLongTerm && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
              <Sparkles className="w-3 h-3" />
              Long-term
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Base rate days */}
        {breakdown.baseDays > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ${breakdown.baseRate.toFixed(2)} × {breakdown.baseDays} weekday{breakdown.baseDays !== 1 ? "s" : ""}
            </span>
            <span>${breakdown.baseSubtotal.toFixed(2)}</span>
          </div>
        )}

        {/* Weekend days */}
        {breakdown.weekendDays > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ${breakdown.weekendRate.toFixed(2)} × {breakdown.weekendDays} weekend day{breakdown.weekendDays !== 1 ? "s" : ""}
            </span>
            <span>${breakdown.weekendSubtotal.toFixed(2)}</span>
          </div>
        )}

        {/* Seasonal pricing */}
        {breakdown.seasonalDays > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Seasonal pricing ({breakdown.seasonalDays} days)
            </span>
            <span>${breakdown.seasonalSubtotal.toFixed(2)}</span>
          </div>
        )}

        {/* Discount */}
        {breakdown.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              {breakdown.discountType === "monthly" ? "Monthly" : "Weekly"} discount ({breakdown.discountPercent}%)
            </span>
            <span>-${breakdown.discountAmount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${(breakdown.subtotal - breakdown.discountAmount).toFixed(2)}</span>
        </div>

        {/* Cleaning fee */}
        {breakdown.cleaningFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cleaning fee</span>
            <span>${breakdown.cleaningFee.toFixed(2)}</span>
          </div>
        )}

        {/* Service fee */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Service fee</span>
          <span>${breakdown.serviceFee.toFixed(2)}</span>
        </div>

        <Separator />

        {/* Total before deposit */}
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${breakdown.totalBeforeDeposit.toFixed(2)}</span>
        </div>

        {/* Deposit */}
        {breakdown.depositAmount > 0 && (
          <div className="flex justify-between text-sm bg-muted/50 p-2 rounded-lg">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-3 h-3" />
              Security deposit (refundable)
            </span>
            <span>${breakdown.depositAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Grand total */}
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Due at booking</span>
          <span className="text-primary">${breakdown.grandTotal.toFixed(2)}</span>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          * Security deposit will be released after the rental ends if no damage is reported.
        </p>
      </CardContent>
    </Card>
  );
}
