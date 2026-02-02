/**
 * Traveler Info Page
 * Collects traveler details before partner checkout handoff
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";
import TravelerInfoForm, { TravelerFormData } from "@/components/booking/TravelerInfoForm";
import TravelOfferSummary from "@/components/booking/TravelOfferSummary";
import BookingStepper from "@/components/booking/BookingStepper";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCreateBooking,
  useLogPartnerRedirect,
  usePartnerConfigs,
  TravelServiceType,
} from "@/hooks/useTravelBookings";
import SEOHead from "@/components/SEOHead";

interface OfferData {
  partnerName: string;
  price: number;
  currency: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  airline?: string;
  cabinClass?: string;
  passengers?: number;
  stops?: number;
  duration?: string;
  hotelName?: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  guests?: number;
  nights?: number;
  carModel?: string;
  carType?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  days?: number;
  features?: string[];
}

// Mock offer data - in production this would come from search state or session
const getMockOfferData = (serviceType: TravelServiceType, searchParams: URLSearchParams): OfferData => {
  const base = {
    partnerName: searchParams.get("partner") || "Travel Partner",
    price: parseFloat(searchParams.get("price") || "299"),
    currency: searchParams.get("currency") || "USD",
  };

  switch (serviceType) {
    case "flights":
      return {
        ...base,
        origin: searchParams.get("origin") || "JFK",
        destination: searchParams.get("destination") || "LAX",
        departureDate: searchParams.get("departure") || new Date().toISOString(),
        returnDate: searchParams.get("return") || undefined,
        airline: searchParams.get("airline") || "United Airlines",
        cabinClass: searchParams.get("cabin") || "Economy",
        passengers: parseInt(searchParams.get("passengers") || "1"),
        stops: parseInt(searchParams.get("stops") || "0"),
        duration: "5h 30m",
      };
    case "hotels":
      return {
        ...base,
        hotelName: searchParams.get("hotel") || "Grand Plaza Hotel",
        location: searchParams.get("location") || "New York City",
        checkIn: searchParams.get("checkin") || new Date().toISOString(),
        checkOut: searchParams.get("checkout") || new Date().toISOString(),
        roomType: searchParams.get("room") || "Deluxe King Room",
        guests: parseInt(searchParams.get("guests") || "2"),
        nights: parseInt(searchParams.get("nights") || "3"),
      };
    case "cars":
      return {
        ...base,
        carModel: searchParams.get("car") || "Toyota Camry",
        carType: searchParams.get("type") || "Standard",
        pickupLocation: searchParams.get("pickup") || "Los Angeles Airport",
        dropoffLocation: searchParams.get("dropoff") || "Los Angeles Airport",
        pickupDate: searchParams.get("pickupDate") || new Date().toISOString(),
        dropoffDate: searchParams.get("dropoffDate") || new Date().toISOString(),
        days: parseInt(searchParams.get("days") || "3"),
        features: ["Automatic", "A/C", "4 Doors", "Bluetooth"],
      };
    default:
      return base;
  }
};

export default function TravelerInfoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Get service type from URL
  const serviceType = (searchParams.get("type") as TravelServiceType) || "flights";
  const offerId = searchParams.get("offerId");
  const returnUrl = searchParams.get("returnUrl");

  // Hooks
  const { data: partnerConfigs } = usePartnerConfigs(serviceType);
  const createBooking = useCreateBooking();
  const logRedirect = useLogPartnerRedirect();

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get offer data
  const offerData = getMockOfferData(serviceType, searchParams);

  // Pre-fill form with user data if logged in
  const defaultFormValues = {
    fullName: user?.user_metadata?.full_name as string | undefined,
    email: user?.email,
    phone: user?.user_metadata?.phone as string | undefined,
  };

  const handleSubmit = async (data: TravelerFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get partner config
      const partner = partnerConfigs?.[0];
      if (!partner) {
        throw new Error("No partner configured for this service");
      }

      // Build redirect URL
      let redirectUrl = returnUrl || partner.checkout_url_template;

      // Replace placeholders in URL template
      if (serviceType === "flights") {
        redirectUrl = redirectUrl
          .replace("{origin}", offerData.origin || "")
          .replace("{destination}", offerData.destination || "")
          .replace("{departure}", offerData.departureDate || "")
          .replace("{return}", offerData.returnDate || "");
      } else if (serviceType === "hotels") {
        redirectUrl = redirectUrl
          .replace("{dest_id}", offerData.location || "")
          .replace("{checkin}", offerData.checkIn || "")
          .replace("{checkout}", offerData.checkOut || "");
      } else if (serviceType === "cars") {
        redirectUrl = redirectUrl
          .replace("{pickup}", offerData.pickupLocation || "")
          .replace("{dropoff}", offerData.dropoffLocation || "")
          .replace("{pickup_date}", offerData.pickupDate || "")
          .replace("{dropoff_date}", offerData.dropoffDate || "");
      }

      // Create booking record
      const booking = await createBooking.mutateAsync({
        offerId: offerId || crypto.randomUUID(),
        serviceType,
        travelerInfo: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          consentSharing: true,
        },
        partnerRedirectUrl: redirectUrl,
      });

      // Log the redirect
      await logRedirect.mutateAsync({
        offerId: booking.id,
        partnerId: partner.partner_id,
        partnerName: partner.partner_name,
        searchType: serviceType,
        redirectUrl,
        checkoutMode: partner.checkout_mode,
      });

      // Navigate to partner checkout via outbound page
      const outboundUrl = new URL("/out", window.location.origin);
      outboundUrl.searchParams.set("partner", partner.partner_id);
      outboundUrl.searchParams.set("name", partner.partner_name);
      outboundUrl.searchParams.set("product", serviceType);
      outboundUrl.searchParams.set("page", "traveler-info");
      outboundUrl.searchParams.set("url", encodeURIComponent(redirectUrl));
      outboundUrl.searchParams.set("bookingId", booking.id);

      window.location.href = outboundUrl.toString();
    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Failed to process booking");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Traveler Information - ZIVO"
        description="Enter your details to complete your travel booking."
        noIndex
      />

      <div className="min-h-screen bg-background">
        <NavBar />

        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Stepper */}
            <BookingStepper currentStep="traveler" className="mb-8" />

            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Traveler Information
              </h1>
              <p className="text-muted-foreground">
                Enter your details to continue to partner checkout
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <TravelerInfoForm
                      onSubmit={handleSubmit}
                      isLoading={isProcessing}
                      defaultValues={defaultFormValues}
                    />
                  </CardContent>
                </Card>

                {/* Guest notice */}
                {!user && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>{" "}
                    to save your trip and access it later
                  </p>
                )}
              </div>

              {/* Summary Column */}
              <div className="lg:col-span-2 space-y-4">
                <TravelOfferSummary
                  serviceType={serviceType}
                  offerData={offerData}
                />

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4 rounded-xl bg-muted/50">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
