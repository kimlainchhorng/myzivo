import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Plane, Users, Luggage, Armchair, Shield,
  ChevronRight, Check, Crown, Sparkles, Tag, X, Loader2,
  Zap, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedFlight } from '@/data/flightGenerator';
import type { Passenger } from './PassengerForm';
import type { Seat } from './SeatSelector';

interface TripSummaryCardProps {
  outboundFlight?: GeneratedFlight;
  returnFlight?: GeneratedFlight;
  fareClass: 'economy' | 'premium-economy' | 'business' | 'first';
  passengers?: Passenger[];
  selectedSeats?: { [passengerId: string]: Seat };
  baggage?: { [key: string]: number };
  baggageTotal?: number;
  travelInsurance?: boolean;
  insurancePrice?: number;
  onContinue?: () => void;
  currentStep?: number;
  isRealPrice?: boolean;
}

// Promo code definitions
const PROMO_CODES: Record<string, { discount: number; type: 'percent' | 'fixed'; description: string }> = {
  'ZIVO10': { discount: 10, type: 'percent', description: '10% off' },
  'ZIVO25': { discount: 25, type: 'fixed', description: '$25 off' },
  'FIRST50': { discount: 50, type: 'fixed', description: '$50 off first booking' },
  'SUMMER20': { discount: 20, type: 'percent', description: '20% summer discount' },
  'FLYAWAY': { discount: 15, type: 'percent', description: '15% off' },
};

const fareClassLabels = {
  'economy': { label: 'Economy', icon: null, color: 'text-foreground' },
  'premium-economy': { label: 'Premium Economy', icon: Sparkles, color: 'text-sky-400' },
  'business': { label: 'Business Class', icon: Sparkles, color: 'text-purple-400' },
  'first': { label: 'First Class', icon: Crown, color: 'text-amber-400' }
};

export default function TripSummaryCard({
  outboundFlight,
  returnFlight,
  fareClass,
  passengers = [],
  selectedSeats = {},
  baggage = {},
  baggageTotal = 0,
  travelInsurance = false,
  insurancePrice = 49,
  onContinue,
  currentStep = 1,
  isRealPrice = false
}: TripSummaryCardProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const fareInfo = fareClassLabels[fareClass];
  const FareIcon = fareInfo.icon;

  // Calculate prices
  const getFlightPrice = (flight: GeneratedFlight) => {
    switch (fareClass) {
      case 'first': return flight.firstPrice || flight.businessPrice || flight.price;
      case 'business': return flight.businessPrice || flight.price;
      case 'premium-economy': return flight.premiumEconomyPrice || flight.price;
      default: return flight.price;
    }
  };

  const outboundPrice = outboundFlight ? getFlightPrice(outboundFlight) : 0;
  const returnPrice = returnFlight ? getFlightPrice(returnFlight) : 0;
  const flightTotal = (outboundPrice + returnPrice) * Math.max(passengers.length, 1);

  const seatsTotal = Object.values(selectedSeats).reduce((sum, seat) => sum + (seat?.price || 0), 0);
  const insuranceTotal = travelInsurance ? insurancePrice * Math.max(passengers.length, 1) : 0;

  const subtotal = flightTotal + seatsTotal + baggageTotal + insuranceTotal;

  // Calculate discount
  const appliedPromoData = appliedPromo ? PROMO_CODES[appliedPromo] : null;
  const discountAmount = appliedPromoData 
    ? appliedPromoData.type === 'percent' 
      ? Math.round(subtotal * appliedPromoData.discount / 100)
      : appliedPromoData.discount
    : 0;

  const grandTotal = subtotal - discountAmount;

  // Calculate taxes (roughly 15%)
  const taxes = Math.round(grandTotal * 0.15);
  const totalWithTaxes = grandTotal + taxes;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    
    setIsValidating(true);
    setPromoError('');
    
    // Simulate validation delay
    setTimeout(() => {
      const upperCode = promoCode.toUpperCase().trim();
      if (PROMO_CODES[upperCode]) {
        setAppliedPromo(upperCode);
        setPromoCode('');
        setPromoError('');
      } else {
        setPromoError('Invalid promo code');
      }
      setIsValidating(false);
    }, 500);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden sticky top-4">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            Trip Summary
            {FareIcon && <FareIcon className={cn("w-4 h-4", fareInfo.color)} />}
          </h3>
          {isRealPrice && (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Live Price
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {fareInfo.label} • {Math.max(passengers.length, 1)} traveler{passengers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Flights */}
        {outboundFlight && (
          <div className="space-y-3">
            {/* Outbound */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Plane className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {outboundFlight.departure.code} → {outboundFlight.arrival.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {outboundFlight.airline} • {outboundFlight.duration}
                </p>
              </div>
              <p className="text-sm font-semibold">${outboundPrice}</p>
            </div>

            {/* Return */}
            {returnFlight && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-primary rotate-180" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {returnFlight.departure.code} → {returnFlight.arrival.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {returnFlight.airline} • {returnFlight.duration}
                  </p>
                </div>
                <p className="text-sm font-semibold">${returnPrice}</p>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Passengers */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Passengers</span>
          </div>
          <span>{passengers.length} × ${outboundPrice + returnPrice}</span>
        </div>

        {/* Seats */}
        {seatsTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Armchair className="w-4 h-4" />
              <span>Seat Selection</span>
            </div>
            <span>+${seatsTotal}</span>
          </div>
        )}

        {/* Baggage */}
        {baggageTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Luggage className="w-4 h-4" />
              <span>Additional Baggage</span>
            </div>
            <span>+${baggageTotal}</span>
          </div>
        )}

        {/* Insurance */}
        {travelInsurance && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Travel Insurance</span>
            </div>
            <span>+${insuranceTotal}</span>
          </div>
        )}

        <Separator />

        {/* Promo Code Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Promo Code
          </p>
          
          <AnimatePresence mode="wait">
            {appliedPromo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-medium text-emerald-400">{appliedPromo}</span>
                    <p className="text-xs text-emerald-500/70">{PROMO_CODES[appliedPromo]?.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-red-500/10 hover:text-red-400"
                  onClick={handleRemovePromo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoError('');
                  }}
                  className="h-9 text-sm uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim() || isValidating}
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {promoError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400"
            >
              {promoError}
            </motion.p>
          )}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-emerald-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Discount ({appliedPromo})
            </span>
            <span className="text-emerald-400">-${discountAmount.toLocaleString()}</span>
          </motion.div>
        )}

        {/* Taxes */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Taxes & Fees</span>
          <span>${taxes.toLocaleString()}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <div className="text-right">
            {discountAmount > 0 && (
              <p className="text-sm text-muted-foreground line-through">
                ${(subtotal + Math.round(subtotal * 0.15)).toLocaleString()}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              ${totalWithTaxes.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">USD</p>
          </div>
        </div>

        {/* Continue button */}
        {onContinue && (
          <Button 
            className="w-full bg-primary mt-2"
            onClick={onContinue}
          >
            Continue to {currentStep === 1 ? 'Passenger Details' : 
                         currentStep === 2 ? 'Seat Selection' : 
                         currentStep === 3 ? 'Extras' : 'Payment'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Secure Booking</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Best Price</span>
          </div>
        </div>
      </div>
    </div>
  );
}
