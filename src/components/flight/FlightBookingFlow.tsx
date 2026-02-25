import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Plane, Users, Armchair, Luggage, Shield, CreditCard, 
  Check, ChevronRight, ChevronLeft, Sparkles, Crown,
  ArrowRight, Clock, Calendar, Info, Zap, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import SeatSelector, { type Seat } from './SeatSelector';
import BaggageSelector from './BaggageSelector';
import PassengerForm, { type Passenger } from './PassengerForm';
import TripSummaryCard from './TripSummaryCard';
import type { GeneratedFlight } from '@/data/flightGenerator';

interface FlightBookingFlowProps {
  outboundFlight: GeneratedFlight;
  returnFlight?: GeneratedFlight;
  fareClass: 'economy' | 'premium-economy' | 'business' | 'first';
  passengerCount: number;
  departDate?: Date;
  returnDate?: Date;
  onComplete: (bookingData: BookingData) => void;
  onCancel: () => void;
}

export interface BookingData {
  passengers: Passenger[];
  seats: { [passengerId: string]: Seat };
  baggage: { [key: string]: number };
  baggageTotal: number;
  travelInsurance: boolean;
  totalPrice: number;
}

type BookingStep = 'passengers' | 'seats' | 'extras' | 'review';

const steps: { id: BookingStep; label: string; icon: React.ElementType }[] = [
  { id: 'passengers', label: 'Passengers', icon: Users },
  { id: 'seats', label: 'Seat Selection', icon: Armchair },
  { id: 'extras', label: 'Extras', icon: Luggage },
  { id: 'review', label: 'Review', icon: Check },
];

// Helper to create initial passengers
const createInitialPassengers = (count: number): Passenger[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `adult-${i}`,
    type: 'adult' as const,
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    frequentFlyerNumber: '',
    mealPreference: 'standard',
    specialAssistance: [],
    isComplete: false,
  }));
};

