/**
 * Flight Checkout Page — /flights/checkout
 * Shows booking summary and initiates Stripe payment
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, Shield, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  // Estimate base fare vs taxes (roughly 70/30 split if not provided)
  const baseFare = Math.round(offer.price * 0.7);
  const taxesFees = offer.price - baseFare;

  const handlePay = () => {
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
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Checkout – ZIVO Flights" description="Complete your flight booking." />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Review & Pay</h1>
          </div>

          {/* Flight details */}
          <Card className="mb-4 border-[hsl(var(--flights))]/20">
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
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Travelers ({totalPassengers})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {passengers.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.given_name} {p.family_name}</span>
                    <span className="text-muted-foreground">{p.email}</span>
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
            className="mb-6"
            showNoHiddenFees
          />

          {/* Pay button */}
          <Button
            size="lg"
            onClick={handlePay}
            disabled={checkout.isPending}
            className="w-full h-12 text-base font-semibold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90"
          >
            {checkout.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Pay ${Math.round(offer.price * totalPassengers)}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Secure payment via Stripe. Your ticket will be issued after payment.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightCheckout;
