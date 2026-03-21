/**
 * Flight Checkout Page — /flights/checkout
 * Embedded Stripe PaymentElement for card input directly on page
 */

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, Lock, Info } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import CheckoutStepIndicator from "@/components/checkout/CheckoutStepIndicator";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutSecurityStrip from "@/components/checkout/CheckoutSecurityStrip";
import FlightPriceBreakdown from "@/components/flight/FlightPriceBreakdown";
import AcceptedPaymentMethods from "@/components/checkout/AcceptedPaymentMethods";
import { CheckoutTermsAcceptance, useTermsValidation } from "@/components/checkout/CheckoutTermsAcceptance";
import CheckoutTrustFooter from "@/components/checkout/CheckoutTrustFooter";
import ImportantBookingNotice from "@/components/checkout/ImportantBookingNotice";
import FlightInlinePaymentForm from "@/components/flight/FlightInlinePaymentForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FLIGHT_MOR_DISCLAIMERS, FLIGHT_CHECKOUT_CLARITY, ZIVO_SOT_REGISTRATION, FLIGHT_LEGAL_LINKS } from "@/config/flightMoRCompliance";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";
import { calculateFlightPricing, type FlightPricingBreakdown } from "@/utils/flightPricing";

const STEPS = [
  { label: "Search", completed: true, active: false },
  { label: "Travelers", completed: true, active: false },
  { label: "Payment", completed: false, active: true },
  { label: "Confirm", completed: false, active: false },
];