export default function FlightBookingFlow({
  outboundFlight,
  returnFlight,
  fareClass,
  passengerCount,
  departDate,
  returnDate,
  onComplete,
  onCancel,
}: FlightBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('passengers');
  const [passengers, setPassengers] = useState<Passenger[]>(() => createInitialPassengers(passengerCount));
  const [selectedSeats, setSelectedSeats] = useState<{ [passengerId: string]: Seat }>({});
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [baggage, setBaggage] = useState<{ [key: string]: number }>({});
  const [baggageTotal, setBaggageTotal] = useState(0);
  const [travelInsurance, setTravelInsurance] = useState(false);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const getFlightPrice = (flight: GeneratedFlight) => {
    switch (fareClass) {
      case 'first': return flight.firstPrice || flight.businessPrice || flight.price;
      case 'business': return flight.businessPrice || flight.price;
      case 'premium-economy': return flight.premiumEconomyPrice || flight.price;
      default: return flight.price;
    }
  };

  const outboundPrice = getFlightPrice(outboundFlight);
  const returnPrice = returnFlight ? getFlightPrice(returnFlight) : 0;
  const flightTotal = (outboundPrice + returnPrice) * passengerCount;
  const seatsTotal = Object.values(selectedSeats).reduce((sum, seat) => sum + (seat?.price || 0), 0);
  const insurancePrice = 49;
  const insuranceTotal = travelInsurance ? insurancePrice * passengerCount : 0;
  const subtotal = flightTotal + seatsTotal + baggageTotal + insuranceTotal;
  const taxes = Math.round(subtotal * 0.15);
  const grandTotal = subtotal + taxes;

  const handleNextStep = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1].id);
    }
  };

  const handlePrevStep = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].id);
    }
  };

  const handleSeatSelect = (seat: Seat | null) => {
    const passengerId = passengers[currentPassengerIndex]?.id;
    if (!passengerId) return;

    setSelectedSeats(prev => {
      if (seat === null) {
        const { [passengerId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [passengerId]: seat };
    });
  };

  const handleBaggageChange = (selections: { [key: string]: number }) => {
    setBaggage(selections);
    // Calculate total from selections
    const total = Object.values(selections).reduce((sum, qty) => sum + (qty * 45), 0); // Approximate pricing
    setBaggageTotal(total);
  };

  const handleComplete = () => {
    onComplete({
      passengers,
      seats: selectedSeats,
      baggage,
      baggageTotal,
      travelInsurance,
      totalPrice: grandTotal,
    });
  };

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'passengers':
        return passengers.every(p => p.firstName && p.lastName);
      case 'seats':
        return true; // Seats are optional
      case 'extras':
        return true; // Extras are optional
      case 'review':
        return true;
      default:
        return false;
    }
  }, [currentStep, passengers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          {/* Flight Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                  <span>{outboundFlight.departure.code}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span>{outboundFlight.arrival.code}</span>
                  {returnFlight && (
                    <>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block" />
                      <span className="hidden sm:inline">{returnFlight.arrival.code}</span>
                    </>
                  )}
                  {outboundFlight.isRealPrice && (
                    <Badge variant="outline" className="ml-1 sm:ml-2 bg-sky-500/10 text-sky-500 border-sky-500/30 text-xs">
                      <Zap className="w-3 h-3 mr-0.5 sm:mr-1" />
                      <span className="hidden sm:inline">Live Price</span>
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {outboundFlight.airline} • <span className="capitalize">{fareClass.replace('-', ' ')}</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs sm:text-sm">
              Cancel
            </Button>
          </div>

          {/* Step Indicator - Mobile Optimized */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = idx < currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => idx <= currentStepIndex && setCurrentStep(step.id)}
                    disabled={idx > currentStepIndex}
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl transition-all touch-manipulation active:scale-95",
                      isActive && "bg-sky-500/20 text-sky-400",
                      isComplete && "text-emerald-400",
                      !isActive && !isComplete && "text-muted-foreground",
                      idx <= currentStepIndex && "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium",
                      isActive && "bg-sky-500 text-white",
                      isComplete && "bg-emerald-500 text-white",
                      !isActive && !isComplete && "bg-muted text-muted-foreground"
                    )}>
                      {isComplete ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{step.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-4 sm:w-8 mx-1 sm:mx-2 flex-shrink-0",
                      idx < currentStepIndex ? "bg-emerald-500" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passengers Step */}
            {currentStep === 'passengers' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-sky-400" />
                  Passenger Details
                </h2>
                <PassengerForm
                  passengers={passengers}
                  onPassengersChange={setPassengers}
                  isInternational={true}
                />
              </div>
            )}

            {/* Seats Step */}
            {currentStep === 'seats' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Armchair className="w-6 h-6 text-sky-400" />
                  Select Your Seats
                </h2>
                <p className="text-muted-foreground mb-6">
                  Choose seats for each passenger on your {returnFlight ? 'outbound' : ''} flight
                </p>

                {/* Passenger Tabs */}
                {passengers.length > 1 && (
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {passengers.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setCurrentPassengerIndex(idx)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                          idx === currentPassengerIndex
                            ? "bg-sky-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {p.firstName || `Passenger ${idx + 1}`}
                        {selectedSeats[p.id] && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {selectedSeats[p.id].id}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <SeatSelector
                  fareClass={fareClass}
                  onSeatSelect={handleSeatSelect}
                  selectedSeat={selectedSeats[passengers[currentPassengerIndex]?.id] || null}
                />
              </div>
            )}

            {/* Extras Step */}
            {currentStep === 'extras' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Luggage className="w-6 h-6 text-sky-400" />
                    Baggage & Extras
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Add extra baggage and travel protection
                  </p>

                  <BaggageSelector
                    fareClass={fareClass}
                    onBaggageChange={handleBaggageChange}
                  />
                </div>

                {/* Travel Insurance */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            Travel Protection
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Recommended</Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Full coverage for trip cancellation, medical emergencies, and lost baggage
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {['Trip Cancellation', 'Medical Coverage', 'Lost Baggage', '24/7 Support'].map(item => (
                              <Badge key={item} variant="outline" className="text-xs">
                                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${insurancePrice}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                        <Switch
                          checked={travelInsurance}
                          onCheckedChange={setTravelInsurance}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Check className="w-6 h-6 text-sky-400" />
                  Review Your Booking
                </h2>

                {/* Flight Details */}
                <Card className="border-border/50 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-500" />
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Flight Details
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Outbound */}
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <img 
                          src={outboundFlight.logo} 
                          alt={outboundFlight.airline}
                          className="w-10 h-10 rounded-xl object-contain bg-white p-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{outboundFlight.departure.code}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{outboundFlight.arrival.code}</span>
                            {outboundFlight.isRealPrice && (
                              <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-500 border-sky-500/30">
                                <Zap className="w-3 h-3 mr-1" />
                                Real Price
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {outboundFlight.airline} {outboundFlight.flightNumber} • {outboundFlight.duration}
                          </p>
                        </div>
                        {departDate && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{format(departDate, 'MMM d, yyyy')}</p>
                            <p className="text-xs text-muted-foreground">{outboundFlight.departure.time}</p>
                          </div>
                        )}
                      </div>

                      {/* Return */}
                      {returnFlight && (
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                          <img 
                            src={returnFlight.logo} 
                            alt={returnFlight.airline}
                            className="w-10 h-10 rounded-xl object-contain bg-white p-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{returnFlight.departure.code}</span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{returnFlight.arrival.code}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {returnFlight.airline} {returnFlight.flightNumber} • {returnFlight.duration}
                            </p>
                          </div>
                          {returnDate && (
                            <div className="text-right">
                              <p className="text-sm font-medium">{format(returnDate, 'MMM d, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">{returnFlight.departure.time}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Passengers */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Passengers ({passengers.length})
                    </h3>
                    <div className="space-y-3">
                      {passengers.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                          <div>
                            <p className="font-medium">{p.firstName} {p.lastName}</p>
                            <p className="text-sm text-muted-foreground">{p.nationality || 'Passenger'}</p>
                          </div>
                          {selectedSeats[p.id] && (
                            <Badge variant="outline">
                              <Armchair className="w-3 h-3 mr-1" />
                              Seat {selectedSeats[p.id].id}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Extras Summary */}
                {(baggageTotal > 0 || travelInsurance) && (
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Extras
                      </h3>
                      <div className="space-y-2">
                        {baggageTotal > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Additional Baggage</span>
                            <span>+${baggageTotal}</span>
                          </div>
                        )}
                        {travelInsurance && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Travel Protection ({passengerCount}×)</span>
                            <span>+${insuranceTotal}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Trip Summary */}
          <div className="lg:col-span-1">
            <TripSummaryCard
              outboundFlight={outboundFlight}
              returnFlight={returnFlight}
              fareClass={fareClass}
              passengers={passengers}
              selectedSeats={selectedSeats}
              baggageTotal={baggageTotal}
              travelInsurance={travelInsurance}
              insurancePrice={insurancePrice}
              currentStep={currentStepIndex + 1}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 p-4 z-30">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="text-center">
              <p className="text-2xl font-bold text-primary">${grandTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total (incl. taxes)</p>
            </div>

            {currentStep === 'review' ? (
              outboundFlight.bookingLink ? (
                <a
                  href={outboundFlight.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all duration-200 active:scale-[0.97] touch-manipulation shadow-lg shadow-sky-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  Book on {outboundFlight.airline}
                </a>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="gap-2 bg-sky-500 hover:bg-sky-600"
                >
                  <CreditCard className="w-4 h-4" />
                  Proceed to Payment
                </Button>
              )
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed}
                className="gap-2 bg-sky-500 hover:bg-sky-600"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
