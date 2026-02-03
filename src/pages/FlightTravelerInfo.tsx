/**
 * Flight Traveler Info Page
 * 
 * Collects passenger details before ZIVO checkout
 * ZIVO is the Merchant of Record - internal Stripe payment
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Clock,
  ChevronLeft,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useDuffelOffer, formatDuffelPrice, getDuffelAirlineLogo } from "@/hooks/useDuffelFlights";
import { supabase } from "@/integrations/supabase/client";
import { getSearchSessionId } from "@/config/trackingParams";
import { useToast } from "@/hooks/use-toast";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";

interface PassengerForm {
  title: string;
  given_name: string;
  family_name: string;
  born_on: string;
  email: string;
  phone_number: string;
  gender: string;
}

const FlightTravelerInfo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const offerId = searchParams.get("offer");
  const passengerCount = parseInt(searchParams.get("passengers") || "1");
  
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch offer details
  const { data: offer, isLoading: offerLoading, error: offerError } = useDuffelOffer(offerId);

  // Initialize passenger forms
  useEffect(() => {
    if (passengerCount > 0 && passengers.length === 0) {
      setPassengers(
        Array(passengerCount).fill(null).map(() => ({
          title: "",
          given_name: "",
          family_name: "",
          born_on: "",
          email: "",
          phone_number: "",
          gender: "",
        }))
      );
    }
  }, [passengerCount, passengers.length]);

  const updatePassenger = (index: number, field: keyof PassengerForm, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = (): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.title || !p.given_name || !p.family_name || !p.born_on || !p.email) {
        setError(`Please complete all required fields for Passenger ${i + 1}`);
        return false;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        setError(`Please enter a valid email for Passenger ${i + 1}`);
        return false;
      }
    }
    if (!consentGiven) {
      setError("Please agree to the Terms and Conditions and Airline Rules");
      return false;
    }
    return true;
  };

  const handleContinueToPayment = async () => {
    setError(null);
    
    if (!validateForm()) return;
    if (!offer) {
      setError("Offer not found. Please go back and select a flight again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store traveler info in database
      const sessionId = getSearchSessionId();
      
      // Insert each traveler
      for (const passenger of passengers) {
        await supabase.from('travelers').insert({
          session_id: sessionId,
          full_name: `${passenger.given_name} ${passenger.family_name}`,
          email: passenger.email,
          phone: passenger.phone_number || null,
          consent_given: consentGiven,
          consent_given_at: new Date().toISOString(),
        });
      }

      // Store passengers for checkout page
      sessionStorage.setItem('flightPassengers', JSON.stringify(passengers));
      sessionStorage.setItem('flightOfferId', offer.id);

      toast({
        title: "Continuing to checkout...",
        description: "You'll complete your booking on our secure checkout.",
      });

      // Navigate to ZIVO checkout (MoR flow - no partner redirect)
      navigate(`/flights/checkout?offer=${offer.id}&passengers=${passengerCount}&session=${sessionId}`);

    } catch (err) {
      console.error("[TravelerInfo] Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (offerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading flight details...</p>
            </div>
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
        <SEOHead title="Flight Not Found – ZIVO" description="The flight offer has expired or is no longer available." />
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-bold mb-2">Flight Offer Expired</h1>
                <p className="text-muted-foreground mb-6">
                  This flight offer has expired or is no longer available. Please search again.
                </p>
                <Button onClick={() => navigate("/flights")} className="gap-2">
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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Passenger Details – ${offer.departure.code} to ${offer.arrival.code} | ZIVO`}
        description="Enter passenger details to continue with your flight booking."
      />
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Results
          </Button>

          {/* Flight Summary */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={getDuffelAirlineLogo(offer.airlineCode)}
                  alt={offer.airline}
                  className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div>
                  <h2 className="text-lg font-semibold">{offer.airline}</h2>
                  <p className="text-sm text-muted-foreground">{offer.flightNumber}</p>
                </div>
                <Badge className="ml-auto">{offer.cabinClass}</Badge>
              </div>

              <div className="flex items-center justify-between">
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
                    {offer.stops === 0 ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{offer.arrival.time}</p>
                  <p className="text-sm font-medium text-primary">{offer.arrival.code}</p>
                  <p className="text-xs text-muted-foreground">{offer.arrival.city}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Date: {format(parseISO(offer.departure.date), "EEE, MMM d, yyyy")}</p>
                  <p>Passengers: {passengerCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatDuffelPrice(offer.price, offer.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passenger Forms */}
          <div className="space-y-6">
            {passengers.map((passenger, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    Passenger {index + 1}
                  </CardTitle>
                  <CardDescription>
                    Enter details exactly as they appear on the travel document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Title *</Label>
                      <Select
                        value={passenger.title}
                        onValueChange={(v) => updatePassenger(index, "title", v)}
                      >
                        <SelectTrigger id={`title-${index}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">Mr</SelectItem>
                          <SelectItem value="ms">Ms</SelectItem>
                          <SelectItem value="mrs">Mrs</SelectItem>
                          <SelectItem value="miss">Miss</SelectItem>
                          <SelectItem value="dr">Dr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`gender-${index}`}>Gender *</Label>
                      <Select
                        value={passenger.gender}
                        onValueChange={(v) => updatePassenger(index, "gender", v)}
                      >
                        <SelectTrigger id={`gender-${index}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">Male</SelectItem>
                          <SelectItem value="f">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`dob-${index}`}>Date of Birth *</Label>
                      <Input
                        id={`dob-${index}`}
                        type="date"
                        value={passenger.born_on}
                        onChange={(e) => updatePassenger(index, "born_on", e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`fname-${index}`}>First Name *</Label>
                      <Input
                        id={`fname-${index}`}
                        placeholder="As on passport"
                        value={passenger.given_name}
                        onChange={(e) => updatePassenger(index, "given_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lname-${index}`}>Last Name *</Label>
                      <Input
                        id={`lname-${index}`}
                        placeholder="As on passport"
                        value={passenger.family_name}
                        onChange={(e) => updatePassenger(index, "family_name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`email-${index}`}>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id={`email-${index}`}
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10"
                          value={passenger.email}
                          onChange={(e) => updatePassenger(index, "email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`phone-${index}`}>Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id={`phone-${index}`}
                          type="tel"
                          placeholder="+1 555 123 4567"
                          className="pl-10"
                          value={passenger.phone_number}
                          onChange={(e) => updatePassenger(index, "phone_number", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Consent and Partner Disclosure */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <Alert className="mb-4 border-sky-500/30 bg-sky-500/5">
                <Info className="w-4 h-4 text-sky-500" />
                <AlertDescription className="text-sm">
                  <strong>Secure ZIVO Checkout:</strong> You'll complete your booking securely on ZIVO. 
                  {FLIGHT_DISCLAIMERS.ticketing}
                </AlertDescription>
              </Alert>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="consent"
                    className="text-sm font-medium leading-relaxed cursor-pointer"
                  >
                    I agree to the <a href="/terms" className="underline text-primary hover:text-primary/80">Terms and Conditions</a> and <a href="/legal/flight-terms" className="underline text-primary hover:text-primary/80">Airline Rules</a>. *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Your details will be shared securely with our travel partner to complete your booking. 
                    View our{" "}
                    <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
                    {" "}and{" "}
                    <a href="/partner-disclosure" className="underline hover:text-primary">Partner Disclosure</a>.
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="sm:flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinueToPayment}
                  disabled={isSubmitting || !consentGiven}
                  className="sm:flex-[2] gap-2 bg-gradient-to-r from-primary to-sky-600"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      {FLIGHT_CTA_TEXT.proceedToPayment}
                    </>
                  )}
                </Button>
              </div>

              {/* CTA Disclosure */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                {FLIGHT_DISCLAIMERS.price}
              </p>
            </CardContent>
          </Card>

          {/* Footer Disclosure */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            {FLIGHT_DISCLAIMERS.ticketing}
            {" "}
            <a href="/partner-disclosure" className="underline hover:text-primary">Learn more</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightTravelerInfo;
