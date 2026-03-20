/**
 * Flight Price Breakdown Component
 * Shows: base fare, state tax, card processing fee, ZIVO booking fee, total
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Receipt, Shield, Check, CreditCard, Building2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FLIGHT_MOR_DISCLAIMERS } from '@/config/flightMoRCompliance';
import { CHECKOUT_PRICE } from '@/config/checkoutCompliance';
import type { FlightPricingBreakdown } from '@/utils/flightPricing';

interface FlightPriceBreakdownProps {
  pricing: FlightPricingBreakdown;
  className?: string;
  showNoHiddenFees?: boolean;
  compact?: boolean;
}

function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function FlightPriceBreakdown({
  pricing,
  className,
  compact = false,
  showNoHiddenFees = false,
}: FlightPriceBreakdownProps) {
  const {
    baseFare, stateTax, stateTaxRate, stateTaxLabel,
    cardProcessingFee, cardProcessingRate, zivoBookingFee,
    totalPerPassenger, totalAllPassengers, passengers, currency,
  } = pricing;

  const zivoFeeLabel = baseFare < 100 ? "Flat $10" : "5%";

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base fare ({passengers} pax)</span>
          <span>{formatPrice(baseFare * passengers, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax ({(stateTaxRate * 100).toFixed(1)}%)</span>
          <span>{formatPrice(stateTax * passengers, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Card fee (3.5%)</span>
          <span>{formatPrice(cardProcessingFee * passengers, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Booking fee ({zivoFeeLabel})</span>
          <span>{formatPrice(zivoBookingFee * passengers, currency)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(totalAllPassengers, currency)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="w-5 h-5 text-primary" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Per Person Breakdown */}
        {passengers > 1 && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">Per passenger</p>
            <div className="flex justify-between text-sm">
              <span>Base fare</span>
              <span>{formatPrice(baseFare, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {stateTaxLabel} tax ({(stateTaxRate * 100).toFixed(1)}%)
              </span>
              <span>{formatPrice(stateTax, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Card processing ({(cardProcessingRate * 100).toFixed(1)}%)
              </span>
              <span>{formatPrice(cardProcessingFee, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ZIVO booking fee ({zivoFeeLabel})
              </span>
              <span>{formatPrice(zivoBookingFee, currency)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border/50">
              <span>Subtotal</span>
              <span>{formatPrice(totalPerPassenger, currency)}</span>
            </div>
          </div>
        )}

        {/* Total Breakdown */}
        <div className="space-y-2">
          {passengers === 1 ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base fare</span>
                <span>{formatPrice(baseFare, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {stateTaxLabel} tax ({(stateTaxRate * 100).toFixed(1)}%)
                </span>
                <span>{formatPrice(stateTax, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> Card processing ({(cardProcessingRate * 100).toFixed(1)}%)
                </span>
                <span>{formatPrice(cardProcessingFee, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> ZIVO booking fee ({zivoFeeLabel})
                </span>
                <span>{formatPrice(zivoBookingFee, currency)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base fare × {passengers}</span>
                <span>{formatPrice(baseFare * passengers, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {stateTaxLabel} tax ({(stateTaxRate * 100).toFixed(1)}%) × {passengers}
                </span>
                <span>{formatPrice(stateTax * passengers, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Card processing (3.5%) × {passengers}
                </span>
                <span>{formatPrice(cardProcessingFee * passengers, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ZIVO booking fee ({zivoFeeLabel}) × {passengers}
                </span>
                <span>{formatPrice(zivoBookingFee * passengers, currency)}</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Grand Total */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold">Total</span>
            <p className="text-xs text-muted-foreground">
              {passengers} passenger{passengers > 1 ? 's' : ''}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(totalAllPassengers, currency)}
          </span>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-500/30">
            <Check className="w-3 h-3" />
            Final price
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-500/30">
            <Shield className="w-3 h-3" />
            Transparent fees
          </Badge>
        </div>

        {/* No Hidden Fees Message */}
        {showNoHiddenFees && (
          <div className="pt-2 text-center">
            <p className="text-xs text-emerald-600 font-medium">
              {CHECKOUT_PRICE.noHiddenFees}
            </p>
          </div>
        )}

        {/* MoR Disclaimer */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {FLIGHT_MOR_DISCLAIMERS.priceBreakdown}
        </p>
      </CardContent>
    </Card>
  );
}
