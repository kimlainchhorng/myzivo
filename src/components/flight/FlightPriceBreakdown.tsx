/**
 * Flight Price Breakdown Component
 * Clear fare + taxes + fees = total display
 * NO "indicative" or "estimated" language
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Receipt, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FLIGHT_MOR_DISCLAIMERS } from '@/config/flightMoRCompliance';
import { CHECKOUT_PRICE } from '@/config/checkoutCompliance';

interface FlightPriceBreakdownProps {
  baseFare: number;
  taxesFees: number;
  passengers: number;
  currency?: string;
  className?: string;
  showPerPerson?: boolean;
  compact?: boolean;
  showNoHiddenFees?: boolean;
}

function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function FlightPriceBreakdown({
  baseFare,
  taxesFees,
  passengers,
  currency = 'USD',
  className,
  showPerPerson = true,
  compact = false,
  showNoHiddenFees = false,
}: FlightPriceBreakdownProps) {
  const totalPerPerson = baseFare + taxesFees;
  const grandTotal = totalPerPerson * passengers;
  const totalBaseFare = baseFare * passengers;
  const totalTaxesFees = taxesFees * passengers;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base fare ({passengers} pax)</span>
          <span>{formatPrice(totalBaseFare, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes & fees (2.9%)</span>
          <span>{formatPrice(totalTaxesFees, currency)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(grandTotal, currency)}</span>
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
        {showPerPerson && passengers > 1 && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">Per passenger</p>
            <div className="flex justify-between text-sm">
              <span>Base fare</span>
              <span>{formatPrice(baseFare, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes & fees (2.9%)</span>
              <span>{formatPrice(taxesFees, currency)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border/50">
              <span>Subtotal</span>
              <span>{formatPrice(totalPerPerson, currency)}</span>
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
                <span className="text-muted-foreground">Taxes & fees (2.9%)</span>
                <span>{formatPrice(taxesFees, currency)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Base fare × {passengers} passengers
                </span>
                <span>{formatPrice(totalBaseFare, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Taxes & fees (2.9%) × {passengers} passengers
                </span>
                <span>{formatPrice(totalTaxesFees, currency)}</span>
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
            {formatPrice(grandTotal, currency)}
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
            No hidden fees
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