const FlightCheckout = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [termsValid, handleTermsChange, triggerValidation] = useTermsValidation();

  // Payment intent state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalCents, setTotalCents] = useState(0);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const intentCreated = useRef(false);
  

  const offerRaw = sessionStorage.getItem("zivo_selected_offer");
  const searchRaw = sessionStorage.getItem("zivo_search_params");
  const passengersRaw = sessionStorage.getItem("zivo_passengers");

  const offer: DuffelOffer | null = offerRaw ? JSON.parse(offerRaw) : null;
  const search = searchRaw ? JSON.parse(searchRaw) : null;
  const passengers = passengersRaw ? JSON.parse(passengersRaw) : null;

  const totalPassengers = search ? (search.adults || 1) + (search.children || 0) + (search.infants || 0) : 1;

  const pricing: FlightPricingBreakdown = useMemo(() =>
    calculateFlightPricing(
      offer?.price || 0,
      totalPassengers,
      offer?.currency || "USD",
    ), [offer?.price, totalPassengers, offer?.currency]);

  

  useEffect(() => {
    if (!offer || !passengers) navigate("/flights", { replace: true });
  }, [offer, passengers, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Login Required", description: "Please sign in to book a flight.", variant: "destructive" });
      navigate("/login?redirect=/flights/checkout", { replace: true });
    }
  }, [user, authLoading, navigate, toast]);

  // Create payment intent when terms are accepted
  const createPaymentIntent = useCallback(async () => {
    if (intentCreated.current || isCreatingIntent || !offer || !passengers || !search || !user) return;
    intentCreated.current = true;
    setIsCreatingIntent(true);
    setIntentError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-flight-payment-intent', {
        body: {
          userId: user.id,
          offerId: offer.id,
          passengers: passengers.map((p: any) => ({
            ...p,
            gender: p.gender as "m" | "f",
          })),
          totalAmount: pricing.totalPerPassenger,
          baseFare: pricing.baseFare,
          taxesFees: pricing.taxesFeesCharges,
          stateCode: null,
          duffelPrice: pricing.duffelPrice,
          currency: offer.currency || "USD",
          origin: search.origin,
          destination: search.destination,
          departureDate: search.departureDate,
          returnDate: search.returnDate,
          cabinClass: search.cabinClass,
        },
      });

      if (error) throw new Error(error.message || 'Failed to create payment');
      if (!data?.client_secret) throw new Error(data?.error || 'Failed to create payment session');

      setClientSecret(data.client_secret);
      setBookingId(data.booking_id);
      setTotalCents(data.total_cents);
    } catch (err: any) {
      console.error("Payment intent error:", err);
      setIntentError(err?.message || "Failed to initialize payment. Please try again.");
      intentCreated.current = false;
      toast({
        title: "Payment Error",
        description: err?.message || "Failed to initialize payment.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingIntent(false);
    }
  }, [offer, passengers, search, user, isCreatingIntent, toast]);

  const handleProceedToPayment = useCallback(() => {
    if (!triggerValidation()) {
      toast({ title: "Please accept terms", description: "You must accept the terms and fare rules to continue.", variant: "destructive" });
      return;
    }
    createPaymentIntent();
  }, [triggerValidation, toast, createPaymentIntent]);

  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);

  const handlePaymentSuccess = useCallback(async (paymentIntentId: string) => {
    // Card is authorized — now confirm booking via Duffel + capture payment
    setIsConfirmingBooking(true);
    try {
      const { data, error } = await supabase.functions.invoke('confirm-flight-payment', {
        body: { booking_id: bookingId, payment_intent_id: paymentIntentId },
      });

      if (error) throw new Error(error.message || 'Booking confirmation failed');
      if (!data?.ok) throw new Error(data?.error || 'Booking failed. Your card was not charged.');

      toast({
        title: "Booking Confirmed!",
        description: "Your flight has been booked successfully.",
      });
      navigate(`/flights/confirmation/${bookingId}?success=true`, { replace: true });
    } catch (err: any) {
      console.error("Booking confirmation error:", err);
      toast({
        title: "Booking Failed",
        description: err?.message || "Your card was not charged. Please try again.",
        variant: "destructive",
      });
      setClientSecret(null);
      intentCreated.current = false;
    } finally {
      setIsConfirmingBooking(false);
    }
  }, [bookingId, navigate, toast]);

  const handlePaymentCancel = useCallback(() => {
    setClientSecret(null);
    intentCreated.current = false;
  }, []);

  if (!offer || !passengers || !search || authLoading) return null;

  const showPaymentForm = !!clientSecret;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Secure Checkout – ZIVO Flights" description="Complete your flight booking securely with ZIVO." />

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-80 h-80 rounded-full bg-[hsl(var(--flights))]/5 blur-3xl" />
        <div className="absolute bottom-20 -left-10 w-60 h-60 rounded-full bg-emerald-500/4 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-36 md:pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Back + title */}
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => showPaymentForm ? handlePaymentCancel() : navigate(-1)} disabled={isCreatingIntent} className="shrink-0 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                Secure Checkout
              </h1>
              <p className="text-xs text-muted-foreground">Your booking is encrypted and secure</p>
            </div>
          </div>

          {/* Steps */}
          <CheckoutStepIndicator steps={STEPS} className="mb-5" />

          {/* Security strip */}
          <CheckoutSecurityStrip className="mb-5" />

          {/* Order summary */}
          <CheckoutOrderSummary
            offer={offer}
            search={search}
            passengers={passengers}
            className="mb-4"
          />


          {/* Price Breakdown */}
          <FlightPriceBreakdown
            pricing={pricing}
            className="mb-4"
            showNoHiddenFees
          />

          {/* Accepted payment methods - hide when payment form is showing */}
          {!showPaymentForm && (
            <AcceptedPaymentMethods compact className="mb-5 justify-center" />
          )}

          {/* PAYMENT FORM or Pre-payment info */}
          {showPaymentForm ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 relative"
            >
              {isConfirmingBooking && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm rounded-2xl">
                  <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--flights))]" />
                  <p className="text-sm font-semibold">Confirming your booking…</p>
                  <p className="text-xs text-muted-foreground">Your card has been authorized. Finalizing with the airline.</p>
                </div>
              )}
              <FlightInlinePaymentForm
                clientSecret={clientSecret}
                totalCents={totalCents}
                currency={offer.currency || "USD"}
                onCancel={handlePaymentCancel}
                onSuccess={handlePaymentSuccess}
              />
            </motion.div>
          ) : (
            <>
              {/* Consolidated notices card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-2xl border border-border/30 bg-card overflow-hidden"
              >
                {/* Pre-payment notice */}
                <div className="px-4 py-3 bg-[hsl(var(--flights))]/[0.04] border-b border-border/20">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {FLIGHT_CHECKOUT_CLARITY.prePayment}
                  </p>
                </div>

                {/* Important booking notice */}
                <div className="px-4 py-3 border-b border-border/20">
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                    <span>Ticket rules, baggage, and refund policies vary by fare and airline.</span>
                  </p>
                </div>

                {/* SOT Disclosure */}
                <div className="px-4 py-3">
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                    <span>{ZIVO_SOT_REGISTRATION.subAgent} {FLIGHT_MOR_DISCLAIMERS.ticketing}</span>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] mt-2 ml-5">
                    <Link to={FLIGHT_LEGAL_LINKS.partnerDisclosure} className="text-primary hover:underline">
                      Partner Disclosure
                    </Link>
                    <span className="text-border">·</span>
                    <Link to={FLIGHT_LEGAL_LINKS.flightTerms} className="text-primary hover:underline">
                      Flight Terms
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Terms acceptance */}
              <CheckoutTermsAcceptance
                onStateChange={handleTermsChange}
                productType="flights"
                className="mb-6"
                disabled={isCreatingIntent}
              />

              {/* Intent error */}
              {intentError && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {intentError}
                </div>
              )}

              {/* Continue to Payment button (desktop) */}
              <div className="hidden md:block">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={isCreatingIntent || !termsValid}
                    className="w-full h-14 text-base font-bold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 rounded-2xl shadow-lg transition-all duration-200 min-h-[48px]"
                  >
                    {isCreatingIntent ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing Payment…
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </motion.div>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  {FLIGHT_MOR_DISCLAIMERS.payment}
                </p>
              </div>
            </>
          )}

          {/* Trust footer */}
          <CheckoutTrustFooter className="mt-8" />
        </div>
      </main>

      {/* Mobile sticky CTA - only show before payment form */}
      {!showPaymentForm && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 safe-bottom">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">Total</p>
              <p className="text-lg font-bold tracking-tight">${pricing.totalAllPassengers.toFixed(2)}</p>
            </div>
            <div className="shrink-0">
              <Button
                onClick={handleProceedToPayment}
                disabled={isCreatingIntent || !termsValid}
                className="py-2 h-12 px-6 text-sm font-bold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 rounded-2xl shadow-lg min-h-[48px]"
              >
                {isCreatingIntent ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FlightCheckout;
