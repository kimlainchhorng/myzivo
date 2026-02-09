/**
 * DeliveryFeeBreakdownCard
 * Shows granular delivery fee breakdown with demand adjustment messaging.
 */

import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/pricing";
import { SurgeExplainerTooltip } from "@/components/eats/SurgeExplainerTooltip";
import type { EatsDeliveryPricing } from "@/hooks/useEatsDeliveryPricing";

interface DeliveryFeeBreakdownCardProps {
  pricing: EatsDeliveryPricing;
  className?: string;
}

export function DeliveryFeeBreakdownCard({ pricing, className }: DeliveryFeeBreakdownCardProps) {
  return (
    <div className={cn("space-y-2 text-sm", className)}>
      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatCurrency(pricing.subtotal)}</span>
      </div>

      {/* Delivery fee lines */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Base delivery fee</span>
        <span>{formatCurrency(pricing.baseFee)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Distance fee (~{pricing.estimatedMiles} mi)</span>
        <span>{formatCurrency(pricing.distanceFee)}</span>
      </div>

      {/* Demand adjustment - only when surge active */}
      {pricing.surgeActive && (
        <div className="flex justify-between items-center text-orange-400">
          <span className="flex items-center gap-1">
            Demand adjustment
            <SurgeExplainerTooltip />
          </span>
          <span>+{formatCurrency(pricing.demandAdjustment)}</span>
        </div>
      )}

      {/* Service fee */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Service fee</span>
        <span>{formatCurrency(pricing.serviceFee)}</span>
      </div>

      {/* Small order fee */}
      {pricing.smallOrderFee > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            Small order fee
            <Info className="w-3 h-3" />
          </span>
          <span>{formatCurrency(pricing.smallOrderFee)}</span>
        </div>
      )}

      {/* Tax */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Tax</span>
        <span>{formatCurrency(pricing.tax)}</span>
      </div>

      {/* Demand banner */}
      {pricing.surgeActive && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 mt-1">
          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-orange-400">{pricing.surgeLabel}</p>
            <p className="text-xs text-orange-300/70 mt-0.5">Demand is higher than usual in your area.</p>
          </div>
        </div>
      )}

      <hr className="border-border/50" />

      {/* Total */}
      <div className="flex justify-between font-bold text-lg pt-1">
        <span>Total</span>
        <span className="text-eats">{formatCurrency(pricing.orderTotal)}</span>
      </div>
    </div>
  );
}
