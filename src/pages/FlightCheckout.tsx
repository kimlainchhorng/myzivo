/**
 * Flight Checkout Page — /flights/checkout
 * LIVE production-safe: confirmation modal, duplicate-click protection, idempotency
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, Shield, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import FlightPriceBreakdown from "@/components/flight/FlightPriceBreakdown";
import { useCreateFlightCheckout, type FlightCheckoutParams } from "@/hooks/useFlightBooking";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

const FlightCheckout = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const checkout = useCreateFlightCheckout();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitRef = useRef(false); // idempotency guard

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

  if (!offer || !passengers || !search || authLoading) return null;

  const baseFare = Math.round(offer.price * 0.7);
  const taxesFees = offer.price - baseFare;
  const totalPrice = Math.round(offer.price * totalPassengers);

  const handlePayClick = () => {
    setShowConfirmDialog(true);
    setAcknowledged(false);
  };

  const handleConfirmPay = useCallback(() => {
    // Idempotency: prevent duplicate submissions
    if (submitRef.current || isSubmitting) return;
    submitRef.current = true;
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    const params: FlightCheckoutParams = {
      offerId: offer.id,
      passengers: passengers.map((p: any) => ({
        ...p,
        gender: p.gender as 'm' | 'f',
      })),
      totalAmount: offer.price,
      baseFare,
      taxesFees,
      currency: offer.currency || "USD",
      origin: search.origin,
      destination: search.destination,
      departureDate: search.departureDate,
      returnDate: search.returnDate,
      cabinClass: search.cabinClass,
    };

    checkout.mutate(params, {
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: () => {
        // Allow retry on error
        submitRef.current = false;
        setIsSubmitting(false);
      },
    });
  }, [offer, passengers, search, baseFare, taxesFees, isSubmitting, checkout]);

  const isPaying = isSubmitting || checkout.isPending;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Checkout – ZIVO Flights" description="Complete your flight booking." />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0" disabled={isPaying}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Review & Pay</h1>
          </div>

          {/* Flight details */}
          <Card className="mb-4 border-[hsl(var(--flights))]/20 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plane className="w-5 h-5 text-[hsl(var(--flights))]" />
                Flight Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{offer.departure.code} → {offer.arrival.code}</p>
                  <p className="text-sm text-muted-foreground">{offer.airline} · {offer.flightNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{offer.departure.time} → {offer.arrival.time}</p>
                  <p className="text-sm text-muted-foreground">{offer.duration} · {offer.stops === 0 ? "Direct" : `${offer.stops} stop`}</p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">{search.departureDate}{search.returnDate ? ` — ${search.returnDate}` : ""}</p>
            </CardContent>
          </Card>

          {/* Passengers summary */}
          <Card className="mb-4 bg-card/80 backdrop-blur-xl border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Travelers ({totalPassengers})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {passengers.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.given_name} {p.family_name}</span>
                    <span className="text-muted-foreground truncate ml-2">{p.email}</span>
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

          {/* LIVE booking warning */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
          >
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-500">Live Booking</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will create a real airline booking. Your card will be charged{" "}
                  <span className="font-semibold text-foreground">${totalPrice} {offer.currency || "USD"}</span>.
                  Cancellation and change policies apply per airline rules.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Pay button */}
          <Button
            size="lg"
            onClick={handlePayClick}
            disabled={isPaying}
            className="w-full h-12 text-base font-semibold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 active:scale-[0.98] transition-all duration-200"
          >
            {isPaying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Pay ${totalPrice}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Secure payment via Stripe. Your ticket will be issued after payment.
          </p>
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
                ⚠️ This will charge your card and create a non-reversible airline reservation.
                Cancellation fees may apply.
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
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPay}
              disabled={!acknowledged}
              className="w-full sm:w-auto bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 gap-2"
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
