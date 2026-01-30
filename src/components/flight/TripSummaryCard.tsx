import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, Calendar, Users, Luggage, Armchair, Shield,
  ChevronRight, Check, Crown, Sparkles
} from 'lucide-react';
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
}

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
  currentStep = 1
}: TripSummaryCardProps) {
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
  const flightTotal = (outboundPrice + returnPrice) * passengers.length;

  const seatsTotal = Object.values(selectedSeats).reduce((sum, seat) => sum + (seat?.price || 0), 0);
  const insuranceTotal = travelInsurance ? insurancePrice * passengers.length : 0;

  const grandTotal = flightTotal + seatsTotal + baggageTotal + insuranceTotal;

  // Calculate taxes (roughly 15%)
  const taxes = Math.round(grandTotal * 0.15);
  const totalWithTaxes = grandTotal + taxes;

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden sticky top-4">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-border/50">
        <h3 className="font-semibold flex items-center gap-2">
          Trip Summary
          {FareIcon && <FareIcon className={cn("w-4 h-4", fareInfo.color)} />}
        </h3>
        <p className="text-sm text-muted-foreground">
          {fareInfo.label} • {passengers.length} traveler{passengers.length !== 1 ? 's' : ''}
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

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${grandTotal.toLocaleString()}</span>
        </div>

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
