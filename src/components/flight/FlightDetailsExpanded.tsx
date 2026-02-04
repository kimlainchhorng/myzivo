/**
 * Flight Details Expanded Panel
 * Shows segment list, aircraft, fare rules, and checkout CTA
 */

import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ChevronRight,
  Luggage,
  Package,
  Briefcase,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AirlineLogo } from './AirlineLogo';
import { FLIGHT_RESULTS_COMPLIANCE } from '@/config/flightCompliance';
import { format, parseISO } from 'date-fns';
import type { DuffelOffer, DuffelSegment } from '@/hooks/useDuffelFlights';

interface FlightDetailsExpandedProps {
  offer: DuffelOffer;
  onContinueToCheckout: () => void;
  className?: string;
}

export function FlightDetailsExpanded({
  offer,
  onContinueToCheckout,
  className,
}: FlightDetailsExpandedProps) {
  const navigate = useNavigate();
  
  // Check if seat selection is available (would need to be added to DuffelOffer type)
  const hasSeatSelection = false; // Default to false as not in current type

  // Parse fare conditions
  const isRefundable = offer.isRefundable ?? false;
  const isChangeable = offer.conditions?.changeBeforeDeparture !== false;
  const changeAllowed = offer.conditions?.changeBeforeDeparture;
  const refundAllowed = offer.conditions?.refundBeforeDeparture;

  // Get baggage display
  const baggageIncluded = offer.baggageIncluded?.toLowerCase() || '';
  const hasCheckedBag = baggageIncluded.includes('check') || baggageIncluded.includes('23kg') || baggageIncluded.includes('included');
  const hasCarryOn = baggageIncluded.includes('carry') || baggageIncluded.includes('cabin') || !baggageIncluded.includes('no');

  return (
    <div className={cn('bg-muted/30 border-t border-border/50 animate-in slide-in-from-top-2 duration-200', className)}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Segment List */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-500" />
            Flight Segments
          </h4>
          <div className="space-y-4">
            {offer.segments?.map((segment, index) => (
              <SegmentCard key={segment.id || index} segment={segment} index={index} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Baggage Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Luggage className="w-4 h-4 text-sky-500" />
            Baggage Allowance
          </h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span>Personal item included</span>
            </div>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              hasCarryOn ? 'text-foreground' : 'text-muted-foreground line-through'
            )}>
              <Package className={cn('w-4 h-4', hasCarryOn ? 'text-emerald-500' : 'text-muted-foreground')} />
              <span>Carry-on bag</span>
            </div>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              hasCheckedBag ? 'text-foreground' : 'text-muted-foreground line-through'
            )}>
              <Luggage className={cn('w-4 h-4', hasCheckedBag ? 'text-emerald-500' : 'text-muted-foreground')} />
              <span>Checked bag</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Fare Rules Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-500" />
            Fare Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Changes */}
            <div className="flex items-start gap-2 text-sm">
              {isChangeable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={isChangeable ? 'text-foreground' : 'text-muted-foreground'}>
                  {isChangeable ? 'Changes allowed' : 'Changes not allowed'}
                </p>
                {changeAllowed && (
                  <p className="text-xs text-muted-foreground">
                    Fee may apply
                  </p>
                )}
              </div>
            </div>

            {/* Refunds */}
            <div className="flex items-start gap-2 text-sm">
              {isRefundable ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <p className={isRefundable ? 'text-foreground' : 'text-muted-foreground'}>
                  {isRefundable ? 'Refundable' : 'Non-refundable'}
                </p>
                {refundAllowed && (
                  <p className="text-xs text-muted-foreground">
                    Fee may apply
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Fare rules confirmed at checkout
          </p>
        </div>

        <Separator />

        {/* Seat Selection */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Seat Selection</h4>
          {hasSeatSelection ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/flights/seats/${offer.id}`)}
              className="gap-2"
            >
              Choose Seats
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {FLIGHT_RESULTS_COMPLIANCE.seatSelectionFallback}
            </p>
          )}
        </div>

        <Separator />

        {/* Continue to Checkout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-2xl font-bold text-sky-500">
              ${offer.pricePerPerson?.toFixed(2) || offer.price?.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">per person · includes taxes & fees</p>
          </div>
          
          <Button
            size="lg"
            onClick={onContinueToCheckout}
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg w-full sm:w-auto"
          >
            Continue to Checkout
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Compliance note */}
        <p className="text-[10px] text-muted-foreground text-center">
          {FLIGHT_RESULTS_COMPLIANCE.fareRulesNote}
        </p>
      </div>
    </div>
  );
}

// Segment Card Component
function SegmentCard({ segment, index }: { segment: DuffelSegment; index: number }) {
  const departureTime = segment.departingAt 
    ? format(parseISO(segment.departingAt), 'HH:mm')
    : '--:--';
  
  const arrivalTime = segment.arrivingAt
    ? format(parseISO(segment.arrivingAt), 'HH:mm')
    : '--:--';
  
  const departureDate = segment.departingAt
    ? format(parseISO(segment.departingAt), 'EEE, MMM d')
    : '';

  const duration = segment.duration || 'Duration TBD';
  const aircraft = segment.aircraft || FLIGHT_RESULTS_COMPLIANCE.aircraftFallback;
  const operatedBy = segment.operatingCarrier || '';

  return (
    <div className="bg-card/50 rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-xs">
          Segment {index + 1}
        </Badge>
        {departureDate && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {departureDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Airline Logo */}
        <AirlineLogo
          iataCode={segment.marketingCarrierCode || segment.operatingCarrierCode || 'XX'}
          size={40}
          className="shrink-0"
        />

        {/* Route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{segment.origin?.code || '---'}</span>
            <ArrowRight className="w-4 h-4 text-sky-500" />
            <span className="font-semibold">{segment.destination?.code || '---'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{departureTime} – {arrivalTime}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">Flight:</span>{' '}
          {segment.flightNumber || 'TBD'}
        </div>
        <div>
          <span className="font-medium text-foreground">Aircraft:</span>{' '}
          {aircraft}
        </div>
        {operatedBy && (
          <div className="col-span-2">
            <span className="font-medium text-foreground">Operated by:</span>{' '}
            {operatedBy}
          </div>
        )}
      </div>
    </div>
  );
}

export default FlightDetailsExpanded;
