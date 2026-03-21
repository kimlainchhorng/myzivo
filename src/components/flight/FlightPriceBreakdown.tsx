/**
 * Flight Price Breakdown Component
 * Shows: base fare (includes card + booking fees) + state tax = total
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Receipt, Shield, Check, Building2 } from 'lucide-react';
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
    totalPerPassenger, totalAllPassengers, passengers, currency,
  } = pricing;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base fare ({passengers} pax)</span>
          <span>{formatPrice(baseFare * passengers, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxes, Fees & Charges ({(stateTaxRate * 100).toFixed(1)}%)</span>
          <span>{formatPrice(stateTax * passengers, currency)}</span>
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
    <Card className={cn("border-border/40", className)}>
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <h3 className="text-base font-bold">Price details</h3>

        {/* Traveler line */}
        <div className="flex justify-between text-sm font-semibold">
          <span>Traveler {passengers > 1 ? `1–${passengers}` : '1'}: Adult</span>
          <span>{formatPrice(totalAllPassengers, currency)}</span>
        </div>

        {/* Sub-items */}
        <div className="space-y-1.5 pl-0">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Flight</span>
            <span>{formatPrice(baseFare * passengers, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxes, fees, and charges</span>
            <span>{formatPrice(stateTax * passengers, currency)}</span>
          </div>
        </div>

        <Separator />

        {/* Trip total */}
        <div className="flex justify-between items-baseline">
          <span className="text-base font-bold">Trip total</span>
          <span className="text-xl font-bold">{formatPrice(totalAllPassengers, currency)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Rates are shown in {currency}
        </p>
      </CardContent>
    </Card>
  );
}
