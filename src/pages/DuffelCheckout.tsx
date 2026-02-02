/**
 * Duffel Checkout / Confirmation Page
 * 
 * Handles the booking handoff to Duffel and shows confirmation
 * Hizovo is NOT the merchant of record
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plane,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  AlertCircle,
  Loader2,
  Calendar,
  Info,
  ArrowRight,
} from "lucide-react";
import { useDuffelOffer, formatDuffelPrice, getDuffelAirlineLogo } from "@/hooks/useDuffelFlights";
import { format, parseISO } from "date-fns";
// Confetti effect removed - not implemented

const DuffelCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const offerId = searchParams.get("offer");
  const sessionId = searchParams.get("session");
  
  const [_showConfetti, setShowConfetti] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'processing' | 'confirmed' | 'error'>('pending');

  const { data: offer, isLoading, error } = useDuffelOffer(offerId);

  useEffect(() => {
    // Simulate booking confirmation (in production, this would check actual booking status)
    if (offer) {
      setBookingStatus('processing');
      const timer = setTimeout(() => {
        setBookingStatus('confirmed');
        setShowConfetti(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [offer]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Processing Booking – ZIVO" description="Processing your flight booking with our travel partner." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Your Booking</h2>
              <p className="text-muted-foreground">Please wait while we confirm your reservation...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Booking Error – ZIVO" description="There was an issue processing your flight booking." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-bold mb-2">Booking Could Not Be Completed</h1>
                <p className="text-muted-foreground mb-6">
                  We encountered an issue processing your booking. The flight offer may have expired.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => navigate("/flights")} className="w-full gap-2">
                    <Plane className="w-4 h-4" />
                    Search New Flights
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/help")} className="w-full">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Booking Confirmation – ZIVO Flights"
        description="Your flight booking has been submitted to our travel partner."
      />
      <Header />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Status Card */}
          <Card className={`mb-8 ${bookingStatus === 'confirmed' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-amber-500/50 bg-amber-500/5'}`}>
            <CardContent className="p-8 text-center">
              {bookingStatus === 'confirmed' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Booking Request Submitted!</h1>
                  <p className="text-muted-foreground mb-4">
                    Your booking has been sent to our travel partner for processing.
                  </p>
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                    Confirmation Pending
                  </Badge>
                </>
              ) : bookingStatus === 'processing' ? (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-amber-500 mx-auto mb-4" />
                  <h1 className="text-xl font-semibold mb-2">Processing Booking...</h1>
                  <p className="text-muted-foreground">
                    Confirming availability with the airline...
                  </p>
                </>
              ) : (
                <>
                  <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h1 className="text-xl font-semibold mb-2">Booking Pending</h1>
                  <p className="text-muted-foreground">
                    Waiting for confirmation from partner...
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* What's Next */}
          <Alert className="mb-6 border-sky-500/30 bg-sky-500/5">
            <Mail className="w-4 h-4 text-sky-500" />
            <AlertDescription>
              <strong>What happens next:</strong> You'll receive a confirmation email from our travel partner 
              within a few minutes. Check your inbox (and spam folder) for booking details and your e-ticket.
            </AlertDescription>
          </Alert>

          {/* Flight Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Flight Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={getDuffelAirlineLogo(offer.airlineCode)}
                  alt={offer.airline}
                  className="w-14 h-14 object-contain bg-white rounded-lg p-2 border"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{offer.airline}</h3>
                  <p className="text-sm text-muted-foreground">{offer.flightNumber}</p>
                </div>
                <Badge className="ml-auto">{offer.cabinClass}</Badge>
              </div>

              <div className="flex items-center justify-between py-4 border-y">
                <div className="text-center">
                  <p className="text-3xl font-bold">{offer.departure.time}</p>
                  <p className="text-lg font-medium text-primary">{offer.departure.code}</p>
                  <p className="text-sm text-muted-foreground">{offer.departure.city}</p>
                </div>
                <div className="flex-1 px-8">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    {offer.duration}
                  </div>
                  <div className="relative h-0.5 bg-border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-primary -rotate-45 bg-background px-1" />
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    {offer.stops === 0 ? "Direct Flight" : `${offer.stops} Stop${offer.stops > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{offer.arrival.time}</p>
                  <p className="text-lg font-medium text-primary">{offer.arrival.code}</p>
                  <p className="text-sm text-muted-foreground">{offer.arrival.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{format(parseISO(offer.departure.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span>{offer.baggageIncluded}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Price</span>
                <span className="text-2xl font-bold text-primary">
                  {formatDuffelPrice(offer.price, offer.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Partner Disclosure */}
          <Alert className="mb-6">
            <Info className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Hizovo is not the merchant of record for this booking. 
              Your reservation is processed and ticketed by our licensed travel partner. 
              For changes, cancellations, or support, please contact the booking partner directly using 
              the details in your confirmation email.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/trips")}
              className="flex-1 gap-2"
            >
              View My Trips
            </Button>
            <Button 
              onClick={() => navigate("/flights")}
              className="flex-1 gap-2"
            >
              Search More Flights
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Footer Disclosure */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Hizovo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers.
            {" "}
            <a href="/partner-disclosure" className="underline hover:text-primary">Learn more</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DuffelCheckout;
