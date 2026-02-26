/**
 * Flight Checkout Page
 * ZIVO Merchant-of-Record checkout with Stripe payment
 * NO partner redirect - payment processed by ZIVO
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import FlightPriceBreakdown from '@/components/flight/FlightPriceBreakdown';
import SecureCheckoutHeader from '@/components/checkout/SecureCheckoutHeader';
import AcceptedPaymentMethods from '@/components/checkout/AcceptedPaymentMethods';
import ImportantBookingNotice from '@/components/checkout/ImportantBookingNotice';
import SecureCheckoutButton from '@/components/checkout/SecureCheckoutButton';
import CheckoutTrustFooter from '@/components/checkout/CheckoutTrustFooter';
import {
  Plane,
  Clock,
  Shield,
  Lock,
  CreditCard,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useDuffelOffer, formatDuffelPrice, getDuffelAirlineLogo } from '@/hooks/useDuffelFlights';
import { useCreateFlightCheckout, type FlightPassenger } from '@/hooks/useFlightBooking';
import { FLIGHT_MOR_CTA, FLIGHT_MOR_DISCLAIMERS, FLIGHT_LEGAL_LINKS, ZIVO_SOT_REGISTRATION, FLIGHT_CHECKOUT_CLARITY } from '@/config/flightMoRCompliance';
import { FLIGHT_HEADER_MICROCOPY } from '@/config/flightCompliance';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFlightsCanBook } from '@/hooks/useFlightsLaunchStatus';
import { useFlightFunnel } from '@/hooks/useFlightFunnel';
import { usePromotionValidation } from '@/hooks/usePromotionValidation';
import { Tag, X, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const FlightCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const offerId = searchParams.get('offer');
  const passengerCount = parseInt(searchParams.get('passengers') || '1');
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sotDisclosureAccepted, setSotDisclosureAccepted] = useState(false);
  const [passengersData, setPassengersData] = useState<FlightPassenger[]>([]);
  
  const { data: offer, isLoading: offerLoading, error: offerError } = useDuffelOffer(offerId);
  const createCheckout = useCreateFlightCheckout();
  const { canBook, isInternalTest, isPaused, pauseReason, isLoading: bookingCheckLoading, phase } = useFlightsCanBook();
  const { trackCheckoutStarted } = useFlightFunnel();
  const { isValidating: promoValidating, appliedPromo, error: promoError, validateCode: validatePromo, removePromo } = usePromotionValidation({ serviceType: 'flights' });
  const [promoCode, setPromoCode] = useState('');

  // Load passenger data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('flightPassengers');
    if (stored) {
      try {
        setPassengersData(JSON.parse(stored));
      } catch {
        console.error('Failed to parse passenger data');
      }
    }
  }, []);

  // Track checkout started event
  useEffect(() => {
    if (offer && offerId && passengerCount > 0) {
      trackCheckoutStarted({
        offerId: offerId,
        amount: offer.price * passengerCount,
        currency: offer.currency,
        passengers: passengerCount,
      });
    }
  }, [offer, offerId, passengerCount, trackCheckoutStarted]);

  const handlePayment = async () => {
    if (!offer) {
      toast({
        title: 'Error',
        description: 'Flight offer not found. Please go back and try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the Terms and Conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!sotDisclosureAccepted) {
      toast({
        title: 'Disclosure Required',
        description: 'Please acknowledge the Seller of Travel disclosure to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (passengersData.length === 0) {
      toast({
        title: 'Passenger Info Required',
        description: 'Please provide passenger details before checkout.',
        variant: 'destructive',
      });
      navigate(`/flights/traveler-info?offer=${offerId}&passengers=${passengerCount}`);
      return;
    }

    try {
      // Calculate price breakdown (estimate: 85% base, 15% taxes)
      const baseFare = offer.price * 0.85;
      const taxesFees = offer.price * 0.15;

      const result = await createCheckout.mutateAsync({
        offerId: offer.id,
        passengers: passengersData,
        totalAmount: offer.price * passengerCount,
        baseFare,
        taxesFees,
        currency: offer.currency,
        origin: offer.departure.code,
        destination: offer.arrival.code,
        departureDate: offer.departure.date,
        cabinClass: offer.cabinClass,
      });

      // Store offer details for confirmation page display
      sessionStorage.setItem('flightOfferDetails', JSON.stringify({
        airline: offer.airline,
        airlineCode: offer.airlineCode,
        flightNumber: offer.flightNumber || null,
        cabinClass: offer.cabinClass,
        duration: offer.duration,
        stops: offer.stops,
        departure: offer.departure.time,
        arrival: offer.arrival.time,
      }));

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (error) {
      // Error handled by mutation
      console.error('Checkout error:', error);
    }
  };

  // Loading state
  if (offerLoading || bookingCheckLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading checkout...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Block public users in TEST mode or when paused
  if (!canBook) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Bookings Coming Soon – ZIVO" description="Flight bookings will open soon." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8 text-center">
                {isPaused ? (
                  <>
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Bookings Temporarily Paused</h1>
                    <p className="text-muted-foreground mb-6">
                      {pauseReason || "Flight bookings are temporarily paused. Please try again later."}
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Bookings Coming Soon</h1>
                    <p className="text-muted-foreground mb-6">
                      Flights are in beta testing. Bookings will open soon.
                    </p>
                  </>
                )}
                <Button onClick={() => navigate('/flights')} className="gap-2">
                  <Plane className="w-4 h-4" />
                  Browse Flights
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (offerError || !offer) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Checkout Error – ZIVO" description="Unable to load checkout." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-bold mb-2">Offer Expired</h1>
                <p className="text-muted-foreground mb-6">
                  This flight offer has expired. Please search again for current availability.
                </p>
                <Button onClick={() => navigate('/flights')} className="gap-2">
                  <Plane className="w-4 h-4" />
                  Search Flights
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const baseFare = offer.price * 0.85;
  const taxesFees = offer.price * 0.15;
  const totalBeforeDiscount = offer.price * passengerCount;
  const promoDiscount = appliedPromo?.valid ? (appliedPromo.discount_amount || 0) : 0;
  const finalTotal = Math.max(0, totalBeforeDiscount - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || promoValidating) return;
    await validatePromo(promoCode.trim(), totalBeforeDiscount);
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    removePromo();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Checkout – ${offer.departure.code} to ${offer.arrival.code} | ZIVO`}
        description="Complete your flight booking securely with ZIVO."
        noIndex={true}
      />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Secure Checkout Header */}
          <SecureCheckoutHeader 
            variant="flights" 
            currentStep={3} 
            showProgress={true} 
            className="mb-6" 
          />

          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Flight Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Your Flight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={getDuffelAirlineLogo(offer.airlineCode)}
                      alt={offer.airline}
                      className="w-12 h-12 object-contain bg-white rounded-lg p-1 border"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div>
                      <h3 className="font-semibold">{offer.airline}</h3>
                      <p className="text-sm text-muted-foreground">{offer.flightNumber}</p>
                    </div>
                    <Badge className="ml-auto">{offer.cabinClass}</Badge>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{offer.departure.time}</p>
                      <p className="text-sm font-medium text-primary">{offer.departure.code}</p>
                      <p className="text-xs text-muted-foreground">{offer.departure.city}</p>
                    </div>
                    <div className="flex-1 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        {offer.duration}
                      </div>
                      <div className="h-px bg-border relative">
                        <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary -rotate-45" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {offer.stops === 0 ? 'Direct' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{offer.arrival.time}</p>
                      <p className="text-sm font-medium text-primary">{offer.arrival.code}</p>
                      <p className="text-xs text-muted-foreground">{offer.arrival.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
                    <span>{format(parseISO(offer.departure.date), 'EEE, MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Passengers Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Passengers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {passengersData.length > 0 ? (
                    <div className="space-y-3">
                      {passengersData.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium">{p.given_name} {p.family_name}</p>
                            <p className="text-sm text-muted-foreground">{p.email}</p>
                          </div>
                          <Badge variant="outline">Passenger {i + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Passenger details are required.{' '}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/flights/traveler-info?offer=${offerId}&passengers=${passengerCount}`)}
                        >
                          Add passenger info
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Terms and Conditions - Enhanced for OTA clarity */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-relaxed cursor-pointer"
                      >
                        {FLIGHT_CHECKOUT_CLARITY.consent} *
                      </label>
                      <p className="text-xs text-muted-foreground">
                        By booking, you agree to the{' '}
                        <a href={FLIGHT_LEGAL_LINKS.flightTerms} className="text-primary hover:underline">Airline Fare Rules</a>,{' '}
                        <a href={FLIGHT_LEGAL_LINKS.terms} className="text-primary hover:underline">Terms of Service</a>, and{' '}
                        <a href={FLIGHT_LEGAL_LINKS.privacy} className="text-primary hover:underline">Privacy Policy</a>.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Seller of Travel Disclosure Checkbox */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <Checkbox
                      id="sot-disclosure"
                      checked={sotDisclosureAccepted}
                      onCheckedChange={(checked) => setSotDisclosureAccepted(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="sot-disclosure"
                        className="text-sm font-medium leading-relaxed cursor-pointer flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        I acknowledge the Seller of Travel disclosure *
                      </label>
                      <p className="text-xs text-muted-foreground">
                        ZIVO is registered or registration pending as a Seller of Travel where required.
                        Tickets are issued by licensed airline ticketing partners.
                      </p>
                      <a 
                        href="/legal/seller-of-travel" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        View full Seller of Travel disclosure
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Booking Notice */}
              <ImportantBookingNotice variant="flights" />
            </motion.div>

            {/* Sidebar - Price & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Breakdown */}
              <FlightPriceBreakdown
                baseFare={baseFare}
                taxesFees={taxesFees}
                passengers={passengerCount}
                currency={offer.currency}
                showNoHiddenFees
              />

              {/* Promo Code */}
              <Card>
                <CardContent className="p-4">
                  {appliedPromo?.valid ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{appliedPromo.code}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm">−${promoDiscount.toFixed(2)}</span>
                        </div>
                        {appliedPromo.description && (
                          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 truncate">{appliedPromo.description}</p>
                        )}
                      </div>
                      <button onClick={handleRemovePromo} className="p-1.5 rounded-xl hover:bg-emerald-500/10 transition-all duration-200" aria-label="Remove promo code">
                        <X className="w-4 h-4 text-emerald-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground font-medium">Promo Code</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                            placeholder="Enter code"
                            disabled={promoValidating}
                            className="pl-10 h-11 uppercase"
                            style={{ fontSize: '16px' }}
                          />
                        </div>
                        <Button onClick={handleApplyPromo} disabled={!promoCode.trim() || promoValidating} className="h-11 px-5">
                          {promoValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accepted Payment Methods */}
              <AcceptedPaymentMethods />

              {/* Pay Button */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  {/* Pre-payment clarity message */}
                  <div className="p-3 rounded-lg bg-background/60 border border-border/50 mb-2 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                    <p className="text-xs text-center text-muted-foreground">
                      {FLIGHT_CHECKOUT_CLARITY.prePayment}
                    </p>
                  </div>

                  <SecureCheckoutButton
                    onClick={handlePayment}
                    isLoading={createCheckout.isPending}
                    disabled={!termsAccepted || !sotDisclosureAccepted || passengersData.length === 0}
                    variant="flights"
                    buttonText={FLIGHT_MOR_CTA.pay}
                  />

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>Licensed SOT</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span>Stripe</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Instant</span>
                    </div>
                  </div>

                  {/* SOT Registration */}
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    {ZIVO_SOT_REGISTRATION.status}
                  </p>
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    {ZIVO_SOT_REGISTRATION.subAgent} {ZIVO_SOT_REGISTRATION.ticketing}
                  </p>
                </CardContent>
              </Card>

              {/* What Happens Next */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <p className="text-muted-foreground">Complete payment securely with Stripe</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <p className="text-muted-foreground">Receive instant booking confirmation</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <p className="text-muted-foreground">Get your e-ticket via email within minutes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightCheckout;
