import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Star,
  Shield,
  Zap,
  RefreshCw,
  CreditCard,
  Percent,
  Heart,
  Share2,
  Printer,
  Bell,
  ChevronDown,
  Sparkles,
  Award,
  Globe,
  Lock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";
import type { GeneratedFlight } from "@/data/flightGenerator";
import { trackAffiliateClick, buildAffiliateUrl } from "@/lib/affiliateTracking";
import { FLIGHT_DISCLAIMERS, FLIGHT_CTA_TEXT } from "@/config/flightCompliance";

const FlightDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [flight, setFlight] = useState<GeneratedFlight | null>(null);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);

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
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Flight not found</h2>
              <p className="text-muted-foreground mb-6">This flight may have expired or been removed. Please search for flights again.</p>
              <Button onClick={() => navigate("/flights")} size="lg" className="gap-2">
                <Plane className="w-5 h-5" />
                Search Flights
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBookNow = () => {
    trackAffiliateClick({
      userId: undefined,
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
    { icon: Wifi, label: "In-flight WiFi", available: amenityList.includes("wifi") || amenityList.includes("Wi-Fi"), desc: "Stay connected" },
    { icon: Tv, label: "Entertainment", available: amenityList.includes("entertainment") || amenityList.includes("IFE"), desc: "Movies & TV" },
    { icon: Utensils, label: "Meal Service", available: amenityList.includes("meals") || amenityList.includes("food"), desc: "Complimentary" },
    { icon: PlugZap, label: "Power Outlets", available: amenityList.includes("power") || amenityList.includes("USB"), desc: "USB & AC" },
    { icon: Armchair, label: "Extra Legroom", available: amenityList.includes("legroom") || flight.price > 400, desc: "34\" pitch" },
  ];

  const cabinClassLabel = searchParams?.cabinClass === "first" ? "First Class" :
    searchParams?.cabinClass === "business" ? "Business Class" :
    searchParams?.cabinClass === "premium" ? "Premium Economy" : "Economy";

  const baggageInfo = {
    carryOn: { allowed: true, weight: "7kg / 15lbs", size: "55x40x20 cm" },
    personal: { allowed: true, weight: "3kg / 7lbs", size: "40x30x15 cm" },
    checked: { 
      allowed: flight.price > 300, 
      weight: flight.price > 500 ? "2 x 23kg" : "1 x 23kg",
      fee: flight.price > 500 ? "Included" : flight.price > 300 ? "Included" : "From $30"
    },
  };

  const passengerCount = parseInt(searchParams?.passengers || "1");
  const totalPrice = flight.price * passengerCount;
  const taxes = totalPrice * 0.12;
  const serviceFee = 0;
  const grandTotal = totalPrice + taxes + serviceFee;

  const airlineFeatures = [
    { label: "On-time Performance", value: "87%", icon: Clock },
    { label: "Customer Rating", value: "4.5/5", icon: Star },
    { label: "Fleet Age", value: "5.2 yrs", icon: Plane },
    { label: "Skytrax Rating", value: "4★", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-20">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-sky-950 via-blue-900 to-slate-900 py-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-white/80 hover:text-white hover:bg-white/10 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Results
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={getAirlineLogo(flight.airlineCode)}
                    alt={flight.airline}
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">{flight.airline}</h1>
                  <p className="text-white/70">Flight {flight.flightNumber}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {flight.isRealPrice && (
                      <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
                        <Zap className="w-3 h-3 mr-1" />
                        Live Price
                      </Badge>
                    )}
                    <Badge className="bg-sky-500/30 text-sky-300 border-sky-500/50">
                      {cabinClassLabel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Heart className={cn("w-5 h-5", isSaved && "fill-red-500 text-red-500")} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Bell className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Flight Route Hero */}
            <div className="mt-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-5xl lg:text-6xl font-bold text-white">{flight.departure.time}</p>
                  <p className="text-2xl font-semibold text-sky-400">{flight.departure.code}</p>
                  <p className="text-white/70">{flight.departure.city}</p>
                </div>

                <div className="flex-1 max-w-md">
                  <div className="relative flex items-center justify-center">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-sky-500/30 border-2 border-sky-400 flex items-center justify-center">
                        <Plane className="w-7 h-7 text-sky-400 -rotate-45" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Badge className="bg-white/10 text-white border-white/20">
                      <Clock className="w-3 h-3 mr-1" />
                      {flight.duration}
                    </Badge>
                    <Badge className={cn(
                      "border",
                      flight.stops === 0 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    )}>
                      {flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                    </Badge>
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-5xl lg:text-6xl font-bold text-white">{flight.arrival.time}</p>
                  <p className="text-2xl font-semibold text-sky-400">{flight.arrival.code}</p>
                  <p className="text-white/70">{flight.arrival.city}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span>{searchParams?.departDate ? format(parseISO(searchParams.departDate), "EEEE, MMMM d, yyyy") : "Date not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-4 h-4" />
                  <span>{passengerCount} Passenger{passengerCount > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Globe className="w-4 h-4" />
                  <span>{searchParams?.tripType === "roundtrip" ? "Round Trip" : "One Way"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs Navigation */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12">
                  <TabsTrigger value="overview" className="gap-2">
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="baggage" className="gap-2">
                    <Luggage className="w-4 h-4" />
                    <span className="hidden sm:inline">Baggage</span>
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="gap-2">
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline">Amenities</span>
                  </TabsTrigger>
                  <TabsTrigger value="policies" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Policies</span>
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Layover Info */}
                  {flight.stops > 0 && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-500">
                          <MapPin className="w-5 h-5" />
                          Connection Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold">This flight has {flight.stops} stop{flight.stops > 1 ? "s" : ""}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Estimated layover: {Math.floor(Math.random() * 3) + 1}h {Math.floor(Math.random() * 50) + 10}m
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Connection details and gate information will be provided in your booking confirmation.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Airline Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-sky-500" />
                        Airline Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {airlineFeatures.map((feature) => (
                          <div key={feature.label} className="text-center p-4 rounded-xl bg-muted/50">
                            <feature.icon className="w-6 h-6 mx-auto mb-2 text-sky-500" />
                            <p className="text-2xl font-bold">{feature.value}</p>
                            <p className="text-xs text-muted-foreground">{feature.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Amenities Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sky-500" />
                        What's Included
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.label}
                            className={cn(
                              "p-4 rounded-xl text-center transition-all",
                              amenity.available
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "bg-muted/50 border border-border opacity-60"
                            )}
                          >
                            <amenity.icon className={cn(
                              "w-6 h-6 mx-auto mb-2",
                              amenity.available ? "text-emerald-500" : "text-muted-foreground"
                            )} />
                            <p className="text-xs font-medium">{amenity.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Baggage Tab */}
                <TabsContent value="baggage" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Luggage className="w-5 h-5 text-sky-500" />
                        Baggage Allowance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Personal Item */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Luggage className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <span className="font-semibold">Personal Item</span>
                              <p className="text-xs text-muted-foreground">Small bag under seat</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Free
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Max Weight: {baggageInfo.personal.weight}</p>
                          <p>Max Size: {baggageInfo.personal.size}</p>
                        </div>
                      </div>

                      {/* Carry-on */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <Luggage className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <span className="font-semibold">Carry-on Bag</span>
                              <p className="text-xs text-muted-foreground">Overhead bin</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Included
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Max Weight: {baggageInfo.carryOn.weight}</p>
                          <p>Max Size: {baggageInfo.carryOn.size}</p>
                        </div>
                      </div>

                      {/* Checked Bag */}
                      <div className={cn(
                        "p-4 rounded-xl border",
                        baggageInfo.checked.allowed 
                          ? "bg-emerald-500/10 border-emerald-500/30" 
                          : "bg-muted/50 border-border"
                      )}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              baggageInfo.checked.allowed ? "bg-emerald-500/20" : "bg-muted"
                            )}>
                              <Luggage className={cn(
                                "w-5 h-5",
                                baggageInfo.checked.allowed ? "text-emerald-500" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <span className="font-semibold">Checked Baggage</span>
                              <p className="text-xs text-muted-foreground">Hold luggage</p>
                            </div>
                          </div>
                          <Badge className={baggageInfo.checked.allowed 
                            ? "bg-emerald-500 text-white" 
                            : "bg-muted text-muted-foreground"
                          }>
                            {baggageInfo.checked.allowed ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> {baggageInfo.checked.fee}</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" /> Extra Fee</>
                            )}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Allowance: {baggageInfo.checked.weight}</p>
                          <p>Extra bags available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Amenities Tab */}
                <TabsContent value="amenities" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Armchair className="w-5 h-5 text-sky-500" />
                        {cabinClassLabel} Amenities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.label}
                            className={cn(
                              "p-4 rounded-xl flex items-center gap-4 transition-all",
                              amenity.available
                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                : "bg-muted/50 border border-border"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                              amenity.available ? "bg-emerald-500/20" : "bg-muted"
                            )}>
                              <amenity.icon className={cn(
                                "w-6 h-6",
                                amenity.available ? "text-emerald-500" : "text-muted-foreground"
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{amenity.label}</p>
                              <p className="text-sm text-muted-foreground">{amenity.desc}</p>
                            </div>
                            {amenity.available ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-sky-500" />
                        Booking Policies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-semibold">Free Cancellation</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Cancel for free within 24 hours of booking</p>
                      </div>
                      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <RefreshCw className="w-5 h-5 text-sky-500" />
                          <span className="font-semibold">Flexible Changes</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Change your flight for a fee (fare difference may apply)</p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold">Secure Payment</span>
                        </div>
                        <p className="text-sm text-muted-foreground">All payments are encrypted and secure</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 overflow-hidden shadow-xl">
                <div className="h-2 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span>Price Summary</span>
                    <Badge className="bg-emerald-500/20 text-emerald-500">
                      <Percent className="w-3 h-3 mr-1" />
                      Best Deal
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Flight × {passengerCount} ({cabinClassLabel})
                      </span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-500">
                      <span>Service Fee</span>
                      <span>Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-sky-500">${grandTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      ${(grandTotal / passengerCount).toFixed(2)} per person
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Shield className="w-3 h-3" /> Secure
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Award className="w-3 h-3" /> Best Price
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Zap className="w-3 h-3" /> Instant
                    </Badge>
                  </div>

                  {/* Info Note - LOCKED DISCLAIMER */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {FLIGHT_DISCLAIMERS.ticketing}
                      </p>
                    </div>
                  </div>

                  {/* Book Button - LOCKED CTA TEXT */}
                  <Button
                    onClick={handleBookNow}
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white font-bold text-lg shadow-xl shadow-sky-500/30 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Lock className="w-5 h-5" />
                    {FLIGHT_CTA_TEXT.primary}
                    <ExternalLink className="w-5 h-5" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    ✓ Redirect to partner • ✓ Secure checkout
                  </p>

                  {/* Affiliate Disclosure */}
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                      <a href="/affiliate-disclosure" className="underline hover:text-foreground">
                        Affiliate Disclosure
                      </a>: We may earn a commission when you book through our partners.
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