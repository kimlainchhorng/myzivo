import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  Clock,
  Luggage,
  ChevronLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info,
  MapPin,
  Calendar,
  Users,
  Armchair,
  Utensils,
  Wifi,
  Tv,
  PlugZap,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";
import type { GeneratedFlight } from "@/data/flightGenerator";
import { trackAffiliateClick, buildAffiliateUrl } from "@/lib/affiliateTracking";

const FlightDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [flight, setFlight] = useState<GeneratedFlight | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);

  useEffect(() => {
    const storedFlight = sessionStorage.getItem("selectedFlight");
    const storedParams = sessionStorage.getItem("flightSearchParams");

    if (storedFlight) {
      setFlight(JSON.parse(storedFlight));
    }
    if (storedParams) {
      setSearchParams(JSON.parse(storedParams));
    }
  }, []);

  if (!flight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Flight not found</h2>
            <p className="text-muted-foreground mb-4">Please search for flights again</p>
            <Button onClick={() => navigate("/book-flight")}>Search Flights</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Build affiliate URL and track click
  const handleBookNow = () => {
    // Track affiliate click
    trackAffiliateClick({
      userId: undefined, // Would come from auth context
      flightId: flight.id,
      airline: flight.airline,
      airlineCode: flight.airlineCode,
      origin: flight.departure.code,
      destination: flight.arrival.code,
      price: flight.price,
      passengers: parseInt(searchParams?.passengers || "1"),
      cabinClass: searchParams?.cabinClass || "economy",
      affiliatePartner: "skyscanner",
      referralUrl: window.location.href,
      source: "flight_details",
    });

    // Build and open affiliate URL
    const url = buildAffiliateUrl({
      origin: flight.departure.code,
      destination: flight.arrival.code,
      departDate: searchParams?.departDate || format(new Date(), "yyyy-MM-dd"),
      returnDate: searchParams?.returnDate,
      passengers: parseInt(searchParams?.passengers || "1"),
      cabinClass: searchParams?.cabinClass || "economy",
    });
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const amenityList = flight.amenities || [];
  const amenities = [
    { icon: Wifi, label: "WiFi", available: amenityList.includes("wifi") || amenityList.includes("Wi-Fi") },
    { icon: Tv, label: "Entertainment", available: amenityList.includes("entertainment") || amenityList.includes("IFE") },
    { icon: Utensils, label: "Meals", available: amenityList.includes("meals") || amenityList.includes("food") },
    { icon: PlugZap, label: "Power Outlets", available: amenityList.includes("power") || amenityList.includes("USB") },
    { icon: Armchair, label: "Extra Legroom", available: amenityList.includes("legroom") || flight.price > 400 },
  ];

  const baggageInfo = {
    carryOn: { allowed: true, weight: "7kg", size: "55x40x20 cm" },
    checked: { 
      allowed: flight.price > 300, 
      weight: flight.price > 500 ? "2 x 23kg" : "1 x 23kg",
      fee: flight.price > 500 ? "Included" : flight.price > 300 ? "Included" : "$30"
    },
  };

  const totalPrice = flight.price * parseInt(searchParams?.passengers || "1");
  const taxes = totalPrice * 0.12;
  const grandTotal = totalPrice + taxes;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Results
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flight Overview Card */}
              <Card className="overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
                <CardContent className="p-6">
                  {/* Airline Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={getAirlineLogo(flight.airlineCode)}
                        alt={flight.airline}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{flight.airline}</h1>
                      <p className="text-muted-foreground">Flight {flight.flightNumber}</p>
                    </div>
                    {flight.isRealPrice && (
                      <Badge className="ml-auto bg-emerald-500/20 text-emerald-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Price
                      </Badge>
                    )}
                  </div>

                  {/* Flight Route */}
                  <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold">{flight.departure.time}</p>
                      <p className="text-xl font-semibold text-sky-500">{flight.departure.code}</p>
                      <p className="text-sm text-muted-foreground">{flight.departure.city}</p>
                    </div>

                    <div className="flex-1 px-8">
                      <div className="relative flex items-center justify-center">
                        <div className="flex-1 border-t-2 border-dashed border-sky-500/30" />
                        <div className="mx-4 p-2 rounded-full bg-sky-500/10">
                          <Plane className="w-6 h-6 text-sky-500 -rotate-45" />
                        </div>
                        <div className="flex-1 border-t-2 border-dashed border-sky-500/30" />
                      </div>
                      <div className="flex justify-center items-center gap-4 mt-2">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {flight.duration}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "gap-1",
                            flight.stops === 0 ? "text-emerald-500 border-emerald-500/50" : "text-amber-500 border-amber-500/50"
                          )}
                        >
                          {flight.stops === 0 ? "Direct" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-4xl font-bold">{flight.arrival.time}</p>
                      <p className="text-xl font-semibold text-sky-500">{flight.arrival.code}</p>
                      <p className="text-sm text-muted-foreground">{flight.arrival.city}</p>
                    </div>
                  </div>

                  {/* Date & Passengers */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{searchParams?.departDate ? format(parseISO(searchParams.departDate), "EEEE, MMMM d, yyyy") : "Date not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{searchParams?.passengers || 1} Passenger{parseInt(searchParams?.passengers || "1") > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layover Info (if stops > 0) */}
              {flight.stops > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      Layover Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-500">Connection in Transit</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            This flight includes {flight.stops} stop{flight.stops > 1 ? "s" : ""}. 
                            Layover duration and location details will be provided by the airline after booking.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Estimated layover time: {Math.floor(Math.random() * 3) + 1}h {Math.floor(Math.random() * 50) + 10}m
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Baggage Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Luggage className="w-5 h-5 text-sky-500" />
                    Baggage Allowance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Carry-on */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Carry-on Bag</span>
                        <Badge className="bg-emerald-500/20 text-emerald-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Included
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Weight: {baggageInfo.carryOn.weight}</p>
                        <p>Max Size: {baggageInfo.carryOn.size}</p>
                      </div>
                    </div>

                    {/* Checked Bag */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Checked Bag</span>
                        <Badge className={baggageInfo.checked.allowed 
                          ? "bg-emerald-500/20 text-emerald-500" 
                          : "bg-muted text-muted-foreground"
                        }>
                          {baggageInfo.checked.allowed ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {baggageInfo.checked.fee}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Not Included
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Weight: {baggageInfo.checked.weight}</p>
                        <p>Additional bags available for purchase</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fare Type & Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Armchair className="w-5 h-5 text-sky-500" />
                    Fare Type & Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Badge className="text-base px-4 py-2 bg-sky-500/20 text-sky-500 border-sky-500/30">
                      {searchParams?.cabinClass === "first" ? "First Class" :
                       searchParams?.cabinClass === "business" ? "Business Class" :
                       searchParams?.cabinClass === "premium" ? "Premium Economy" : "Economy"} Fare
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity.label}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all",
                          amenity.available
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "bg-muted/50 border border-border opacity-50"
                        )}
                      >
                        <amenity.icon className={cn(
                          "w-5 h-5 mx-auto mb-1",
                          amenity.available ? "text-emerald-500" : "text-muted-foreground"
                        )} />
                        <p className="text-xs font-medium">{amenity.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {amenity.available ? "Available" : "Not Available"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Flight ({searchParams?.passengers || 1} × ${flight.price})
                      </span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-sky-500">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 inline mr-1" />
                    You'll be redirected to complete your booking with our trusted partner.
                  </div>

                  {/* Book Button */}
                  <Button
                    onClick={handleBookNow}
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white font-bold text-lg shadow-xl shadow-sky-500/30 gap-2"
                  >
                    Continue to Booking
                    <ExternalLink className="w-5 h-5" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Secure booking • Best price guaranteed
                  </p>

                  {/* Affiliate Disclosure */}
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                      <a href="/affiliate-disclosure" className="underline hover:text-foreground">
                        Affiliate Disclosure
                      </a>: We may earn a commission when you book through our partner links at no extra cost to you.
                    </p>
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

export default FlightDetails;
