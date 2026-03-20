/**
 * Flight Checkout Page — /flights/checkout
 * Premium 'Secure Vault' checkout with compliance, trust signals, terms acceptance
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import FlightPriceBreakdown from "@/components/flight/FlightPriceBreakdown";
import CheckoutStepIndicator from "@/components/checkout/CheckoutStepIndicator";
import CheckoutFlightSummary from "@/components/checkout/CheckoutFlightSummary";
import { CheckoutTermsAcceptance, useTermsValidation } from "@/components/checkout/CheckoutTermsAcceptance";
import CheckoutTrustFooter from "@/components/checkout/CheckoutTrustFooter";
import { useCreateFlightCheckout, type FlightCheckoutParams } from "@/hooks/useFlightBooking";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FLIGHT_MOR_DISCLAIMERS, FLIGHT_CHECKOUT_CLARITY } from "@/config/flightMoRCompliance";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

const STEPS = [
  { label: "Search", completed: true, active: false },
  { label: "Travelers", completed: true, active: false },
  { label: "Review", completed: false, active: true },
  { label: "Confirm", completed: false, active: false },
];

const FlightCheckout = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const checkout = useCreateFlightCheckout();
  const [termsValid, handleTermsChange, triggerValidation] = useTermsValidation();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false);

  const offerRaw = sessionStorage.getItem("zivo_selected_offer");
  const searchRaw = sessionStorage.getItem("zivo_search_params");
  const passengersRaw = sessionStorage.getItem("zivo_passengers");

  const offer: DuffelOffer | null = offerRaw ? JSON.parse(offerRaw) : null;
  const search = searchRaw ? JSON.parse(searchRaw) : null;
  const passengers = passengersRaw ? JSON.parse(passengersRaw) : null;

  const totalPassengers = search ? (search.adults || 1) + (search.children || 0) + (search.infants || 0) : 1;

  useEffect(() => {
    if (!offer || !passengers) navigate("/flights", { replace: true });
  }, [offer, passengers, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Login Required", description: "Please sign in to book a flight.", variant: "destructive" });
      navigate("/login?redirect=/flights/checkout", { replace: true });
    }
  }, [user, authLoading, navigate, toast]);

  const baseFare = offer ? Math.round(offer.price * 0.7) : 0;
  const taxesFees = offer ? offer.price - baseFare : 0;
  const totalPrice = offer ? Math.round(offer.price * totalPassengers) : 0;

  const handlePayClick = useCallback(() => {
    if (!triggerValidation()) {
      toast({ title: "Please accept terms", description: "You must accept the terms and fare rules to continue.", variant: "destructive" });
      return;
    }
    setShowConfirmDialog(true);
    setAcknowledged(false);
  }, [triggerValidation, toast]);

  const handleConfirmPay = useCallback(() => {
    if (submitRef.current || isSubmitting || !offer || !passengers || !search) return;
    submitRef.current = true;
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    const currentBaseFare = Math.round(offer.price * 0.7);
    const currentTaxesFees = offer.price - currentBaseFare;

    const params: FlightCheckoutParams = {
      offerId: offer.id,
      passengers: passengers.map((p: any) => ({
        ...p,
        gender: p.gender as "m" | "f",
      })),
      totalAmount: offer.price,
      baseFare: currentBaseFare,
      taxesFees: currentTaxesFees,
      currency: offer.currency || "USD",
      origin: search.origin,
      destination: search.destination,
      departureDate: search.departureDate,
      returnDate: search.returnDate,
      cabinClass: search.cabinClass,
    };

    checkout.mutate(params, {
      onSuccess: (data) => {
        if (data.url) window.location.href = data.url;
      },
      onError: () => {
        submitRef.current = false;
        setIsSubmitting(false);
      },
    });
  }, [offer, passengers, search, isSubmitting, checkout]);

  if (!offer || !passengers || !search || authLoading) return null;

  const isPaying = isSubmitting || checkout.isPending;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Checkout – ZIVO Flights" description="Complete your flight booking securely." />

      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[hsl(var(--flights))]/4 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-32 relative z-10">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Back + title */}
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} disabled={isPaying} className="shrink-0 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Secure Checkout</h1>
          </div>

          {/* Steps */}
          <CheckoutStepIndicator steps={STEPS} className="mb-6" />

          {/* Flight summary */}
          <CheckoutFlightSummary offer={offer} search={search} className="mb-4" />

          {/* Passengers summary */}
          <Card className="mb-4 bg-card/80 backdrop-blur-xl border-border/40">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-[hsl(var(--flights))]" />
                Travelers ({totalPassengers})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-1.5">
                {passengers.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.given_name} {p.family_name}</span>
                    <span className="text-xs text-muted-foreground truncate ml-2">{p.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <FlightPriceBreakdown
            baseFare={baseFare}
            taxesFees={taxesFees}
            passengers={totalPassengers}
            currency={offer.currency || "USD"}
            className="mb-4"
            showNoHiddenFees
          />

          {/* Pre-payment notice */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-[hsl(var(--flights))]/5 border border-[hsl(var(--flights))]/15"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              {FLIGHT_CHECKOUT_CLARITY.prePayment}
            </p>
          </motion.div>

          {/* Terms acceptance */}
          <CheckoutTermsAcceptance
            onStateChange={handleTermsChange}
            productType="flights"
            className="mb-6"
            disabled={isPaying}
          />

          {/* Pay button */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={handlePayClick}
              disabled={isPaying || !termsValid}
              className="w-full h-14 text-base font-bold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 rounded-2xl shadow-lg transition-all duration-200 min-h-[48px]"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Pay ${totalPrice} {offer.currency || "USD"}
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-[11px] text-muted-foreground text-center mt-2">
            {FLIGHT_MOR_DISCLAIMERS.payment}
          </p>

          {/* Trust footer */}
          <CheckoutTrustFooter className="mt-8" />
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Booking
            </DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p className="font-medium text-foreground">
                You are about to create a real airline booking:
              </p>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Route:</span> <span className="font-semibold">{offer.departure.code} → {offer.arrival.code}</span></p>
                <p><span className="text-muted-foreground">Airline:</span> {offer.airline} {offer.flightNumber}</p>
                <p><span className="text-muted-foreground">Date:</span> {search.departureDate}</p>
                <p><span className="text-muted-foreground">Travelers:</span> {totalPassengers}</p>
                <p><span className="text-muted-foreground">Total:</span> <span className="font-bold text-[hsl(var(--flights))]">${totalPrice} {offer.currency || "USD"}</span></p>
              </div>
              <p className="text-xs text-destructive/80 font-medium">
                ⚠️ This will charge your card and create a non-reversible airline reservation. Cancellation fees may apply.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 py-2">
            <Checkbox
              id="confirm-booking"
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="confirm-booking" className="text-sm text-muted-foreground cursor-pointer leading-snug">
              I understand this is a live booking and my card will be charged immediately.
            </label>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="w-full sm:w-auto rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPay}
              disabled={!acknowledged}
              className="w-full sm:w-auto bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 gap-2 rounded-xl"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Pay ${totalPrice}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FlightCheckout;
