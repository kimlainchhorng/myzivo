/**
 * Ride Price Breakdown with Promo Support
 * Shows fare breakdown with discount line when promo is applied
 */

import { Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import { ValidatedRidePromo } from '@/hooks/useRidePromoValidation';
import { cn } from '@/lib/utils';

interface RidePriceBreakdownWithPromoProps {
  quote: {
    baseFare: number;
    distanceFee: number;
    timeFee: number;
    bookingFee: number;
    subtotal: number;
    total: number;
    minimumApplied: boolean;
    multiplier: number;
    estimatedMin: number;
    estimatedMax: number;
  };
  appliedPromo: ValidatedRidePromo | null;
  distance: number;
  duration: number;
  rideTypeName: string;
  className?: string;
}

export function RidePriceBreakdownWithPromo({
  quote,
  appliedPromo,
  distance,
  duration,
  rideTypeName,
  className,
}: RidePriceBreakdownWithPromoProps) {
  const hasPromo = appliedPromo?.valid && appliedPromo.discount_amount;
  const discountAmount = appliedPromo?.discount_amount || 0;
  const finalTotal = hasPromo ? Math.max(0, quote.total - discountAmount) : quote.total;

  return (
    <div className={cn("space-y-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
        <Receipt className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700">Fare Breakdown</span>
      </div>
      
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Base fare</span>
          <span className="text-zinc-900">{formatCurrency(quote.baseFare)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Distance ({distance.toFixed(1)} mi)</span>
          <span className="text-zinc-900">{formatCurrency(quote.distanceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Time (~{duration} min)</span>
          <span className="text-zinc-900">{formatCurrency(quote.timeFee)}</span>
        </div>
        {quote.multiplier !== 1 && (
          <div className="flex justify-between text-zinc-400 text-xs">
            <span>{rideTypeName} ({quote.multiplier}x)</span>
            <span>applied</span>
          </div>
        )}
        {quote.minimumApplied && (
          <div className="flex justify-between text-zinc-400 text-xs italic">
            <span>Minimum fare applied</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">Booking fee</span>
          <span className="text-zinc-900">{formatCurrency(quote.bookingFee)}</span>
        </div>
      </div>

      {/* Subtotal before discount */}
      {hasPromo && (
        <>
          <div className="flex justify-between pt-2 border-t border-zinc-200">
            <span className="text-zinc-600">Subtotal</span>
            <span className="text-zinc-600">{formatCurrency(quote.total)}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1">
              Promo ({appliedPromo.code})
            </span>
            <span>−{formatCurrency(discountAmount)}</span>
          </div>
        </>
      )}

      {/* Final Total */}
      <div className="flex justify-between pt-2 border-t border-zinc-200 font-bold">
        <span className="text-zinc-900">Total</span>
        <span className={cn(
          "text-zinc-900",
          hasPromo && "text-emerald-600"
        )}>
          {formatCurrency(finalTotal)}
        </span>
      </div>
      
      <p className="text-[10px] text-zinc-400 pt-1">
        {hasPromo ? (
          <>Discount applied. Original estimate: ${quote.estimatedMin}-${quote.estimatedMax}.</>
        ) : (
          <>Estimated range: ${quote.estimatedMin}-${quote.estimatedMax}. Final price may vary based on route and traffic.</>
        )}
      </p>
    </div>
  );
}
